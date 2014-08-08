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
	var hide_images = settings.hideImages ? true : false;

	var hideImage = function() {
		if ($(this).parent()[0].dataset.expanded == 'true') {
			$(this).parent().click();
		}
		$(this)
			.attr('data-orig', this.src)
			.addClass('nsfw');
	};

	var restoreImage = function() {
		$(this)
			.attr('src', $(this).attr('data-orig'))
			.removeClass('nsfw');
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
    if (settings.simpleNavbar) {
        $('#toggle-images').html(hide_images ? '<i class="fa fa-eye-slash fa-lg"></i>' : '<i class="fa fa-eye fa-lg"></i>');
    } else if (device_type == "mobile") {
        $('#toggle-images').html(hide_images ? '<i class="fa fa-eye-slash fa-2x"></i>' : '<i class="fa fa-eye fa-2x"></i>');
    } else
        $('#toggle-images').html(hide_images ? '<i class="fa fa-eye-slash"></i> ' + _('NSFW: On') : '<i class="fa fa-eye"></i> ' + _('NSFW: Off'));
	$('#toggle-images').click(function() {
			hide_images = !hide_images;
			if (hide_images) {
				$('img.post-image').each(hideImage);
				settings.hideImages = true;
                localStorage.setItem("settings", JSON.stringify(settings));
			} else {
				$('img.post-image').each(restoreImage);
				settings.hideImages = false;
                localStorage.setItem("settings", JSON.stringify(settings));
			}
			
			show_hide_hide_images_buttons();

        if (settings.simpleNavbar) {
            $(this).html(hide_images ? '<i class="fa fa-eye-slash fa-lg"></i>' : '<i class="fa fa-eye fa-lg"></i>');
        } else if (device_type == "mobile") {
            $(this).html(hide_images ? '<i class="fa fa-eye-slash fa-2x"></i>' : '<i class="fa fa-eye fa-2x"></i>');
        } else
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
