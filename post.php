<?php

/*
 *  Copyright (c) 2010-2013 Tinyboard Development Group
 */

require 'inc/functions.php';
require 'inc/anti-bot.php';

// Fix for magic quotes
if (get_magic_quotes_gpc()) {
	function strip_array($var) {
		return is_array($var) ? array_map('strip_array', $var) : stripslashes($var);
	}
	
	$_GET = strip_array($_GET);
	$_POST = strip_array($_POST);
}

if (isset($_POST['delete'])) {
	// Delete
	
	if (!isset($_POST['board'], $_POST['password']))
		error($config['error']['bot']);
	
	$password = &$_POST['password'];
	
	if ($password == '')
		error($config['error']['invalidpassword']);
	
	$delete = array();
	foreach ($_POST as $post => $value) {
		if (preg_match('/^delete_(\d+)$/', $post, $m)) {
			$delete[] = (int)$m[1];
		}
	}
	
	checkDNSBL();
		
	// Check if board exists
	if (!openBoard($_POST['board']))
		error($config['error']['noboard']);
	
	// Check if banned
	checkBan($board['uri']);
	
	if (empty($delete))
		error($config['error']['nodelete']);
		
	foreach ($delete as &$id) {
		$query = prepare(sprintf("SELECT `thread`, `time`,`password` FROM ``posts_%s`` WHERE `id` = :id", $board['uri']));
		$query->bindValue(':id', $id, PDO::PARAM_INT);
		$query->execute() or error(db_error($query));
		
		if ($post = $query->fetch(PDO::FETCH_ASSOC)) {
			$thread = false;
			if ($config['user_moderation'] && $post['thread']) {
                $thread_query = prepare(sprintf("SELECT `time`,`password` FROM ``posts_%s`` WHERE `id` = :id", $board['uri']));
                $thread_query->bindValue(':id', $post['thread'], PDO::PARAM_INT);
                $thread_query->execute() or error(db_error($query));

                $thread = $thread_query->fetch(PDO::FETCH_ASSOC);
            }

            if ($password != '' && $post['password'] != $password && (!$thread || $thread['password'] != $password))
				error($config['error']['invalidpassword']);

			if ($post['time'] > time() - $config['delete_time'] && (!$thread || $thread['password'] != $password)) {
			    error(sprintf($config['error']['delete_too_soon'], until($post['time'] + $config['delete_time'])));
            } else if ($post['time'] <= time() - $config['delete_max_time'] && (!$thread || $thread['password'] != $password)) {
				error(sprintf($config['error']['delete_too_old']));
			}
			
			if (isset($_POST['file'])) {
				// Delete just the file
				deleteFile($id);
			} else {
				// Delete entire post
				deletePost($id);
			}
			
			_syslog(LOG_INFO, 'Deleted post: ' .
				'/' . $board['dir'] . $config['dir']['res'] . sprintf($config['file_page'], $post['thread'] ? $post['thread'] : $id) . ($post['thread'] ? '#' . $id : '')
			);
		}
	}
	
	buildIndex();


	rebuildThemes('post-delete', $board['uri']);
	
	$is_mod = isset($_POST['mod']) && $_POST['mod'];
	$root = $is_mod ? $config['root'] . $config['file_mod'] . '?/' : $config['root'];
	
	if (!isset($_POST['json_response'])) {
		header('Location: ' . $root . $board['dir'] . $config['file_index'], true, $config['redirect_http']);
	} else {
		header('Content-Type: text/json');
		echo json_encode(array('success' => true));
	}
} elseif (isset($_POST['report'])) {
	if (!isset($_POST['board'], $_POST['password'], $_POST['reason']))
		error($config['error']['bot']);
	
	$report = array();
	foreach ($_POST as $post => $value) {
		if (preg_match('/^delete_(\d+)$/', $post, $m)) {
			$report[] = (int)$m[1];
		}
	}
	
	checkDNSBL();
		
	// Check if board exists
	if (!openBoard($_POST['board']))
		error($config['error']['noboard']);
	
	// Check if banned
	checkBan($board['uri']);
	
	if (empty($report))
		error($config['error']['noreport']);
	
	if (count($report) > $config['report_limit'])
		error($config['error']['toomanyreports']);
	
	$reason = escape_markup_modifiers($_POST['reason']);
	markup($reason);
	
	foreach ($report as &$id) {
		$query = prepare(sprintf("SELECT `thread` FROM ``posts_%s`` WHERE `id` = :id", $board['uri']));
		$query->bindValue(':id', $id, PDO::PARAM_INT);
		$query->execute() or error(db_error($query));
		
		$thread = $query->fetchColumn();
		
		if ($config['syslog'])
			_syslog(LOG_INFO, 'Reported post: ' .
				'/' . $board['dir'] . $config['dir']['res'] . sprintf($config['file_page'], $thread ? $thread : $id) . ($thread ? '#' . $id : '') .
				' for "' . $reason . '"'
			);
		$query = prepare("INSERT INTO ``reports`` VALUES (NULL, :time, :ip, :board, :post, :reason)");
		$query->bindValue(':time', time(), PDO::PARAM_INT);
		$query->bindValue(':ip', $_SERVER['REMOTE_ADDR'], PDO::PARAM_STR);
		$query->bindValue(':board', $board['uri'], PDO::PARAM_INT);
		$query->bindValue(':post', $id, PDO::PARAM_INT);
		$query->bindValue(':reason', $reason, PDO::PARAM_STR);
		$query->execute() or error(db_error($query));
	}
	
	$is_mod = isset($_POST['mod']) && $_POST['mod'];
	$root = $is_mod ? $config['root'] . $config['file_mod'] . '?/' : $config['root'];
	
	if (!isset($_POST['json_response'])) {
		header('Location: ' . $root . $board['dir'] . $config['file_index'], true, $config['redirect_http']);
	} else {
		header('Content-Type: text/json');
		echo json_encode(array('success' => true));
	}
} elseif (isset($_POST['post'])) {
	if (!isset($_POST['body'], $_POST['board']))
		error($config['error']['bot']);
	
	if (!isset($_POST['name']))
		$_POST['name'] = $config['anonymous'];
	
	if (!isset($_POST['email']))
		$_POST['email'] = '';
	
	if (!isset($_POST['subject']))
		$_POST['subject'] = '';
	
	if (!isset($_POST['password']))
		$_POST['password'] = '';
	
	$post = array('board' => $_POST['board']);
	
	if (isset($_POST['thread'])) {
		$post['op'] = false;
		$post['thread'] = round($_POST['thread']);
	} elseif ($config['quick_reply'] && isset($_POST['quick-reply'])) {
		$post['op'] = false;
		$post['thread'] = round($_POST['quick-reply']);
	} else
		$post['op'] = true;
	
	if (!(($post['op'] && $_POST['post'] == $config['button_newtopic']) ||
	    (!$post['op'] && $_POST['post'] == $config['button_reply'])))
		error($config['error']['bot']);
	
	// Check the referrer
	// Actually, don't check the referer
	// if ($config['referer_match'] !== false &&
	// (!isset($_SERVER['HTTP_REFERER']) || !preg_match($config['referer_match'], urldecode($_SERVER['HTTP_REFERER']))))
	//	error($config['error']['referer']);
	
	checkDNSBL();
		
	// Check if board exists
	if (!openBoard($post['board']))
		error($config['error']['noboard']);
	
	// Check if banned
	checkBan($board['uri']);

	// CAPTCHA
	if ($config['captcha']) {
        if (isset($_POST['captcha']) and $_POST['captcha'] != "") {
            session_start();
            if (isset($_SESSION['captcha']) && strtoupper($_SESSION['captcha']) == strtoupper($_POST['captcha']))
                unset($_SESSION['captcha']);
            else {
                error($config['error']['captcha']);
                unset($_SESSION['captcha']);
            }
         } else
            error($config['error']['bot']);
	}

	// Check for CAPTCHA right after opening the board so the "return" link is in there
	if ($config['recaptcha']) {
		if (!isset($_POST['recaptcha_challenge_field']) || !isset($_POST['recaptcha_response_field']))
			error($config['error']['bot']);
		// Check what reCAPTCHA has to say...
		$resp = recaptcha_check_answer($config['recaptcha_private'],
			$_SERVER['REMOTE_ADDR'],
			$_POST['recaptcha_challenge_field'],
			$_POST['recaptcha_response_field']);
		if (!$resp->is_valid) {
			error($config['error']['captcha']);
		}
	}
	
	if ($post['mod'] = isset($_POST['mod']) && $_POST['mod']) {
		require 'inc/mod/auth.php';
		if (!$mod) {
			// Liar. You're not a mod.
			error($config['error']['notamod']);
		}
		
		$post['sticky'] = $post['op'] && isset($_POST['sticky']);
		$post['locked'] = $post['op'] && isset($_POST['lock']);
		$post['raw'] = isset($_POST['raw']);
		
		if ($post['sticky'] && !hasPermission($config['mod']['sticky'], $board['uri']))
			error($config['error']['noaccess']);
		if ($post['locked'] && !hasPermission($config['mod']['lock'], $board['uri']))
			error($config['error']['noaccess']);
		if ($post['raw'] && !hasPermission($config['mod']['rawhtml'], $board['uri']))
			error($config['error']['noaccess']);
	}
	
	if (!$post['mod'] && $config['spam']['checking_enabled']) {
		$post['antispam_hash'] = checkSpam(array($board['uri'], isset($post['thread']) && !($config['quick_reply'] && isset($_POST['quick-reply'])) ? $post['thread'] : ($config['try_smarter'] && isset($_POST['page']) ? 0 - (int)$_POST['page'] : null)));
		if ($post['antispam_hash'] === true)
			error($config['error']['spam']);
	}
	
	if ($config['robot_enable'] && $config['robot_mute']) {
		checkMute();
	}
	
	//Check if thread exists
	if (!$post['op']) {
		$query = prepare(sprintf("SELECT `sticky`,`locked`,`sage` FROM ``posts_%s`` WHERE `id` = :id AND `thread` IS NULL LIMIT 1", $board['uri']));
		$query->bindValue(':id', $post['thread'], PDO::PARAM_INT);
		$query->execute() or error(db_error());
		
		if (!$thread = $query->fetch(PDO::FETCH_ASSOC)) {
			// Non-existant
			error($config['error']['nonexistant']);
		}
	}
		
	
	// Check for an embed field
	if ($config['enable_embedding'] && isset($_POST['embed']) && !empty($_POST['embed'])) {
		// yep; validate it
		$value = $_POST['embed'];
		foreach ($config['embedding'] as &$embed) {
			if (preg_match($embed[0], $value)) {
				// Valid link
				$post['embed'] = $value;
				// This is bad, lol.
				$post['no_longer_require_an_image_for_op'] = true;
				break;
			}
		}
		if (!isset($post['embed'])) {
			error($config['error']['invalid_embed']);
		}
	}
	
	if (!hasPermission($config['mod']['bypass_field_disable'], $board['uri'])) {
		if ($config['field_disable_name'])
			$_POST['name'] = $config['anonymous']; // "forced anonymous"
	
		if ($config['field_disable_email'])
			$_POST['email'] = '';
	
		if ($config['field_disable_password'])
			$_POST['password'] = '';
	
		if ($config['field_disable_subject'] || (!$post['op'] && $config['field_disable_reply_subject']))
			$_POST['subject'] = '';
	}
	
	if ($config['allow_upload_by_url'] && isset($_POST['file_url']) && !empty($_POST['file_url'])) {
		$post['file_url'] = $_POST['file_url'];
		if (!preg_match('@^https?://@', $post['file_url']))
			error($config['error']['invalidimg']);
		
		if (mb_strpos($post['file_url'], '?') !== false)
			$url_without_params = mb_substr($post['file_url'], 0, mb_strpos($post['file_url'], '?'));
		else
			$url_without_params = $post['file_url'];

		$post['extension'] = strtolower(mb_substr($url_without_params, mb_strrpos($url_without_params, '.') + 1));
		if (!in_array($post['extension'], $config['allowed_ext']) && !in_array($post['extension'], $config['allowed_ext_files']))
			error($config['error']['unknownext']);

		$post['file_tmp'] = tempnam($config['tmp'], 'url');
		function unlink_tmp_file($file) {
			@unlink($file);
			fatal_error_handler();
		}
		register_shutdown_function('unlink_tmp_file', $post['file_tmp']);
		
		$fp = fopen($post['file_tmp'], 'w');
		
		$curl = curl_init();
		curl_setopt($curl, CURLOPT_URL, $post['file_url']);
		curl_setopt($curl, CURLOPT_FAILONERROR, true);
		curl_setopt($curl, CURLOPT_FOLLOWLOCATION, false);
		curl_setopt($curl, CURLOPT_CONNECTTIMEOUT, 5);
		curl_setopt($curl, CURLOPT_TIMEOUT, $config['upload_by_url_timeout']);
		curl_setopt($curl, CURLOPT_USERAGENT, 'Tinyboard');
		curl_setopt($curl, CURLOPT_BINARYTRANSFER, true);
		curl_setopt($curl, CURLOPT_FILE, $fp);
		curl_setopt($curl, CURLOPT_PROTOCOLS, CURLPROTO_HTTP | CURLPROTO_HTTPS);
		
		if (curl_exec($curl) === false)
			error($config['error']['nomove']);
		
		curl_close($curl);
		
		fclose($fp);

		$_FILES['file'] = array(
			'name' => basename($url_without_params),
			'tmp_name' => $post['file_tmp'],
			'error' => 0,
			'size' => filesize($post['file_tmp'])
		);
	}

	// Random image
	if ($config['derpibooru_random'] || $config['danbooru_random'] || $config['giphy_random']) {
		if (($post['op'] && !isset($post['no_longer_require_an_image_for_op']) && $config['force_image_op']) || (isset($_FILES['file']) && $_FILES['file']['tmp_name'] != '')) {
        	$_POST['email'] = '';
        } else {
			switch ($_POST['email']) {

				// Derpibooru random
				case (preg_match('/^#ponyrand(:\"(.+)\")?$/', $_POST['email'], $booruTagFound) ? $_POST['email'] : !$_POST['email']):
				case (preg_match('/^#derprand(:\"(.+)\")?$/', $_POST['email'], $booruTagFound) ? $_POST['email'] : !$_POST['email']):
				case (preg_match('/^#random(:\"(.+)\")?$/', $_POST['email'], $booruTagFound) ? $_POST['email'] : !$_POST['email']):
					$provider = 'derpibooru';
					if ($config['derpibooru_random']) {
						if (count($booruTagFound) === 1) {
							// No tags found
							$booruRand = json_decode(file_get_contents('https://derpiboo.ru/images/random.json?key=' . $_POST['derpibooruAPIKey']));
						} else {
							// Tags are in $booruTagFound[2]
							$booruTag = str_replace(" ", "+", $booruTagFound[2]);
                           	if (isset($_POST['derpibooruAPIKey']) && ($_POST['derpibooruAPIKey'] != ''))
                                $booruRand = json_decode(file_get_contents('https://derpiboo.ru/search.json?q=' . $booruTag . '&key=' . $_POST['derpibooruAPIKey'] . '&random_image=y'));
                            else
                                $booruRand = json_decode(file_get_contents('https://derpiboo.ru/search.json?q=' . $booruTag . '&random_image=y'));
						}

						if (!isset($booruRand->{'id'}))
                         	error($config['error']['invalidtag']);

                    	$booruRandJSON = json_decode(file_get_contents('https://derpiboo.ru/' . $booruRand->{'id'} . '.json'));
                    	$post['file_url'] = 'https:' . $booruRandJSON->{"image"};

                    	if (!preg_match('@^https?://(.+\.)?derpicdn.net/@', $post['file_url']))
                        	error($config['error']['invalidimg']);
					} else
						error('This feature is disabled.');
				break;

				// Danbooru random
				case (preg_match('/^#danrand(:\"(.+)\")?$/', $_POST['email'], $booruTagFound) ? $_POST['email'] : !$_POST['email']):
					$provider = 'danbooru';
					if ($config['danbooru_random']) {
						if (count($booruTagFound) === 1) {
							// No tags found
							// This little one simply donwloads a nice tiny json with the latest post on danbooru.
							$booruMaxJSON = json_decode(file_get_contents('https://danbooru.donmai.us/posts.json?limit=1'));
							$booruRand = mt_rand(1, $booruMaxJSON[0]->{"id"});
						} else {
							// Tags are in $booruTagFound[2]
							// Pretty sure there should be a function for this
							$booruTag = str_replace(" ", "_", $booruTagFound[2]);
							$booruTag = str_replace("!", "%21", $booruTag);
							$booruTag = str_replace("&", "%26", $booruTag);
							$booruTag = str_replace("\(", "%28", $booruTag);
							$booruTag = str_replace("\)", "%29", $booruTag);
							// search[name] is also useful, allows multiple tags search
							// TODO: check $booruTagFound and search with search[name] when commas found
							$booruMaxJSON = json_decode(file_get_contents('https://danbooru.donmai.us/tags.json?search[name_matches]=' . $booruTag));
							if (empty($booruMaxJSON))
								error($config['error']['invalidtag']);
							$booruRandPage = mt_rand(1, $booruMaxJSON[0]->{"post_count"}/20);
							// Danbooru have a limit on maximum displayed pages (1000). I don't have any clue why they did that, but whatever.
							if ($booruRandPage > 1000)
								$booruRandPage = mt_rand(1, 1000);
							$booruRandPageJSON = json_decode(file_get_contents('https://danbooru.donmai.us/posts.json?tags=' . $booruTag . '&page=' . $booruRandPage));
							// Well I already wrote a nice name generator, I don't really want to think about a workaround here.
							// So let's just proceed to downloading JSON again, even when /posts.json can give all info we need.
							$booruRand = $booruRandPageJSON[mt_rand(1, count ($booruRandPageJSON))]->{"id"};
							// count() is here for a reason - last search page may not contain 20 pics.
						}

						// Danbooru allows 500 json requests per hour without API key. We're making at least two requests per image.
						// TODO: API key support
						$booruRandJSON = json_decode(file_get_contents('https://danbooru.donmai.us/posts/' . $booruRand . '.json'));
						$post['file_url'] = 'https://danbooru.donmai.us' . $booruRandJSON->{"file_url"};

						// This is still a shitty way to check and upload images.
						// TODO: merge with upload by url
						if (!preg_match('@^https?://danbooru.donmai.us/@', $post['file_url']))
							error($config['error']['invalidimg']);
					} else
						error('This feature is disabled.');
				break;

				// Safebooru random
				case (preg_match('/^#saferand(:\"(.+)\")?$/', $_POST['email'], $booruTagFound) ? $_POST['email'] : !$_POST['email']):
					$provider = 'safebooru';
					if ($config['safebooru_random']) {
						if (count($booruTagFound) === 1) {
							// No tags found
							$booruMaxXML = file_get_contents('http://safebooru.org/index.php?page=dapi&s=post&q=index&limit=0');
							$booruXML = xml_parser_create();
							xml_parse_into_struct($booruXML, $booruMaxXML, $booruXMLDecoded);
							xml_parser_free($booruXML);
							$booruRand = mt_rand(0, $booruXMLDecoded[0]["attributes"]["COUNT"]-1);
							$booruRandXML = file_get_contents('http://safebooru.org/index.php?page=dapi&s=post&q=index&limit=1&pid=' . $booruRand);
						} else {
							// Tags are in $booruTagFound[2]
							// Pretty sure there should be a function for this
							$booruTag = str_replace("!", "%21", $booruTagFound[2]);
							$booruTag = str_replace("&", "%26", $booruTag);
							$booruTag = str_replace("\(", "%28", $booruTag);
							$booruTag = str_replace("\)", "%29", $booruTag);
							$booruMaxXML = file_get_contents('http://safebooru.org/index.php?page=dapi&s=post&q=index&limit=0&tags=' . $booruTag);
							$booruXML = xml_parser_create();
							xml_parse_into_struct($booruXML, $booruMaxXML, $booruXMLDecoded);
							xml_parser_free($booruXML);
							if ($booruXMLDecoded[0]["attributes"]["COUNT"] === '0')
								error($config['error']['invalidtag']);
							$booruRand = mt_rand(0, $booruXMLDecoded[0]["attributes"]["COUNT"]-1);
							$booruRandXML = file_get_contents('http://safebooru.org/index.php?page=dapi&s=post&q=index&limit=1&tags=' . $booruTag . '&pid=' . $booruRand);
						}

						$booruXML = xml_parser_create();
                        xml_parse_into_struct($booruXML, $booruRandXML, $booruXMLDecoded);
                        xml_parser_free($booruXML);

						$post['file_url'] = $booruXMLDecoded[1]["attributes"]["FILE_URL"];

						if (!preg_match('@^https?://safebooru.org/@', $post['file_url']))
                        	error($config['error']['invalidimg']);
					} else
						error('This feature is disabled.');
				break;

				// Gelbooru random
				case (preg_match('/^#gelrand(:\"(.+)\")?$/', $_POST['email'], $booruTagFound) ? $_POST['email'] : !$_POST['email']):
					$provider = 'gelbooru';
					if ($config['gelbooru_random']) {
						if (count($booruTagFound) === 1) {
							// No tags found
							$booruMaxXML = file_get_contents('http://gelbooru.com/index.php?page=dapi&s=post&q=index&limit=0');
							$booruXML = xml_parser_create();
							xml_parse_into_struct($booruXML, $booruMaxXML, $booruXMLDecoded);
							xml_parser_free($booruXML);
							$booruRand = mt_rand(0, $booruXMLDecoded[0]["attributes"]["COUNT"]-1);
							$booruRandXML = file_get_contents('http://gelbooru.com/index.php?page=dapi&s=post&q=index&limit=1&pid=' . $booruRand);
						} else {
							// Tags are in $booruTagFound[2]
							// Pretty sure there should be a function for this
							$booruTag = str_replace("!", "%21", $booruTagFound[2]);
							$booruTag = str_replace("&", "%26", $booruTag);
							$booruTag = str_replace("\(", "%28", $booruTag);
							$booruTag = str_replace("\)", "%29", $booruTag);
							$booruMaxXML = file_get_contents('http://gelbooru.com/index.php?page=dapi&s=post&q=index&limit=0&tags=' . $booruTag);
							$booruXML = xml_parser_create();
							xml_parse_into_struct($booruXML, $booruMaxXML, $booruXMLDecoded);
							xml_parser_free($booruXML);
							if ($booruXMLDecoded[0]["attributes"]["COUNT"] === '0')
								error($config['error']['invalidtag']);
							$booruRand = mt_rand(0, $booruXMLDecoded[0]["attributes"]["COUNT"]-1);
							$booruRandXML = file_get_contents('http://gelbooru.com/index.php?page=dapi&s=post&q=index&limit=1&tags=' . $booruTag . '&pid=' . $booruRand);
						}

						$booruXML = xml_parser_create();
                        xml_parse_into_struct($booruXML, $booruRandXML, $booruXMLDecoded);
                        xml_parser_free($booruXML);

						$post['file_url'] = $booruXMLDecoded[1]["attributes"]["FILE_URL"];

						if (!preg_match('@^https?://(.+\.)?gelbooru.com/@', $post['file_url']))
                        	error($config['error']['invalidimg']);
					} else
						error('This feature is disabled.');
				break;

				// Giphy random
				case (preg_match('/^#gifrand(:\"(.+)\")?$/', $_POST['email'], $booruTagFound) ? $_POST['email'] : !$_POST['email']) :
					$provider = 'giphy';
					if ($config['giphy_random']) {
						if (count($booruTagFound) === 1) {
							// No tags found
							$booruRandJSON = json_decode(file_get_contents('http://api.giphy.com/v1/gifs/random?api_key=' . $config['giphyAPIKey']));
						} else {
							// Tags are in $booruTagFound[2]
							$booruTag = str_replace(" ", "+", $booruTagFound[2]);
							$booruRandJSON = json_decode(file_get_contents('http://api.giphy.com/v1/gifs/random?api_key=' . $config['giphyAPIKey'] . '&tag=' . $booruTag));
						}
						if (!isset($booruRandJSON->{'data'}->{'id'}))
							error($config['error']['invalidtag']);

						$post['file_url'] = ($booruRandJSON->{'data'}->{'image_url'});

						if (!preg_match('@^https?://s3.amazonaws.com/giphymedia/media/@', $post['file_url']))
							 error($config['error']['invalidimg']);
					} else
						error('This feature is disabled.');
				break;
			}

			if (isset($provider)) {
				if (mb_strpos($post['file_url'], '?') !== false)
					$url_without_params = mb_substr($post['file_url'], 0, mb_strpos($post['file_url'], '?'));
				else
					$url_without_params = $post['file_url'];

				$post['extension'] = strtolower(mb_substr($url_without_params, mb_strrpos($url_without_params, '.') + 1));
				if (!in_array($post['extension'], $config['allowed_ext']) && !in_array($post['extension'], $config['allowed_ext_files']))
					error($config['error']['unknownext']);

				$post['file_tmp'] = tempnam($config['tmp'], 'url');
				function unlink_tmp_file($file) {
					@unlink($file);
					fatal_error_handler();
				}
				register_shutdown_function('unlink_tmp_file', $post['file_tmp']);

				$fp = fopen($post['file_tmp'], 'w');

				$curl = curl_init();
				curl_setopt($curl, CURLOPT_URL, $post['file_url']);
				curl_setopt($curl, CURLOPT_FAILONERROR, true);
				curl_setopt($curl, CURLOPT_FOLLOWLOCATION, false);
				curl_setopt($curl, CURLOPT_CONNECTTIMEOUT, 5);
				curl_setopt($curl, CURLOPT_TIMEOUT, $config['upload_by_url_timeout']);
				curl_setopt($curl, CURLOPT_USERAGENT, 'Fukuro/5.0 Tinyboard/0.9.6.22');
				curl_setopt($curl, CURLOPT_BINARYTRANSFER, true);
				curl_setopt($curl, CURLOPT_FILE, $fp);
				curl_setopt($curl, CURLOPT_PROTOCOLS, CURLPROTO_HTTP | CURLPROTO_HTTPS);

				if (curl_exec($curl) === false)
					error($config['error']['nomove']);

				curl_close($curl);

				fclose($fp);

				// These are more useful for $config['autospoiler_images']
				$danbooruRatings = array(
					"s" => "safe",
					"q" => "questionable",
					"e" => "explicit",
				);

				$giphyRatings = array(
					"y" => "safe",
					"g" => "safe",
					"pg" => "suggestive",
					"pg-13" => "questionable",
					"r" => "explicit",
				);

				switch ($provider) {
					case "danbooru":
						// I personally not found <md5.ext> filename anyhow useful.
						$tempFilename = $booruRandJSON->{"id"} . '_' . $booruRandJSON->{"tag_string_character"}
							. '_' . $danbooruRatings[$booruRandJSON->{"rating"}] . '_' . $booruRandJSON->{"tag_string_general"}
							. '.' . $booruRandJSON->{"file_ext"};
					break;

					case "safebooru":
					case "gelbooru":
						$tempFilename = $booruXMLDecoded[1]["attributes"]["ID"] . '_' . $danbooruRatings[$booruXMLDecoded[1]["attributes"]["RATING"]]
							. "_" . substr($booruXMLDecoded[1]["attributes"]["TAGS"], 1, -1)
							. "." . pathinfo($booruXMLDecoded[1]["attributes"]["FILE_URL"], PATHINFO_EXTENSION);
					break;

					case "giphy":
						$tempFilename = $booruRandJSON->{'data'}->{'id'} . '_' . $giphyRatings[$booruRandJSON->{'data'}->{'rating'}]
							. '_' . (implode("_", $booruRandJSON->{'data'}->{'tags'})) . ".gif";
					break;

					default:
						$tempFilename = basename($url_without_params);
					break;
				}

				$_FILES['file'] = array(
					'name' => $tempFilename,
					'tmp_name' => $post['file_tmp'],
					'error' => 0,
					'size' => filesize($post['file_tmp'])
				);
			}
		}
	}

	// Check for a file
	if ($post['op'] && !isset($post['no_longer_require_an_image_for_op'])) {
		if (!isset($_FILES['file']['tmp_name']) || $_FILES['file']['tmp_name'] == '' && $config['force_image_op'])
			error($config['error']['noimage']);
	}
	
	$post['name'] = $_POST['name'] != '' ? $_POST['name'] : $config['anonymous'];
	$post['subject'] = $_POST['subject'];
	$post['email'] = str_replace(' ', '%20', htmlspecialchars($_POST['email']));
	$post['body'] = $_POST['body'];
	$post['password'] = $_POST['password'];
	$post['has_file'] = (($post['op'] && !isset($post['no_longer_require_an_image_for_op']) && $config['force_image_op']) || (isset($_FILES['file']) && $_FILES['file']['tmp_name'] != ''));
	
	if ($post['has_file']) {
		if (strtolower($post['email']) == '#hide') {
			$post['filename'] = "hidden." . pathinfo(urldecode(get_magic_quotes_gpc() ? stripslashes($_FILES['file']['name']) : $_FILES['file']['name']), PATHINFO_EXTENSION);
		} else {
			$post['filename'] = urldecode(get_magic_quotes_gpc() ? stripslashes($_FILES['file']['name']) : $_FILES['file']['name']);
		}
	}
	
	if (!($post['has_file'] || isset($post['embed'])) || (($post['op'] && $config['force_body_op']) || (!$post['op'] && $config['force_body']))) {
		$stripped_whitespace = preg_replace('/[\s]/u', '', $post['body']);
		if ($stripped_whitespace == '') {
			error($config['error']['tooshort_body']);
		}
	}
	
	if (!$post['op']) {
		// Check if thread is locked
		// but allow mods to post
		if ($thread['locked'] && !hasPermission($config['mod']['postinlocked'], $board['uri']))
			error($config['error']['locked']);
		
		$numposts = numPosts($post['thread']);
		
		if ($config['reply_hard_limit'] != 0 && $config['reply_hard_limit'] <= $numposts['replies'])
			error($config['error']['reply_hard_limit']);
		
		if ($post['has_file'] && $config['image_hard_limit'] != 0 && $config['image_hard_limit'] <= $numposts['images'])
			error($config['error']['image_hard_limit']);
	}
		
	if ($post['has_file']) {
		$size = $_FILES['file']['size'];
		if ($size > $config['max_filesize'])
			error(sprintf3($config['error']['filesize'], array(
				'sz' => number_format($size),
				'filesz' => number_format($size),
				'maxsz' => number_format($config['max_filesize'])
			)));
	}
	
	
	$post['capcode'] = false;
	
	if ($mod && preg_match('/^((.+) )?## (.+)$/', $post['name'], $matches)) {
		$name = $matches[2] != '' ? $matches[2] : $config['anonymous'];
		$cap = $matches[3];
		
		if (isset($config['mod']['capcode'][$mod['type']])) {
			if (	$config['mod']['capcode'][$mod['type']] === true ||
				(is_array($config['mod']['capcode'][$mod['type']]) &&
					in_array($cap, $config['mod']['capcode'][$mod['type']])
				)) {
				
				$post['capcode'] = utf8tohtml($cap);
				$post['name'] = $name;
			}
		}
	}
	
	$trip = generate_tripcode($post['name']);
	$post['name'] = $trip[0];
	$post['trip'] = isset($trip[1]) ? $trip[1] : '';
	
	if (strtolower($post['email']) == 'noko') {
		$noko = true;
		$post['email'] = '';
	} else $noko = false;
	
	if ($post['has_file']) {
		$post['extension'] = strtolower(mb_substr($post['filename'], mb_strrpos($post['filename'], '.') + 1));
		if (isset($config['filename_func']))
			$post['file_id'] = $config['filename_func']($post);
		else
			$post['file_id'] = time() . substr(microtime(), 2, 3);

		$thumbfiledir = 'cdn/thumb/' . substr(time(), 0, 3) . '/' . substr(time(), 3, 2)  . '/' . substr(time(), 5, 2);
        if (!file_exists($thumbfiledir) and !is_dir($thumbfiledir)) {
            mkdir ($thumbfiledir, 0777, true);
        }
		$srcfiledir = 'cdn/src/' . substr(time(), 0, 3) . '/' . substr(time(), 3, 2)  . '/' . substr(time(), 5, 2);
        if (!file_exists($srcfiledir) and !is_dir($srcfiledir)) {
            mkdir ($srcfiledir, 0777, true);
        }
		$post['file'] = 'cdn/src/' . substr(time(), 0, 3) . '/' . substr(time(), 3, 2)  . '/' . substr(time(), 5, 2) . '/' . $post['file_id'] . '.' . $post['extension'];
		$post['thumb'] = 'cdn/thumb/' . substr(time(), 0, 3) . '/' . substr(time(), 3, 2)  . '/' . substr(time(), 5, 2) . '/' .  $post['file_id'] . '.' . ($config['thumb_ext'] ? $config['thumb_ext'] : $post['extension']);
	}
	
	if ($config['strip_combining_chars']) {
		$post['name'] = strip_combining_chars($post['name']);
		$post['email'] = strip_combining_chars($post['email']);
		$post['subject'] = strip_combining_chars($post['subject']);
		$post['body'] = strip_combining_chars($post['body']);
	}
	
	// Check string lengths
	if (mb_strlen($post['name']) > 35)
		error(sprintf($config['error']['toolong'], 'name'));	
	if (mb_strlen($post['email']) > $config['max_email'])
		error(sprintf($config['error']['toolong'], 'email'));
	if (mb_strlen($post['subject']) > 100)
		error(sprintf($config['error']['toolong'], 'subject'));
	if (!$mod && mb_strlen($post['body']) > $config['max_body'])
		error($config['error']['toolong_body']);
	if (mb_strlen($post['password']) > 20)
		error(sprintf($config['error']['toolong'], 'password'));
		
	wordfilters($post['body']);
	
	$post['body'] = escape_markup_modifiers($post['body']);
	
	if ($mod && isset($post['raw']) && $post['raw']) {
		$post['body'] .= "\n<tinyboard raw html>1</tinyboard>";
	}
	
	if ($config['country_flags']) {
		if (!geoip_db_avail(GEOIP_COUNTRY_EDITION)) {
			error('GeoIP not available: ' . geoip_db_filename(GEOIP_COUNTRY_EDITION));
		}
		if ($country_code = @geoip_country_code_by_name($_SERVER['REMOTE_ADDR'])) {
			if (!in_array(strtolower($country_code), array('eu', 'ap', 'o1', 'a1', 'a2')))
				$post['body'] .= "\n<tinyboard flag>" . strtolower($country_code) . "</tinyboard>" .
					"\n<tinyboard flag alt>" . @geoip_country_name_by_name($_SERVER['REMOTE_ADDR']) . "</tinyboard>";
		}
	}
	
	if (mysql_version() >= 50503) {
		$post['body_nomarkup'] = $post['body']; // Assume we're using the utf8mb4 charset
	} else {
		// MySQL's `utf8` charset only supports up to 3-byte symbols
		// Remove anything >= 0x010000
		
		$chars = preg_split('//u', $post['body'], -1, PREG_SPLIT_NO_EMPTY);
		$post['body_nomarkup'] = '';
		foreach ($chars as $char) {
			$o = 0;
			$ord = ordutf8($char, $o);
			if ($ord >= 0x010000)
				continue;
			$post['body_nomarkup'] .= $char;
		}
	}
	
	$post['tracked_cites'] = markup($post['body'], true);

	
	
	if ($post['has_file']) {
		if (!in_array($post['extension'], $config['allowed_ext']) && !in_array($post['extension'], $config['allowed_ext_files']))
			error($config['error']['unknownext']);
		
		$is_an_image = !in_array($post['extension'], $config['allowed_ext_files']);
		
		// Truncate filename if it is too long
		$post['filename'] = mb_substr($post['filename'], 0, $config['max_filename_len']);
		
		$upload = $_FILES['file']['tmp_name'];
		
		if (!is_readable($upload))
			error($config['error']['nomove']);
		
		$post['filehash'] = md5_file($upload);
		$post['filesize'] = filesize($upload);
	}
	
	if (!hasPermission($config['mod']['bypass_filters'], $board['uri'])) {
		require_once 'inc/filters.php';	
		
		do_filters($post);
	}
	
	if ($post['has_file']) {	
		if ($is_an_image && $config['ie_mime_type_detection'] !== false) {
			// Check IE MIME type detection XSS exploit
			$buffer = file_get_contents($upload, null, null, null, 255);
			if (preg_match($config['ie_mime_type_detection'], $buffer)) {
				undoImage($post);
				error($config['error']['mime_exploit']);
			}
			
			require_once 'inc/image.php';
			
			// find dimensions of an image using GD
			if (!$size = @getimagesize($upload)) {
				error($config['error']['invalidimg']);
			}
			if ($size[0] > $config['max_width'] || $size[1] > $config['max_height']) {
				error($config['error']['maxsize']);
			}
			
			
			if ($config['convert_auto_orient'] && ($post['extension'] == 'jpg' || $post['extension'] == 'jpeg')) {
				// The following code corrects the image orientation.
				// Currently only works with the 'convert' option selected but it could easily be expanded to work with the rest if you can be bothered.
				if (!($config['redraw_image'] || (($config['strip_exif'] && !$config['use_exiftool']) && ($post['extension'] == 'jpg' || $post['extension'] == 'jpeg')))) {
					if (in_array($config['thumb_method'], array('convert', 'convert+gifsicle', 'gm', 'gm+gifsicle'))) {
						$exif = @exif_read_data($upload);
						$gm = in_array($config['thumb_method'], array('gm', 'gm+gifsicle'));
						if (isset($exif['Orientation']) && $exif['Orientation'] != 1) {
							if ($config['convert_manual_orient']) {
								$error = shell_exec_error(($gm ? 'gm ' : '') . 'convert ' .
									escapeshellarg($upload) . ' ' .
									ImageConvert::jpeg_exif_orientation(false, $exif) . ' ' .
									($config['strip_exif'] ? '+profile "*"' :
										($config['use_exiftool'] ? '' : '+profile "*"')
									) . ' ' .
									escapeshellarg($upload));
								if ($config['use_exiftool'] && !$config['strip_exif']) {
									if ($exiftool_error = shell_exec_error(
										'exiftool -overwrite_original -q -q -orientation=1 -n ' .
											escapeshellarg($upload)))
										error('exiftool failed!', null, $exiftool_error);
								} else {
									// TODO: Find another way to remove the Orientation tag from the EXIF profile
									// without needing `exiftool`.
								}
							} else {
								$error = shell_exec_error(($gm ? 'gm ' : '') . 'convert ' .
										escapeshellarg($upload) . ' -auto-orient ' . escapeshellarg($upload));
							}
							if ($error)
								error('Could not auto-orient image!', null, $error);
							$size = @getimagesize($upload);
							if ($config['strip_exif'])
								$post['exif_stripped'] = true;
						}
					}
				}
			}
			
			// create image object
			$image = new Image($upload, $post['extension'], $size);
			if ($image->size->width > $config['max_width'] || $image->size->height > $config['max_height']) {
				$image->delete();
				error($config['error']['maxsize']);
			}
			
			$post['width'] = $image->size->width;
			$post['height'] = $image->size->height;
			
			if ($config['minimum_copy_resize'] &&
				$image->size->width <= $config['thumb_width'] &&
				$image->size->height <= $config['thumb_height'] &&
				$post['extension'] == ($config['thumb_ext'] ? $config['thumb_ext'] : $post['extension'])) {
			
				// Copy, because there's nothing to resize
				copy($upload, $post['thumb']);
			
				$post['thumbwidth'] = $image->size->width;
				$post['thumbheight'] = $image->size->height;
			} else {
				$thumb = $image->resize(
					$config['thumb_ext'] ? $config['thumb_ext'] : $post['extension'],
					$post['op'] ? $config['thumb_op_width'] : $config['thumb_width'],
					$post['op'] ? $config['thumb_op_height'] : $config['thumb_height']
				);
				
				$thumb->to($post['thumb']);
			
				$post['thumbwidth'] = $thumb->width;
				$post['thumbheight'] = $thumb->height;
				
				if (($config['spoiler_images'] && isset($_POST['spoiler'])) ||
				($config['spoiler_images'] && $config['autospoiler_images'] && strposa($post['filename'], $config['autospoiler_tags'])))  {
					$post['thumb'] = 'spoiler';
				}
				
				$thumb->_destroy();
			}
			
			if ($config['redraw_image'] || (!@$post['exif_stripped'] && $config['strip_exif'] && ($post['extension'] == 'jpg' || $post['extension'] == 'jpeg'))) {
				if (!$config['redraw_image'] && $config['use_exiftool']) {
					if($error = shell_exec_error('exiftool -overwrite_original -ignoreMinorErrors -q -q -all= ' .
						escapeshellarg($upload)))
						error('Could not strip EXIF metadata!', null, $error);
				} else {
					$image->to($post['file']);
					$dont_copy_file = true;
				}
			}
			$image->destroy();
		} else {
			// not an image
			//copy($config['file_thumb'], $post['thumb']);
			$post['thumb'] = 'file';

			$size = @getimagesize(sprintf($config['file_thumb'],
				isset($config['file_icons'][$post['extension']]) ?
					$config['file_icons'][$post['extension']] : $config['file_icons']['default']));
			$post['thumbwidth'] = $size[0];
			$post['thumbheight'] = $size[1];
		}
		
		if (!isset($dont_copy_file) || !$dont_copy_file) {
			if (isset($post['file_tmp'])) {
				if (!@rename($upload, $post['file']))
					error($config['error']['nomove']);
				chmod($post['file'], 0644);
			} elseif (!@move_uploaded_file($upload, $post['file']))
				error($config['error']['nomove']);
		}
	}
	
	if ($post['has_file']) {
		if ($config['image_reject_repost']) {
			if ($p = getPostByHash($post['filehash'])) {
				undoImage($post);
				error(sprintf($config['error']['fileexists'], 
					$post['mod'] ? $config['root'] . $config['file_mod'] . '?/' : $config['root'] .
					$board['dir'] . $config['dir']['res'] .
						($p['thread'] ?
							$p['thread'] . '.html#' . $p['id']
						:
							$p['id'] . '.html'
						)
				));
			}
		} else if (!$post['op'] && $config['image_reject_repost_in_thread']) {
			if ($p = getPostByHashInThread($post['filehash'], $post['thread'])) {
				undoImage($post);
				error(sprintf($config['error']['fileexistsinthread'], 
					$post['mod'] ? $config['root'] . $config['file_mod'] . '?/' : $config['root'] .
					$board['dir'] . $config['dir']['res'] .
						($p['thread'] ?
							$p['thread'] . '.html#' . $p['id']
						:
							$p['id'] . '.html'
						)
				));
			}
		}
	}
	
	if (!hasPermission($config['mod']['postunoriginal'], $board['uri']) && $config['robot_enable'] && checkRobot($post['body_nomarkup'])) {
		undoImage($post);
		if ($config['robot_mute']) {
			error(sprintf($config['error']['muted'], mute()));
		} else {
			error($config['error']['unoriginal']);
		}
	}
	
	// Letstry
	
	if ($config['letstry'] && (!$post['op'] && (strtolower($post['email']) == '#letstry') ||
	($config['letstry_random']['enabled'] && (mt_rand(1, $config['letstry_random']['max']) == $config['letstry_random']['luck'])))) {
		$post['body'] = $post['body'] . $config['letstry_quotes'][mt_rand(0, count($config['letstry_quotes']) - 1)];
	}
	
	// Magic 8 Ball
	
	if ($config['magic8ball'] && (!$post['op'] && strtolower($post['email']) == '#8ball')) {
		$post['body'] = $post['body'] . $config['magic8ball_quotes'][mt_rand (0, (count($config['magic8ball_quotes'])-1))];
	}

	// Dice function
		function dice($dicematches) {
			$dices = round($dicematches[1]);
			$edges = round($dicematches[2]);
			/*if (isset($dicematches[3]) {
				$add = round($dicematches[3]);
			}*/
			$sum = 0;
			$result = '';
			
			if ($dices > 20) {
				$dices = 20;
			}
			
			if ($dices < 1) {
				$dices = 1;
			}
			
			if ($edges >= 100000) {
				$edges = 100000;
			}

			if ($edges < 1) {
				$edges = 1;
			}
			$counter = 1;
			
			if ($dices >= 2) {
				while ($counter <= $dices) {
					$rolled = mt_rand(1, $edges);
					if ($counter != $dices) {
						$sum = $sum + $rolled;
						$result = $result . $rolled . ', ';
					} else {
						$sum = $sum + $rolled;
						$result = $result . $rolled . ' [ '. $sum . ' / ' . $sum/$dices . ' ]';
					}
					$counter++;
				}
			} else {
				$result = mt_rand(1, $edges);
			}
			$parsedresult = '<font style="color: green">## ' . $dices . 'd' . $edges . ' ## = ' . $result . '</font>';
			return $parsedresult;
		}
	
	// Dice replacer
    if ($config['dice']) {
        if (preg_match("/##\s?(\d+)?d(\d+)?([\+\-]\d+)?\s?##/", $post['body'], $dicematches)) {
            $post['body'] = preg_replace_callback("/##\s?(\d+)?d(\d+)?([\+\-]\d+)?\s?##/", 'dice', $post['body'], $config['dice_limit']);
        } else {
            $post['body'] = $post['body'];
        }
    }
	
	// Remove board directories before inserting them into the database.
	if ($post['has_file']) {
		$post['file_path'] = $post['file'];
		$post['thumb_path'] = $post['thumb'];
		$post['file'] = mb_substr($post['file'], mb_strlen('cdn/src'));
		if ($is_an_image && $post['thumb'] != 'spoiler')
			$post['thumb'] = mb_substr($post['thumb'], mb_strlen('cdn/thumb'));
	}

	$post = (object)$post;
	if ($error = event('post', $post)) {
		undoImage((array)$post);
		error($error);
	}
	$post = (array)$post;
	
	$post['id'] = $id = post($post);
	
	insertFloodPost($post);
	
	if (isset($post['antispam_hash'])) {
		incrementSpamHash($post['antispam_hash']);
	}
	
	if (isset($post['tracked_cites']) && !empty($post['tracked_cites'])) {
		$insert_rows = array();
		foreach ($post['tracked_cites'] as $cite) {
			$insert_rows[] = '(' .
				$pdo->quote($board['uri']) . ', ' . (int)$id . ', ' .
				$pdo->quote($cite[0]) . ', ' . (int)$cite[1] . ')';
		}
		query('INSERT INTO ``cites`` VALUES ' . implode(', ', $insert_rows)) or error(db_error());
	}
	
	if (!$post['op'] && strtolower($post['email']) != 'sage' && !$thread['sage'] && ($config['reply_limit'] == 0 || $numposts['replies']+1 < $config['reply_limit'])) {
		bumpThread($post['thread']);
	}
	
	buildThread($post['op'] ? $id : $post['thread']);
	
	if ($config['try_smarter'] && $post['op'])
		$build_pages = range(1, $config['max_pages']);
	
	if ($post['op'])
		clean();
	
	event('post-after', $post);
	
	buildIndex();
	
	if (isset($_SERVER['HTTP_REFERER'])) {
		// Tell Javascript that we posted successfully
		if (isset($_COOKIE[$config['cookies']['js']]))
			$js = json_decode($_COOKIE[$config['cookies']['js']]);
		else
			$js = (object) array();
		// Tell it to delete the cached post for referer
		$js->{$_SERVER['HTTP_REFERER']} = true;
		// Encode and set cookie
		setcookie($config['cookies']['js'], json_encode($js), 0, $config['cookies']['jail'] ? $config['cookies']['path'] : '/', null, false, false);
	}
	
	$root = $post['mod'] ? $config['root'] . $config['file_mod'] . '?/' : $config['root'];
	
	if ($config['always_noko'] || $noko) {
		$redirect = $root . $board['dir'] . $config['dir']['res'] .
			sprintf($config['file_page'], $post['op'] ? $id:$post['thread']) . (!$post['op'] ? '#' . $id : '');
			if (!$post['op'] && isset($_SERVER['HTTP_REFERER'])) {
				$regex = array(
					'board' => str_replace('%s', '(\w{1,8})', preg_quote($config['board_path'], '/')),
					'page' => str_replace('%d', '(\d+)', preg_quote($config['file_page'], '/')),
					'page50' => str_replace('%d', '(\d+)', preg_quote($config['file_page50'], '/')),
					'res' => preg_quote($config['dir']['res'], '/'),
				);
		
			if (preg_match('/\/' . $regex['board'] . $regex['res'] . $regex['page50'] . '([?&].*)?$/', $_SERVER['HTTP_REFERER'])) {
				$redirect = $root . $board['dir'] . $config['dir']['res'] .
				sprintf($config['file_page50'], $post['op'] ? $id:$post['thread']) . (!$post['op'] ? '#' . $id : '');
				}
			}
	} else {
		$redirect = $root . $board['dir'] . $config['file_index'];
		
	}
	
	if ($config['syslog'])
		_syslog(LOG_INFO, 'New post: /' . $board['dir'] . $config['dir']['res'] .
			sprintf($config['file_page'], $post['op'] ? $id : $post['thread']) . (!$post['op'] ? '#' . $id : ''));
	
	if ($post['op'])
		rebuildThemes('post-thread', $board['uri']);
	else
		rebuildThemes('post', $board['uri']);
	
	if (!isset($_POST['json_response'])) {
		header('Location: ' . $redirect, true, $config['redirect_http']);
	} else {
		header('Content-Type: text/json; charset=utf-8');
		echo json_encode(array(
			'redirect' => $redirect,
			'noko' => $config['always_noko'] || $noko,
			'id' => $id
		));
	}
} elseif (isset($_POST['appeal'])) {
	if (!isset($_POST['ban_id']))
		error($config['error']['bot']);
	
	$ban_id = (int)$_POST['ban_id'];
	
	$bans = Bans::find($_SERVER['REMOTE_ADDR']);
	foreach ($bans as $_ban) {
		if ($_ban['id'] == $ban_id) {
			$ban = $_ban;
			break;
		}
	}
	
	if (!isset($ban)) {
		error(_("That ban doesn't exist or is not for you."));
	}
	
	if ($ban['expires'] && $ban['expires'] - $ban['created'] <= $config['ban_appeals_min_length']) {
		error(_("You cannot appeal a ban of this length."));
	}
	
	$query = query("SELECT `denied` FROM ``ban_appeals`` WHERE `ban_id` = $ban_id") or error(db_error());
	$ban_appeals = $query->fetchAll(PDO::FETCH_COLUMN);
	
	if (count($ban_appeals) >= $config['ban_appeals_max']) {
		error(_("You cannot appeal this ban again."));
	}
	
	foreach ($ban_appeals as $is_denied) {
		if (!$is_denied)
			error(_("There is already a pending appeal for this ban."));
	}
	
	$query = prepare("INSERT INTO ``ban_appeals`` VALUES (NULL, :ban_id, :time, :message, 0)");
	$query->bindValue(':ban_id', $ban_id, PDO::PARAM_INT);
	$query->bindValue(':time', time(), PDO::PARAM_INT);
	$query->bindValue(':message', $_POST['appeal']);
	$query->execute() or error(db_error($query));
	
	displayBan($ban);
} else {
	if (!file_exists($config['has_installed'])) {
		header('Location: install.php', true, $config['redirect_http']);
	} else {
		// They opened post.php in their browser manually.
		error($config['error']['nopost']);
	}
}

