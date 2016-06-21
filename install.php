<?php

// Installation/upgrade file	
define('VERSION', 'v5.0.2-beta');

require 'inc/functions.php';

$step = isset($_GET['step']) ? round($_GET['step']) : 0;
$page = array(
	'config' => $config,
	'title' => 'Install',
	'body' => '',
	'nojavascript' => true
);

// this breaks the display of licenses if enabled
$config['minify_html'] = false;

if (file_exists($config['has_installed'])) {
	
	// Check the version number
	$version = trim(file_get_contents($config['has_installed']));
	if (empty($version))
		$version = 'v0.9.1';
	
	function __query($sql) {
		sql_open();
		
		if (mysql_version() >= 50503)
			return query($sql);
		else
			return query(str_replace('utf8mb4', 'utf8', $sql));
	}
	
	$boards = listBoards();
	
	switch ($version) {
		// There was a lot of legacy code. Bet nobody will need it.
		case false:
			// Update version number
			file_write($config['has_installed'], VERSION);
			
			$page['title'] = 'Upgraded';
			$page['body'] = '<p style="text-align:center">Successfully upgraded from ' . $version . ' to <strong>' . VERSION . '</strong>.</p>';
			break;
		default:
			$page['title'] = 'Unknown version';
			$page['body'] = '<p style="text-align:center">Fukuro was unable to determine what version is currently installed.</p>';
			break;
		case VERSION:
			$page['title'] = 'Already installed';
			$page['body'] = '<p style="text-align:center">It appears that Fukuro is already installed (' . $version . ') and there is nothing to upgrade! Delete <strong>' . $config['has_installed'] . '</strong> to reinstall.</p>';
			break;
	}			
	
	die(Element('page.html', $page));
}

if ($step == 0) {
	// Agreeement
	$page['body'] = '
	<textarea style="width:700px;height:370px;margin:auto;display:block;background:white;color:black" disabled>' . htmlentities(file_get_contents('LICENSE.md')) . '</textarea>
	<p style="text-align:center">
		<a href="?step=1">I have read and understood the agreement. Proceed to installation.</a>
	</p>';
	
	echo Element('page.html', $page);
} elseif ($step == 1) {
	$page['title'] = 'Pre-installation test';
	
	$can_exec = true;
	if (!function_exists('shell_exec'))
		$can_exec = false;
	elseif (in_array('shell_exec', array_map('trim', explode(', ', ini_get('disable_functions')))))
		$can_exec = false;
	elseif (ini_get('safe_mode'))
		$can_exec = false;
	elseif (trim(shell_exec('echo "TEST"')) !== 'TEST')
		$can_exec = false;
	
	if (!defined('PHP_VERSION_ID')) {
		$version = explode('.', PHP_VERSION);
		define('PHP_VERSION_ID', ($version[0] * 10000 + $version[1] * 100 + $version[2]));
	}
	
	// Required extensions
	$extensions = array(
		'PDO' => array(
			'installed' => extension_loaded('pdo'),
			'required' => true
		),
		'PDO' => array(
			'installed' => extension_loaded('gd'),
			'required' => true
		),
		'Imagick' => array(
			'installed' => extension_loaded('imagick'),
			'required' => false
		)
	);
	
	$tests = array(
		array(
			'category' => 'PHP',
			'name' => 'PHP &ge; 5.2.5',
			'result' => PHP_VERSION_ID >= 50205,
			'required' => true,
			'message' => 'Fukuro requires PHP 5.2.5 or better.',
		),
		array(
			'category' => 'PHP',
			'name' => 'PHP &ge; 5.3',
			'result' => PHP_VERSION_ID >= 50300,
			'required' => false,
			'message' => 'PHP &ge; 5.3, though not required, is recommended to make the most out of Fukuro configuration files.',
		),
		array(
			'category' => 'PHP',
			'name' => 'mbstring extension installed',
			'result' => extension_loaded('mbstring'),
			'required' => true,
			'message' => 'You must install the PHP <a href="http://www.php.net/manual/en/mbstring.installation.php">mbstring</a> extension.',
		),
		array(
			'category' => 'Database',
			'name' => 'PDO extension installed',
			'result' => extension_loaded('pdo'),
			'required' => true,
			'message' => 'You must install the PHP <a href="http://www.php.net/manual/en/intro.pdo.php">PDO</a> extension.',
		),
		array(
			'category' => 'Database',
			'name' => 'MySQL PDO driver installed',
			'result' => extension_loaded('pdo') && in_array('mysql', PDO::getAvailableDrivers()),
			'required' => true,
			'message' => 'The required <a href="http://www.php.net/manual/en/ref.pdo-mysql.php">PDO MySQL driver</a> is not installed.',
		),
		array(
			'category' => 'Image processing',
			'name' => 'GD extension installed',
			'result' => extension_loaded('gd'),
			'required' => true,
			'message' => 'You must install the PHP <a href="http://www.php.net/manual/en/intro.image.php">GD</a> extension. GD is a requirement even if you have chosen another image processor for thumbnailing.',
		),
		array(
		 	'category' => 'Image processing',
		 	'name' => 'GD: JPEG',
			'result' => function_exists('imagecreatefromjpeg'),
			'required' => true,
			'message' => 'imagecreatefromjpeg() does not exist. This is a problem.',
		),
		array(
			'category' => 'Image processing',
			'name' => 'GD: PNG',
			'result' => function_exists('imagecreatefrompng'),
			'required' => true,
			'message' => 'imagecreatefrompng() does not exist. This is a problem.',
		),
		array(
			'category' => 'Image processing',
			'name' => 'GD: GIF',
			'result' => function_exists('imagecreatefromgif'),
			'required' => true,
			'message' => 'imagecreatefromgif() does not exist. This is a problem.',
		),
		array(
			'category' => 'Image processing',
			'name' => 'Imagick extension installed',
			'result' => extension_loaded('imagick'),
			'required' => false,
			'message' => '(Optional) The PHP <a href="http://www.php.net/manual/en/imagick.installation.php">Imagick</a> (ImageMagick) extension is not installed. You may not use Imagick for better (and faster) image processing.',
		),
		array(
			'category' => 'Image processing',
			'name' => '`convert` (command-line ImageMagick)',
			'result' => $can_exec && shell_exec('which convert'),
			'required' => false,
			'message' => '(Optional) `convert` was not found or executable; command-line ImageMagick image processing cannot be enabled.',
		),
		array(
			'category' => 'Image processing',
			'name' => '`identify` (command-line ImageMagick)',
			'result' => $can_exec && shell_exec('which identify'),
			'required' => false,
			'message' => '(Optional) `identify` was not found or executable; command-line ImageMagick image processing cannot be enabled.',
		),
		array(
			'category' => 'Image processing',
			'name' => '`gm` (command-line GraphicsMagick)',
			'result' => $can_exec && shell_exec('which gm'),
			'required' => false,
			'message' => '(Optional) `gm` was not found or executable; command-line GraphicsMagick (faster than ImageMagick) cannot be enabled.',
		),
		array(
			'category' => 'Image processing',
			'name' => '`gifsicle` (command-line animted GIF thumbnailing)',
			'result' => $can_exec && shell_exec('which gifsicle'),
			'required' => false,
			'message' => '(Optional) `gifsicle` was not found or executable; you may not use `convert+gifsicle` for better animated GIF thumbnailing.',
		),
		array(
			'category' => 'File permissions',
			'name' => getcwd(),
			'result' => is_writable('.'),
			'required' => true,
			'message' => 'Fukuro does not have permission to create directories (boards) here. You will need to <code>chmod</code> (or operating system equivalent) appropriately.'
		),
		array(
			'category' => 'File permissions',
			'name' => getcwd() . '/templates/cache',
			'result' => is_writable('templates') && (!is_dir('templates/cache') || is_writable('templates/cache')),
			'required' => true,
			'message' => 'You must give Fukuro permission to create (and write to) the <code>templates/cache</code> directory or performance will be drastically reduced.'
		),
		array(
			'category' => 'File permissions',
			'name' => getcwd() . '/inc/instance-config.php',
			'result' => is_writable('inc/instance-config.php'),
			'required' => false,
			'message' => 'Fukuro does not have permission to make changes to <code>inc/instance-config.php</code>. To complete the installation, you will be asked to manually copy and paste code into the file instead.'
		),
		array(
			'category' => 'Misc',
			'name' => 'Caching available (APC, XCache, Memcached or Redis)',
			'result' => extension_loaded('apc') || extension_loaded('xcache')
				|| extension_loaded('memcached') || extension_loaded('redis'),
			'required' => false,
			'message' => 'You will not be able to enable the additional caching system, designed to minimize SQL queries and significantly improve performance. <a href="http://php.net/manual/en/book.apc.php">APC</a> is the recommended method of caching, but <a href="http://xcache.lighttpd.net/">XCache</a>, <a href="http://www.php.net/manual/en/intro.memcached.php">Memcached</a> and <a href="http://pecl.php.net/package/redis">Redis</a> are also supported.'
		),
		array(
			'category' => 'Misc',
			'name' => 'Fukuro installed using git',
			'result' => is_dir('.git'),
			'required' => false,
			'message' => 'Fukuro is still in a process of development. As there are often many months between releases yet changes and bug fixes are very frequent, it\'s recommended to use the git repository to maintain your Fukuro installation. Using git makes upgrading much easier.'
		)
	);
	
	$config['font_awesome'] = true;
	
	echo Element('page.html', array(
		'body' => Element('installer/check-requirements.html', array(
			'extensions' => $extensions,
			'tests' => $tests,
			'config' => $config
		)),
		'title' => 'Checking environment',
		'config' => $config
	));
} elseif ($step == 2) {
	// Basic config
	$page['title'] = 'Configuration';
	
	$config['cookies']['salt'] = substr(base64_encode(sha1(rand())), 0, 30);
	$config['secure_trip_salt'] = substr(base64_encode(sha1(rand())), 0, 30);	
	
	echo Element('page.html', array(
		'body' => Element('installer/config.html', array(
			'config' => $config
		)),
		'title' => 'Configuration',
		'config' => $config
	));
} elseif ($step == 3) {
	$instance_config = 
'<?php

/*
*  Instance Configuration
*  ----------------------
*  Edit this file and not config.php for imageboard configuration.
*
*  You can copy values from config.php (defaults) and paste them here.
*/

';
	
	function create_config_from_array(&$instance_config, &$array, $prefix = '') {
		foreach ($array as $name => $value) {
			if (is_array($value)) {
				$instance_config .= "\n";
				create_config_from_array($instance_config, $value, $prefix . '[\'' . addslashes($name) . '\']');
				$instance_config .= "\n";
			} else {
				$instance_config .= '	$config' . $prefix . '[\'' . addslashes($name) . '\'] = ';
				
				if (is_numeric($value))
					$instance_config .= $value;
				else
					$instance_config .= "'" . addslashes($value) . "'";
					
				$instance_config .= ";\n";
			}
		}
	}
	
	create_config_from_array($instance_config, $_POST);
	
	$instance_config .= <<< 'ADDITIONAL_CONFIG'
	$config['filename_func'] = function($post) {
    	return sprintf("%s", time() . "-" . substr(md5(microtime()),rand(0,16),5));
    };

    $config['post_date'] = '%a %e %b %G %T';
    $config['locale'] = 'ru_RU.UTF-8';
    $config['timezone'] = 'Europe/Moscow';
    $config['button_newtopic'] = 'Создать тред';
    $config['button_reply'] = 'Ответить';
    $config['thread_subject_in_title'] = true;
    $config['quick_reply'] = true;

	$config['api']['enabled'] = true;
	$config['api']['extra_fields'] = array('thumb' => 'thumb');

	$config['stylesheets']['Quartz'] = 'quartz.css';
    $config['stylesheets']['Morion'] = 'morion.css';
    $config['uri_stylesheets'] = '/stylesheets/';
    $config['default_stylesheet'] = array('Quartz', $config['stylesheets']['Quartz']);

    // Additional javascript
    $config['additional_javascript'][] = 'js/lib/jquery.min.js';
    $config['additional_javascript'][] = 'js/lib/bootstrap/dropdown.js';
    $config['additional_javascript'][] = 'js/lib/bootstrap/tab.js';
    $config['additional_javascript'][] = 'js/lib/jquery/jquery.rangyinputs.min.js';
    $config['additional_javascript'][] = 'js/lib/jquery/jquery.textareaCounter.plugin.js';
    $config['additional_javascript'][] = 'js/lib/jquery/jquery.shorten.js';
    $config['additional_javascript'][] = 'js/lib/jquery/jquery.form.js';
    $config['additional_javascript'][] = 'js/lib/bootstrap-growl.min.js';
    $config['additional_javascript'][] = 'js/lib/keymaster.js';
    $config['additional_javascript'][] = 'js/lib/moment.min.js';
    $config['additional_javascript'][] = 'js/lib/moment.js.ru.js';
    $config['additional_javascript'][] = 'js/lib/mediaelement-and-player.min.js';
    $config['additional_javascript'][] = 'js/lib/interact-1.2.1.min.js';
    $config['additional_javascript'][] = 'js/mobile-style.js';
    $config['additional_javascript'][] = 'js/navigation.js';
    $config['additional_javascript'][] = 'js/settings.js';
    $config['additional_javascript'][] = 'js/lib/lightbox.js'; // after settings.js
    $config['additional_javascript'][] = 'js/inline-expanding.js';
    $config['additional_javascript'][] = 'js/sticky-form.js';
    $config['additional_javascript'][] = 'js/bottom-form.js';
    $config['additional_javascript'][] = 'js/quick-reply.js';
    $config['additional_javascript'][] = 'js/markup-buttons.js';
    $config['additional_javascript'][] = 'js/local-time.js';
    $config['additional_javascript'][] = 'js/auto-reload.js'; // after local-time.js because of moment.js
    $config['additional_javascript'][] = 'js/ajax.js';
    $config['additional_javascript'][] = 'js/title-notifier.js';
    $config['additional_javascript'][] = 'js/post-hover.js';
    $config['additional_javascript'][] = 'js/post-hover-tree.js';
    $config['additional_javascript'][] = 'js/image-hover.js';
    $config['additional_javascript'][] = 'js/show-backlinks.js';
    $config['additional_javascript'][] = 'js/post-expand.js';
    $config['additional_javascript'][] = 'js/quote-selection.js';
    $config['additional_javascript'][] = 'js/style-select.js';
    $config['additional_javascript'][] = 'js/forced-anon.js';
    $config['additional_javascript'][] = 'js/hide-threads.js';
    $config['additional_javascript'][] = 'js/expand-all-images.js';
    $config['additional_javascript'][] = 'js/hide-images.js';
    $config['additional_javascript'][] = 'js/toggle-images.js';
    $config['additional_javascript'][] = 'js/hide-posts.js';
    $config['additional_javascript'][] = 'js/noko50-deleter.js';
    $config['additional_javascript'][] = 'js/inline-form.js';
    $config['additional_javascript'][] = 'js/simple-form.js'; // after all forms
    $config['additional_javascript'][] = 'js/watch.js';
    $config['additional_javascript'][] = 'js/catalog-link.js';
    $config['additional_javascript'][] = 'js/archive-link.js';
    $config['additional_javascript'][] = 'js/save-user_flag.js';
    $config['additional_javascript'][] = 'js/fix-report-delete-submit.js';
    $config['additional_javascript'][] = 'js/youtube.js';
    $config['additional_javascript'][] = 'js/image-spoiler.js';
    $config['additional_javascript'][] = 'js/toggle-spoiler.js';
    $config['additional_javascript'][] = 'js/smartphone-spoiler.js';
    $config['additional_javascript'][] = 'js/ajax-post-controls.js';
    $config['additional_javascript'][] = 'js/csseditor.js';
    $config['additional_javascript'][] = 'js/compact-boardlist.js';
    $config['additional_javascript'][] = 'js/postcount.js';

    // Flood/spam settings
    $config['spam']['enabled'] = false;
    // Always update this when adding new valid fields to the post form, or EVERYTHING WILL BE DETECTED AS SPAM!
    $config['spam']['valid_inputs'] = array(
        'hash',
        'board',
        'thread',
        'mod',
        'name',
        'email',
        'subject',
        'post',
        'body',
        'file',
        'password',
        'sticky',
        'lock',
        'raw',
        'embed',
        'captcha',
        'recaptcha_challenge_field',
        'recaptcha_response_field',
        'g-recaptcha-response',
        'spoiler',
        'quick-reply',
        'page',
        'file_url',
        'json_response',
        'user_flag',
        'derpibooruAPIKey',
    );

    $config['robot_enable'] = false;

    // Strip repeating characters when making hashes.
    $config['robot_strip_repeating'] = false;
    $config['robot_mute'] = false;

    $config['flood_cache'] = 3600;

    $config['bytes_array'] = array(' Б', ' КБ', ' МБ', ' ГБ', ' ТБ');

    // Mod links (full HTML).
    $config['mod']['link_delete'] = 'Удалить пост';
    $config['mod']['link_ban'] = 'Забанить';
    $config['mod']['link_bandelete'] = 'Забанить и удалить';
    $config['mod']['link_deletefile'] = 'Удалить файл';
    $config['mod']['link_spoilerimage'] = 'Спойлер';
    $config['mod']['link_deletebyip'] = 'Удалить все посты на доске';
    $config['mod']['link_deletebyip_global'] = 'Удалить все посты глобально';
    $config['mod']['link_sticky'] = 'Прикрепить';
    $config['mod']['link_desticky'] = 'Открепить';
    $config['mod']['link_lock'] = 'Закрыть тред';
    $config['mod']['link_unlock'] = 'Открыть тред';
    $config['mod']['link_bumplock'] = 'Бампилимит';
    $config['mod']['link_bumpunlock'] = 'Снять бамплимит';
    $config['mod']['link_editpost'] = 'Редактировать';
    $config['mod']['link_move'] = 'Переместить';
    $config['mod']['link_arch'] = 'В архив';
ADDITIONAL_CONFIG;

	
	if (@file_put_contents('inc/instance-config.php', $instance_config)) {
		header('Location: ?step=4', true, $config['redirect_http']);
	} else {
		$page['title'] = 'Manual installation required';
		$page['body'] = '
			<p>I couldn\'t write to <strong>inc/instance-config.php</strong> with the new configuration, probably due to a permissions error.</p>
			<p>Please complete the installation manually by copying and pasting the following code into the contents of <strong>inc/instance-config.php</strong>:</p>
			<textarea style="width:700px;height:370px;margin:auto;display:block;background:white;color:black">' . htmlentities($instance_config) . '</textarea>
			<p style="text-align:center">
				<a href="?step=4">Once complete, click here to complete installation.</a>
			</p>
		';
		echo Element('page.html', $page);
	}
} elseif ($step == 4) {
	// SQL installation
	
	buildJavascript();
	
	$sql = @file_get_contents('install.sql') or error("Couldn't load install.sql.");
	
	sql_open();
	$mysql_version = mysql_version();
	
	// This code is probably horrible, but what I'm trying
	// to do is find all of the SQL queires and put them
	// in an array.
	// preg_match_all("/(^|\n)((SET|CREATE|INSERT).+)\n\n/msU", $sql, $queries);
	// $queries = $queries[2];

	// Why yes, also this does not work at all. Dunno why though.
	// I've made it worse, but it's working at least.

	$queries[] = "SET SQL_MODE = 'NO_AUTO_VALUE_ON_ZERO';";
	$queries[] = "SET time_zone = '+00:00';";
	$queries[] = "CREATE TABLE IF NOT EXISTS `antispam` (
	  `board` varchar(58) CHARACTER SET utf8 NOT NULL,
	  `thread` int(11) DEFAULT NULL,
	  `hash` char(40) COLLATE ascii_bin NOT NULL,
	  `created` int(11) NOT NULL,
	  `expires` int(11) DEFAULT NULL,
	  `passed` smallint(6) NOT NULL,
	  PRIMARY KEY (`hash`),
	  KEY `board` (`board`,`thread`),
	  KEY `expires` (`expires`)
	) ENGINE=MyISAM DEFAULT CHARSET=ascii COLLATE=ascii_bin;";
	$queries[] = "CREATE TABLE IF NOT EXISTS `bans` (
	  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
	  `ipstart` varbinary(16) NOT NULL,
	  `ipend` varbinary(16) DEFAULT NULL,
	  `created` int(10) unsigned NOT NULL,
	  `expires` int(10) unsigned DEFAULT NULL,
	  `board` varchar(58) DEFAULT NULL,
	  `creator` int(10) NOT NULL,
	  `reason` text,
	  `seen` tinyint(1) NOT NULL,
	  `post` blob,
	  PRIMARY KEY (`id`),
	  KEY `expires` (`expires`),
	  KEY `ipstart` (`ipstart`,`ipend`)
	) ENGINE=MyISAM  DEFAULT CHARSET=utf8mb4 AUTO_INCREMENT=1 ;";
	$queries[] = "CREATE TABLE IF NOT EXISTS `boards` (
	  `uri` varchar(58) CHARACTER SET utf8 NOT NULL,
	  `title` tinytext NOT NULL,
	  `subtitle` tinytext,
	  PRIMARY KEY (`uri`)
	) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4;";
	$queries[] = "INSERT INTO `boards` VALUES
	('b', 'Random', NULL);";
	$queries[] = "CREATE TABLE IF NOT EXISTS `cites` (
	  `board` varchar(58) NOT NULL,
	  `post` int(11) NOT NULL,
	  `target_board` varchar(58) NOT NULL,
	  `target` int(11) NOT NULL,
	  KEY `target` (`target_board`,`target`),
	  KEY `post` (`board`,`post`)
	) ENGINE=MyISAM DEFAULT CHARSET=utf8;";
	$queries[] = "CREATE TABLE IF NOT EXISTS `ip_notes` (
	  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
	  `ip` varchar(39) CHARACTER SET ascii NOT NULL,
	  `mod` int(11) DEFAULT NULL,
	  `time` int(11) NOT NULL,
	  `body` text NOT NULL,
	  UNIQUE KEY `id` (`id`),
	  KEY `ip_lookup` (`ip`, `time`)
	) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 AUTO_INCREMENT=1 ;";
	$queries[] = "CREATE TABLE IF NOT EXISTS `modlogs` (
	  `mod` int(11) NOT NULL,
	  `ip` varchar(39) CHARACTER SET ascii NOT NULL,
	  `board` varchar(58) CHARACTER SET utf8 DEFAULT NULL,
	  `time` int(11) NOT NULL,
	  `text` text NOT NULL,
	  KEY `time` (`time`),
	  KEY `mod`(`mod`)
	) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4;";
	$queries[] = "CREATE TABLE IF NOT EXISTS `mods` (
	  `id` smallint(6) unsigned NOT NULL AUTO_INCREMENT,
	  `username` varchar(30) NOT NULL,
	  `password` char(64) CHARACTER SET ascii NOT NULL COMMENT 'SHA256',
	  `salt` char(32) CHARACTER SET ascii NOT NULL,
	  `type` smallint(2) NOT NULL,
	  `boards` text CHARACTER SET utf8 NOT NULL,
	  PRIMARY KEY (`id`),
	  UNIQUE KEY `id` (`id`,`username`)
	) ENGINE=MyISAM  DEFAULT CHARSET=utf8mb4 AUTO_INCREMENT=1 ;";
	$queries[] = "INSERT INTO `mods` VALUES
	(1, 'admin', 'cedad442efeef7112fed0f50b011b2b9bf83f6898082f995f69dd7865ca19fb7', '4a44c6c55df862ae901b413feecb0d49', 30, '*');";
	$queries[] = "CREATE TABLE IF NOT EXISTS `mutes` (
	  `ip` varchar(39) NOT NULL,
	  `time` int(11) NOT NULL,
	  KEY `ip` (`ip`)
	) ENGINE=MyISAM DEFAULT CHARSET=ascii;";
	$queries[] = "CREATE TABLE IF NOT EXISTS `news` (
	  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
	  `name` text NOT NULL,
	  `time` int(11) NOT NULL,
	  `subject` text NOT NULL,
	  `body` text NOT NULL,
	  UNIQUE KEY `id` (`id`),
	  KEY `time` (`time`)
	) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 AUTO_INCREMENT=1 ;";
	$queries[] = "CREATE TABLE IF NOT EXISTS `noticeboard` (
	  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
	  `mod` int(11) NOT NULL,
	  `time` int(11) NOT NULL,
	  `subject` text NOT NULL,
	  `body` text NOT NULL,
	  UNIQUE KEY `id` (`id`),
	  KEY `time` (`time`)
	) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 AUTO_INCREMENT=1 ;";
	$queries[] = "CREATE TABLE IF NOT EXISTS `pms` (
	  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
	  `sender` int(11) NOT NULL,
	  `to` int(11) NOT NULL,
	  `message` text NOT NULL,
	  `time` int(11) NOT NULL,
	  `unread` tinyint(1) NOT NULL,
	  PRIMARY KEY (`id`),
	  KEY `to` (`to`, `unread`)
	) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 AUTO_INCREMENT=1 ;";
	$queries[] = "CREATE TABLE IF NOT EXISTS `reports` (
	  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
	  `time` int(11) NOT NULL,
	  `ip` varchar(39) CHARACTER SET ascii NOT NULL,
	  `board` varchar(58) CHARACTER SET utf8 DEFAULT NULL,
	  `post` int(11) NOT NULL,
	  `reason` text NOT NULL,
	  PRIMARY KEY (`id`)
	) ENGINE=MyISAM  DEFAULT CHARSET=utf8mb4 AUTO_INCREMENT=1 ;";
	$queries[] = "CREATE TABLE IF NOT EXISTS `robot` (
	  `hash` varchar(40) COLLATE ascii_bin NOT NULL COMMENT 'SHA1',
	  PRIMARY KEY (`hash`)
	) ENGINE=MyISAM DEFAULT CHARSET=ascii COLLATE=ascii_bin;";
	$queries[] = "CREATE TABLE IF NOT EXISTS `theme_settings` (
	  `theme` varchar(40) NOT NULL,
	  `name` varchar(40) DEFAULT NULL,
	  `value` text,
	  KEY `theme` (`theme`)
	) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4;";
	$queries[] = "CREATE TABLE IF NOT EXISTS `flood` (
	  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
	  `ip` varchar(39) NOT NULL,
	  `board` varchar(58) CHARACTER SET utf8 NOT NULL,
	  `time` int(11) NOT NULL,
	  `posthash` char(32) NOT NULL,
	  `filehash` char(32) DEFAULT NULL,
	  `isreply` tinyint(1) NOT NULL,
	  PRIMARY KEY (`id`),
	  KEY `ip` (`ip`),
	  KEY `posthash` (`posthash`),
	  KEY `filehash` (`filehash`),
	  KEY `time` (`time`)
	) ENGINE=MyISAM DEFAULT CHARSET=ascii COLLATE=ascii_bin AUTO_INCREMENT=1 ;";
	$queries[] = "CREATE TABLE IF NOT EXISTS `ban_appeals` (
	  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
	  `ban_id` int(10) unsigned NOT NULL,
	  `time` int(10) unsigned NOT NULL,
	  `message` text NOT NULL,
	  `denied` tinyint(1) NOT NULL,
	  PRIMARY KEY (`id`),
	  KEY `ban_id` (`ban_id`)
	) ENGINE=MyISAM  DEFAULT CHARSET=utf8mb4 AUTO_INCREMENT=1 ;";

	$queries[] = Element('posts.sql', array('board' => 'b'));
	
	$sql_errors = '';
	foreach ($queries as $query) {
		if ($mysql_version < 50503)
			$query = preg_replace('/(CHARSET=|CHARACTER SET )utf8mb4/', '$1utf8', $query);
		$query = preg_replace('/^([\w\s]*)`([0-9a-zA-Z$_\x{0080}-\x{FFFF}]+)`/u', '$1``$2``', $query);
		if (!query($query))
			$sql_errors .= '<li>' . db_error() . '</li>';
	}
	
	$page['title'] = 'Installation complete';
	$page['body'] = '<p style="text-align:center">Thank you for using Fukuro. Please remember to report any bugs you discover. <a href="https://github.com/twiforce/fukuro/wiki/Configuration-Basics">How do I edit the config files?</a></p>';

	if (!empty($sql_errors)) {
		$page['body'] .= '<div class="ban"><h2>SQL errors</h2><p>SQL errors were encountered when trying to install the database. This may be the result of using a database which is already occupied with a Fukuro installation; if so, you can probably ignore this.</p><p>The errors encountered were:</p><ul>' . $sql_errors . '</ul><p><a href="?step=5">Ignore errors and complete installation.</a></p></div>';
	} else {
		$boards = listBoards();
		foreach ($boards as &$_board) {
			setupBoard($_board);
			buildIndex();
		}
		
		file_write($config['has_installed'], VERSION);
		if (!file_unlink(__FILE__)) {
			$page['body'] .= '<div class="ban"><h2>Delete install.php!</h2><p>I couldn\'t remove <strong>install.php</strong>. You will have to remove it manually.</p></div>';
		}
	}

	echo Element('page.html', $page);
} elseif ($step == 5) {
	$page['title'] = 'Installation complete';
	$page['body'] = '<p style="text-align:center">Thank you for using Fukuro. Please remember to report any bugs you discover.</p>';

	$boards = listBoards();
	foreach ($boards as &$_board) {
		setupBoard($_board);
		buildIndex();
	}

	file_write($config['has_installed'], VERSION);
	if (!file_unlink(__FILE__)) {
		$page['body'] .= '<div class="ban"><h2>Delete install.php!</h2><p>I couldn\'t remove <strong>install.php</strong>. You will have to remove it manually.</p></div>';
	}

	echo Element('page.html', $page);
}
