/*
 * title-notifier.js
 * 
 * Adds amount of new posts in page title.
 *
 * Usage:
 *   $config['additional_javascript'][] = 'js/jquery.min.js';
 *   $config['additional_javascript'][] = 'js/settings.js';
 *   $config['additional_javascript'][] = 'js/title-notifier.js';
 *
 */
 
$(document).ready(function() {
	if (settings.showNewMessages) {
		var unreadPosts = 0;
		var boop = new Audio('/static/boop.wav');
		var obsoleteTitle = document.title;
		$(window).mousemove(function () {
			if (unreadPosts != 0) {
				unreadPosts = 0;
				document.title = obsoleteTitle;
			}
		})

		// Make work with auto-reload.js etc
		$(document).bind('new_post', function (e, post) {
			unreadPosts+=$(post).length;
			document.title = '[' + unreadPosts + '] ' + obsoleteTitle;
			if (settings.boopNewMessages) {
				boop.play();
			}
		});
	}
});