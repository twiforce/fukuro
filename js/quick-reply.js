/*
 * quick-reply.js
 * https://github.com/savetheinternet/Tinyboard/blob/master/js/quick-reply.js
 *
 * Released under the MIT license
 * Copyright (c) 2013 Michael Save <savetheinternet@tinyboard.org>
 *
 * Usage:
 *   $config['additional_javascript'][] = 'js/jquery.min.js';
 *   $config['additional_javascript'][] = 'js/jquery-ui.custom.min.js'; // Optional; if you want the form to be draggable.
 *   $config['additional_javascript'][] = 'js/quick-reply.js';
 *
 */


if (settings.quickReply){


	var perform = function() {
		var header = $('<div class=form-header style="text-align:center">'
		+ '<span class="form-header-text" >'+_("Quick Reply") + '</span>'
		+'<a class="close-btn" style="float:right" href="javascript:void(0)">X</a></div>');
		var floatingForm = $('form[name=post]');
		floatingForm.prepend(header);

			floatingForm.css({
				display : 'inline-block',
				left : '40%',
				top : '40%',
				position : 'fixed'
			});
		floatingForm.attr('id', 'quick-reply');
		$('body').append(floatingForm);

		//placeholders and stuff
		//first move all hidden staff from table cells
		floatingForm.find('table td input:hidden, table textarea:hidden').appendTo(floatingForm).hide();
		//second - for every table row find a table header and make that header
		//a placeholder for input in that row
		floatingForm.find('tr').each(function(index, element){
			var headerText = $(element).find('th').hide().text();
				console.log(headerText);

			var textContainer = $(element).find('textarea, input');
				textContainer.attr('placeholder', headerText);
		});
		//move "spoiler" checkbox closer to file input
		var spoilers = floatingForm.find('label[for=spoiler], input#spoiler');
			floatingForm.find('input[type=file]').after(spoilers);

		//probably fix textarea
		floatingForm.find('textarea[name=body]').removeAttr('cols').css('width', '100%');;

		floatingForm.find('a.close-btn').on('click', function(evnt){
			floatingForm.hide()
		});

		$(window).on('cite', function(evnt){
			floatingForm.show();
			floatingForm.find('textarea[name=body]').focus();
		})

		//form drag
		dragForm = interact('#quick-reply .form-header');
		dragForm.draggable({
			inertia : false,
			restriction : window,

		});
		dragForm.on('dragmove', function(evnt){
			var left = parseFloat(floatingForm.css('left'));
			var top = parseFloat(floatingForm.css('top'));
			floatingForm.css('left', left + evnt.dx);
			floatingForm.css('top', top + evnt.dy);
		});

		dragForm.on('dragend', function(evnt){
		//TODO: save coordinates of floating form to localStorage
		});

	};


	$(document).ready(perform);
}
