<?php

spl_autoload_register(function ($class) {
	if (strpos($class, 'Twig_') === 0) {
		$file = __DIR__ . '/' . str_replace('_', '/', substr($class, 5)) . '.php';
	} elseif (strpos($class, 'Twig\\') === 0) {
		$file = __DIR__ . '/src/' . str_replace('\\', '/', substr($class, 5)) . '.php';
	} else {
		return;
	}
	if (is_file($file))
		require_once $file;
});
