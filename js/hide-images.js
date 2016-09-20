/*
 * hide-images.js
 * https://github.com/savetheinternet/Tinyboard/blob/master/js/hide-images.js
 *
 * Hide individual images.
 *
 * Released under the MIT license
 * Copyright (c) 2013 Michael Save <savetheinternet@tinyboard.org>
 *
 * Usage:
 *   $config['additional_javascript'][] = 'js/jquery.min.js';
 *   $config['additional_javascript'][] = 'js/hide-images.js';
 *
 */

$(document).ready(function(){
	if (settings.hideImageLinks) {
		var board = $('form input[name="board"]').val().toString();

		if (!localStorage.hiddenimages)
			localStorage.hiddenimages = '{}';

		// Load data from HTML5 localStorage
		var hidden_data = JSON.parse(localStorage.hiddenimages);

		var store_data = function() {
			localStorage.hiddenimages = JSON.stringify(hidden_data);
		};

		// Delete old hidden images (30+ days old)
		for (var key in hidden_data) {
			for (var id in hidden_data[key]) {
				if (hidden_data[key][id] < Math.round(Date.now() / 1000) - 60 * 60 * 24 * 30) {
					delete hidden_data[key][id];
					store_data();
				}
			}
		}

		if (!hidden_data[board]) {
			hidden_data[board] = {}; // id : timestamp
		}

		//$('div.post > a > img, div > a > img').each(function() {
		function do_hideimg() {
			var img = $(this);
			var fileinfo = img.parent().siblings('.file-info');
			var id = img.parent().parent().find('>p.intro> a.post_no:eq(1),>div.post.op>p.intro>a.post_no:eq(1)').text();

			var buttonHide = $('<button type="button" class="btn btn-default btn-xs">' +
			'<a class="hide-image-link" href="javascript:void(0)" style="text-decoration: none;">' +
			'<i class="fa fa-ban"></i></a></button>');


			var buttonShow = $('<button type=button class="btn btn-default btn-xs">' +
			'<a class="show-image-link" href="javascript:void(0)" style="text-decoration: none;">' +
			'<i class="fa fa-check-circle-o"></i></a></button>')
				.hide();


			buttonHide.click(function(evnt){
				img.addClass('hidden');
				buttonHide.hide();
				buttonShow.show();

				hidden_data[board][id] = Math.round(Date.now() / 1000);
				store_data();
			});

			buttonShow.click(function(evnt){
				img.removeClass('hidden');
				buttonHide.show();
				buttonShow.hide();

				delete hidden_data[board][id];
				store_data();
			});

			fileinfo.find('.btn-group').prepend(buttonHide).prepend(buttonShow);

			if (hidden_data[board][id])
				buttonHide.click();

		}

		$('div.post > a > img, div > a > img').each(do_hideimg);


		$(document).bind("new_post", function(e, post) {
			post = $(post);
			post.find('a > img').each(do_hideimg);
		});
	}
});
