/*
 * sticky-form.js
 * 
 * Sticks the reply form to the bottom right edge of the screen.
 * This file contains a lot of features and really needs to be cleaned up, I'll do it a bit later.
 *
 * Usage:
 *   $config['additional_javascript'][] = 'js/jquery.min.js';
 *   $config['additional_javascript'][] = 'js/jquery.textareaCounter.plugin.js';
 *   $config['additional_javascript'][] = 'js/jquery.form.js';
 *   $config['additional_javascript'][] = 'js/sticky-form.js';
 *
 */


var clearForm = function() {
	$('#body, input[name="file"], input[name="file_url"], input[name="embed"]').val('');
}
 
$(document).ready(function () {
	var postform = $('form[name="post"]');
	if  (settings.stickyForm) {
		postform.css({
			"position": 'fixed',
			"bottom": '0px',
			"right": '0px',
			"margin-bottom": '30px',
			'background': '#AAAAAA',
		});
		
		var hideButton = '<i class=\"fa fa-compress\"></i>';
			if (device_type = "desktop") hideButton = hideButton + _(' Спрятать');
		var showButton = '<i class=\"fa fa-arrows-alt\"></i>';
			if (device_type = "desktop") showButton = showButton + _(' Открыть');
		var upButton = '<i class=\"fa fa-chevron-up\"></i>';
			if (device_type = "desktop") upButton = upButton + _(' Поднять');
		var downButton = '<i class=\"fa fa-chevron-down\"></i>';
			if (device_type = "desktop") downButton = downButton + _(' Опустить');
		
		$('#toggleForm').click(function () {
			var link = $(this);
			postform.slideToggle("100", function () {
				if ($(this).is(":visible")) {
					link.html(hideButton);
					localStorage.setItem("displayForm", true);
				} else {
					link.html(showButton);
					localStorage.setItem("displayForm", false);
				}
			});
		});
		if (localStorage.getItem("displayForm") == 'false') {
			postform.hide();
			$('#toggleForm').html(showButton)
		};
		$('#formPosition').toggle(function () {
			$(this).html(downButton);
			localStorage.setItem("formPosition", 'up');
			postform.css({
				"top": "0px",
				"bottom": "auto"
			});
		}, function () {
			$(this).html(upButton);
			localStorage.setItem("formPosition", 'down');
			postform.css({
				"bottom": "0px",
				"top": "auto"
			});
		});
		if (localStorage.getItem("formPosition") == 'up') {
			$('#formPosition').html(downButton);
			postform.css({
				"top": "0px",
				"bottom": "auto"
			});
		};
		$('.banner').hide();
		if (settings.simpleForm) {
			$('form[name=post] th').remove();
			$("label[for='spoiler']").text('Spoiler');
			$('input[name=name]').attr('placeholder', _('Имя (оставьте пустым)'));
			$('input[name=email]').attr('placeholder', _('Email (или sage)'));
			$('input[name=subject]').attr('placeholder', _('Тема'));
			$('input[name=body]').attr('placeholder', _('Введите сообщение'));
			$('input[name=embed]').attr('placeholder', _('Youtube/Pleer'));
			$('input[name=password]').hide();
			$('input[name="email"]').appendTo($('input[name="name"]').parent());
			$('input[name="email"], input[name="name"]').attr('size',18);
			$('input[name="subject"]').attr('size',28);
			$('input[name="spoiler"], label[for="spoiler"]').appendTo($('input[name="file"]').parent());
            $('form[name=post]').css({ "padding": '0px!important', });
            $('form[name=post] table').css({ "border-spacing": '0px', });
            $('form[name=post] input[type=text]').css({ "height": '17px', });
            $('input[name=embed]').css({ "width": 'calc(100% - 2px)', });
            $('textarea[name=body]').css({ "width": 'calc(100% - 6px)', });
            $('input[name=name]').css({ "width": '49%', });
            $('input[name=email]').css({ "width": '49%', "float": 'right', });
            $('input[name=post]').css({ "float": 'right', });
            $('input[name=subject]').css({ "width": '49%', });
		}
		
		if (device_type = "mobile") {
			postform.css({ "margin-bottom": '50px', });
			$('input[name=password]').remove();
			$('.fa-compress .fa-arrows-alt fa-chevron-up fa-chevron-down').addClass('fa-2x');
		}
	}
	
	if (settings.autoResizeForm) {
		$('textarea').css({ "resize": 'horizontal', "overflow": 'hidden' });
		$('textarea').keyup(function(){
			$(this).height(80); // min-height
			$(this).height(this.scrollHeight);
		});
	}
	
	// No refresh with jQuery Form Plugin
	if (settings.noRefresh) {
		var ajaxErrors = false;
		$('form[name="post"]').ajaxForm({
			beforeSend: function() {
				var percentVal = '0%';
			},
			uploadProgress: function(event, position, total, percentComplete) {
				var percentVal = percentComplete + '%';
				$('input[name=post]').attr("disabled", true);
				$('input[name=post]').attr('value',_('Отправка: ') + percentVal);
			},
			success: function(response, textStatus, xhr, form) {
				console.log($('response').contents().find('h1').text());
			},
			error: function(xhr, textStatus, errorThrown) {
				console.log("Lol something bad just happened");
			},
			complete: function(xhr, textStatus) {
				if (!(ajaxErrors)) {
					clearForm();
					$('input[name=post]').attr("disabled", false);
					$('input[name=post]').attr('value',_('Ответить'));
				}
			}
		});       

	}
	if (settings.textCountForm) {
		$('#body').textareaCount({  
			'maxCharacterSize': 4000,  
			'originalStyle': 'originalDisplayInfo',
			'displayFormat': _('#input символов | #left осталось')
		});
		$(".originalDisplayInfo").css({
			"font-size": '0.7em',
			"clear": 'both',
		});
	}
	if (settings.showFormOnCite) {
		$(window).on('cite', function() {
			if (localStorage.getItem("displayForm") == 'false') {
				postform.show();
				$('#toggleForm').html(hideButton);
				localStorage.setItem("displayForm", true);
			};
			$('textarea').height(this.scrollHeight);
		});
	}
});