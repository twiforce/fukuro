/**
 * inline-expanding.js
 * https://github.com/twiforce/fukuro/blob/master/js/inline-expanding.js
 *
 * Expands images inside div.post.
 *
 * Released under the MIT license
 * Copyright (c) 2012-2013 Michael Save <savetheinternet@tinyboard.org>
 *     			 2013-2015 Simon Twiforce <twiforce@syn-ch.ru>
 *               2015 GhostPerson <https://github.com/GhostPerson>
 *               2015 appleboom <appleboom@syn-ch.ru>
 *
 * Usage:
 *   // $config['additional_javascript'][] = 'js/jquery.min.js';
 *   $config['additional_javascript'][] = 'js/inline-expanding.js';
 *
 */

onready(function(){
	var inline_expand_post = function() {
		var link = this.getElementsByTagName('a');

		for (var i = 0; i < link.length; i++) {
			if (typeof link[i] == "object" && link[i].childNodes && typeof link[i].childNodes[0] !== 'undefined' && link[i].childNodes[0].src && link[i].childNodes[0].className.match(/post-image/) && !link[i].className.match(/file/)) {
				link[i].childNodes[0].style.maxWidth = '100%';

				link[i].onclick = function(e) {
					if (this.childNodes[0].className == 'hidden')
						return false;
					if (e.which == 2 || e.metaKey)
						return true;
					if (!this.dataset.src) {
						this.dataset.expanded = 'true';
						this.dataset.src= this.childNodes[0].src;
						this.dataset.width = this.childNodes[0].style.width;
						this.dataset.height = this.childNodes[0].style.height;
						this.childNodes[0].src = this.href;
						this.childNodes[0].style.opacity = '0.4';
						this.childNodes[0].style.filter = 'alpha(opacity=40)';
						this.childNodes[0].style.width = 'auto';
						this.childNodes[0].style.height = 'auto';
						this.childNodes[0].onload = function() {
							this.style.opacity = '';
							this.style.filter= '';
						}
					} else {
						this.childNodes[0].src = this.dataset.src;
						this.childNodes[0].style.width = this.dataset.width;
						this.childNodes[0].style.height = this.dataset.height;
						this.childNodes[0].style.opacity="";
						this.childNodes[0].style.filter="";
						this.childNodes[0].style.float = 'left';
						delete this.dataset.expanded;
						delete this.dataset.src;

					}
					return false;
				}
			}
		}
	};

	if ((!settings.lightbox) && (!settings.newTab)) {
		console.log('k');
		if (window.jQuery) {
			$('div[id^="thread_"]').each(inline_expand_post);

			// allow to work with auto-reload.js, etc.
			$(document).bind('new_post', function (e, post) {
				if ('selector' in post) {
					//post is a jQuery array
					post.each(inline_expand_post)
				}
				else
					inline_expand_post.call(post);
			});
		} else {
			inline_expand_post.call(document);
		}
	}
});
