/*
 * toggle-spoiler.js
 *
 * Allows user to un-hide spoilers and custom styles like .roleplay
 * 
 * Usage:
 *   $config['additional_javascript'][] = 'js/jquery.min.js';
 *   $config['additional_javascript'][] = 'js/settings.js';
 *   $config['additional_javascript'][] = 'js/toggle-spoiler.js';
 *
 */

onready(function(){
	if (settings.textSpoiler) {
		var do_unspoil = function(elem) {
			$(elem).find('span.spoiler').css({'color':'black', 'background-color': '#BBBBBB'})
		};

		do_unspoil(document);

		// allow to work with auto-reload.js, etc.
		$(document).bind('new_post', function(e, post) {
			do_unspoil(post);
		});
	}

	if (settings.hideRoleplay) {
		var do_unroleplay = function(elem) {
			$(elem).find('.body span.roleplay').remove();
		};

		do_unroleplay(document);

		// allow to work with auto-reload.js, etc.
		$(document).bind('new_post', function(e, post) {
			do_unroleplay(post);
		});
	}
});

