/*
 * expand-all-images.js
 * https://github.com/savetheinternet/Tinyboard/blob/master/js/expand-all-images.js
 *
 * Adds an "Expand all images" button to the top of the page.
 *
 * Released under the MIT license
 * Copyright (c) 2012-2013 Michael Save <savetheinternet@tinyboard.org>
 *
 * Usage:
 *   $config['additional_javascript'][] = 'js/jquery.min.js';
 *   $config['additional_javascript'][] = 'js/inline-expanding.js';
 *   $config['additional_javascript'][] = 'js/expand-all-images.js';
 *
 */

$(document).ready(function() {
    if (settings.simpleNavbar) {
        $('#scrollUp').before('<a id="expand-all-images" href="javascript:void(0)"><i class="fa fa-search-plus fa-lg"></i></a>');
    } else  if (device_type == "mobile") {
        $('#scrollUp').before('<a id="expand-all-images" href="javascript:void(0)"><i class="fa fa-search-plus fa-2x"></i></a>');
    } else
	$('#scrollUp').before('<a id="expand-all-images" href="javascript:void(0)"><i class="fa fa-search-plus"></i> ' + _('Expand all images') + '</a>');
	$('#expand-all-images').click(function() {
			$('a img.post-image').each(function() {
				//check whether its an youtube link
				if ($(this).parents('div.video-container').length > 0)
					return;


				if (!$(this).parent()[0].dataset.expanded)
					$(this).parent().click();
			});
		});
});
