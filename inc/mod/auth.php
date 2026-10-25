<?php

/*
 *  Copyright (c) 2010-2013 Tinyboard Development Group
 */

defined('TINYBOARD') or exit;

// Create a session token for validating moderator cookies.
// The token is derived from the user's password hash via HMAC-SHA256 keyed with
// the board-wide cookie salt, so the stored password hash itself is never sent
// to the client. When mod/lock_ip is enabled the client IP is mixed into the
// token, binding the session to that IP.
function mkhash($username, $password, $salt = null) {
global $config;

$data = $username . '|' . $password . '|' . ($salt === null ? '' : $salt);
if (!empty($config['mod']['lock_ip'])) {
$data .= '|' . ($_SERVER['REMOTE_ADDR'] ?? '');
}

return hash_hmac('sha256', $data, $config['cookies']['salt']);
}

// Generate a new random per-login salt for the session cookie.
function mkcookie_salt() {
return bin2hex(random_bytes(8));
}

// Cryptographically secure per-user password salt (32 hex chars, fits `salt` char(32)).
function generate_salt() {
return bin2hex(random_bytes(16));
}

// Hash a plaintext (already sha1()'d) password for storage. New hashes use bcrypt;
// the legacy format was hash('sha256', $salt . $password).
function mod_password_hash($hashed_input) {
return password_hash($hashed_input, PASSWORD_BCRYPT);
}

// Verify a submitted (sha1'd) password against the stored hash, transparently
// migrating legacy SHA-256-salted records to bcrypt on successful login.
function mod_password_verify($user, $password) {
if (strlen($user['password']) === 64 && ctype_xdigit($user['password'])) {
// Legacy: hash('sha256', salt . sha1(password)) — constant-time compare, then upgrade.
if (!hash_equals($user['password'], hash('sha256', $user['salt'] . $password))) {
return false;
}
$salt = generate_salt();
$newhash = mod_password_hash($password);
$q = prepare('UPDATE ``mods`` SET `password` = :password, `salt` = :salt WHERE `id` = :id');
$q->bindValue(':password', $newhash);
$q->bindValue(':salt', $salt);
$q->bindValue(':id', $user['id'], PDO::PARAM_INT);
$q->execute() or error(db_error($q));
$user['password'] = $newhash;
$user['salt'] = $salt;
return true;
}
return password_verify($password, $user['password']);
}

function login($username, $password, $makehash=true) {
	global $mod;
	
	// SHA1 password
	if ($makehash) {
		$password = sha1($password);
	}
	
	$query = prepare("SELECT `id`, `type`, `boards`, `password`, `salt` FROM ``mods`` WHERE `username` = :username");
	$query->bindValue(':username', $username);
	$query->execute() or error(db_error($query));
	
	if ($user = $query->fetch(PDO::FETCH_ASSOC)) {
		if (mod_password_verify($user, $password)) {
			$cookie_salt = mkcookie_salt();
			return $mod = array(
				'id' => $user['id'],
				'type' => $user['type'],
				'username' => $username,
				'hash' => array(mkhash($username, $user['password'], $cookie_salt), $cookie_salt),
				'boards' => explode(',', $user['boards'])
			);
		}
	}
	
	return false;
}

function setCookies() {
	global $mod, $config;
	if (!$mod)
		error('setCookies() was called for a non-moderator!');
	
	setcookie(
		$config['cookies']['mod'],
		$mod['username'] . ':' . $mod['hash'][0] . ':' . $mod['hash'][1], // username:token:salt
		array(
			'expires' => time() + $config['cookies']['expire'],
			'path' => $config['cookies']['jail'] ? $config['cookies']['path'] : '/',
			'secure' => boolval($config['cookies']['secure'] ?? false),
			'httponly' => $config['cookies']['httponly'],
			'samesite' => 'Lax'
		)
	);
}

function destroyCookies() {
	global $config;
	// Delete the cookies
	setcookie($config['cookies']['mod'], 'deleted', array(
		'expires' => time() - $config['cookies']['expire'],
		'path' => $config['cookies']['jail'] ? $config['cookies']['path'] : '/',
		'secure' => boolval($config['cookies']['secure'] ?? false),
		'httponly' => true,
		'samesite' => 'Lax'
	));
}

function modLog($action, $_board=null) {
	global $mod, $board, $config;
	$query = prepare("INSERT INTO ``modlogs`` VALUES (:id, :ip, :board, :time, :text)");
	$query->bindValue(':id', $mod['id'], PDO::PARAM_INT);
	$query->bindValue(':ip', $_SERVER['REMOTE_ADDR']);
	$query->bindValue(':time', time(), PDO::PARAM_INT);
	$query->bindValue(':text', $action);
	if (isset($_board))
		$query->bindValue(':board', $_board);
	elseif (isset($board))
		$query->bindValue(':board', $board['uri']);
	else
		$query->bindValue(':board', null, PDO::PARAM_NULL);
	$query->execute() or error(db_error($query));
	
	if ($config['syslog'])
		_syslog(LOG_INFO, '[mod/' . $mod['username'] . ']: ' . $action);
}

// Validate session

if (isset($_COOKIE[$config['cookies']['mod']])) {
	// Should be username:hash:salt
	$cookie = explode(':', $_COOKIE[$config['cookies']['mod']]);
	if (count($cookie) != 3) {
		// Malformed cookies
		destroyCookies();
		mod_login();
		exit;
	}
	
	$query = prepare("SELECT `id`, `type`, `boards`, `password` FROM ``mods`` WHERE `username` = :username");
	$query->bindValue(':username', $cookie[0]);
	$query->execute() or error(db_error($query));
	$user = $query->fetch(PDO::FETCH_ASSOC);
	
	// validate session token
	if (!$user || !hash_equals(mkhash($cookie[0], $user['password'], $cookie[2]), $cookie[1])) {
		// Malformed cookies
		destroyCookies();
		mod_login();
		exit;
	}
	
	$mod = array(
		'id' => $user['id'],
		'type' => $user['type'],
		'username' => $cookie[0],
		'boards' => explode(',', $user['boards'])
	);
}

function create_pm_header() {
	global $mod, $config;
	
	if ($config['cache']['enabled'] && ($header = cache::get('pm_unread_' . $mod['id'])) != false) {
		if ($header === true)
			return false;
	
		return $header;
	}
	
	$query = prepare("SELECT `id` FROM ``pms`` WHERE `to` = :id AND `unread` = 1");
	$query->bindValue(':id', $mod['id'], PDO::PARAM_INT);
	$query->execute() or error(db_error($query));
	
	if ($pm = $query->fetch(PDO::FETCH_ASSOC))
		$header = array('id' => $pm['id'], 'waiting' => $query->rowCount() - 1, 'new' => $query->rowCount());
	else
		$header = true;
	
	if ($config['cache']['enabled'])
		cache::set('pm_unread_' . $mod['id'], $header);
	
	if ($header === true)
		return false;
	
	return $header;
}

function make_secure_link_token($uri) {
	global $mod, $config;
	return substr(sha1($config['cookies']['salt'] . '-' . $uri . '-' . $mod['id']), 0, 8);
}


