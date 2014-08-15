/*
 * image-spoiler.js
 * 
 * Hide spoiler images and allows user to un-spoil thumbnails.
 * Requires a little post.php changes, you'll need to generate thumbnails for spoiler images.
 *
 * Usage:
 *   $config['additional_javascript'][] = 'js/jquery.min.js';
 *   $config['additional_javascript'][] = 'js/settings.js';
 *   $config['additional_javascript'][] = 'js/image-spoiler.js';
 *
 */

$(document).ready(function(){
	if (settings.showSpoiler!=true) {
		var do_hideSpoiledImages = function() {
			if ($(this).hasClass("spoiler")){
				if ($(this).parent().attr("data-expanded") != 'true') {
					$(this).attr("src","http://static.syn-ch.com/spoiler.png");
					$(this).css({
						"width": 'auto',
						"height": 'auto'
					});
				}
                if (settings.neverOpenSpoiler) {
                    $(this).parent().attr('href', 'http://static.syn-ch.com/spoiler.png');
                    $(this).css('cursor', 'default', 'opacity', '1')
                }
			}
		};
		
		$('div.post > .media > a > img').each(do_hideSpoiledImages);
		
		$(document).bind("new_post", function(e, post) {
			$('div.post > .media > a > img').each(do_hideSpoiledImages);
		});
	}
});
