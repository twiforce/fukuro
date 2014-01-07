/*
 * toggle-images.js
 *
 * Released under the MIT license
 * Copyright (c) 2012 Michael Save <savetheinternet@tinyboard.org>
 *
 * Usage:
 *   $config['additional_javascript'][] = 'js/jquery.min.js';
 *   $config['additional_javascript'][] = 'js/toggle-images.js';
 *
 */

$(document).ready(function(){
	var hide_images = localStorage['hideimages'] ? true : false;

	$('<style type="text/css"> img.hidden{ opacity: 0.05 } </style>').appendTo($('head'));

	var hideImage = function() {
		if ($(this).parent()[0].dataset.expanded == 'true') {
			$(this).parent().click();
		}
		$(this)
			.attr('data-orig', this.src)
			//.attr('src', 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAAAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==')
			.addClass('hidden');
	};

	var restoreImage = function() {
		$(this)
			.attr('src', $(this).attr('data-orig'))
			.removeClass('hidden');
	};

	// Fix for hide-images.js
	var show_hide_hide_images_buttons = function() {
		if (hide_images) {
			$('a.hide-image-link').each(function() {
				if ($(this).next().hasClass('show-image-link')) {
					$(this).next().hide();
				}
				$(this).hide().after('<span class="toggle-images-placeholder">'+_('hidden')+'</span>');
			});
		} else {
			$('span.toggle-images-placeholder').remove();
			$('a.hide-image-link').each(function() {
				if ($(this).next().hasClass('show-image-link')) {
					$(this).next().show();
				} else {
					$(this).show();
				}
			});
		}
	};

    $('#scrollUp').before('<a id="toggle-images" href="javascript:void(0)"></a>&nbsp;');
    $('#toggle-images').html(hide_images ? '<i class="fa fa-eye-slash"></i> ' + _('NSFW: On') : '<i class="fa fa-eye"></i> ' + _('NSFW: Off'));
	$('#toggle-images').click(function() {
			hide_images = !hide_images;
			if (hide_images) {
				$('img.post-image').each(hideImage);
				localStorage.hideimages = true;
			} else {
				$('img.post-image').each(restoreImage);
				delete localStorage.hideimages;
			}
			
			show_hide_hide_images_buttons();
			
			$(this).html(hide_images ? '<i class="fa fa-eye-slash"></i> ' + _('NSFW: On')  : '<i class="fa fa-eye"></i> ' + _('NSFW: Off'))
		});

	if (hide_images) {
		$('img.post-image').each(hideImage);
		show_hide_hide_images_buttons();
	}
	
	$(document).bind('new_post', function(e, post) {
		if (hide_images) {
			$(post).find('img.post-image').each(hideImage);
		}
	});
});
