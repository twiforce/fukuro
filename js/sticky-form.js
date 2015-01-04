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
};
 
$(document).ready(function () {
	var postform = $('form[name="post"]');
	if  (settings.stickyForm) {
        postform.attr('id', 'quick-reply');
		postform.addClass('sticky-form');
		postform.css({
			"position": 'fixed',
			"bottom": '0px',
			"right": '0px',
			"margin-bottom": '40px',
            'background': '#AAAAAA',
            'z-index': '5'
		});

		if (settings.simpleNavbar) {
            var hideButton = '<a id="toggleForm"><i class=\"fa fa-compress fa-lg\"></i></a>';
            var showButton = '<a id="toggleForm"><i class=\"fa fa-arrows-alt fa-lg\"></i></a>';
            var upButton = '<a id="formPosition"><i class=\"fa fa-chevron-up fa-lg\"></i></a>';
            var downButton = '<a id="formPosition"><i class=\"fa fa-chevron-down fa-lg\"></i></a>';
        } else if (device_type == "mobile") {
            var hideButton = '<a id="toggleForm"><i class=\"fa fa-compress fa-2x\"></i></a>';
            var showButton = '<a id="toggleForm"><i class=\"fa fa-arrows-alt fa-2x\"></i></a>';
            var upButton = '<a id="formPosition"><i class=\"fa fa-chevron-up fa-2x\"></i></a>';
            var downButton = '<a id="formPosition"><i class=\"fa fa-chevron-down fa-2x\"></i></a>';
        } else {
            var hideButton = '<a id="toggleForm"><i class=\"fa fa-compress\"></i> '+ _(' Спрятать') + '</a>';
            var showButton = '<a id="toggleForm"><i class=\"fa fa-arrows-alt\"></i> ' + _(' Открыть') + '</a>';
            var upButton = '<a id="formPosition"><i class=\"fa fa-chevron-up\"></i> ' + _(' Поднять') + '</a>';
            var downButton = '<a id="formPosition"><i class=\"fa fa-chevron-down\"></i> ' + _(' Опустить') + '</a>';
        }

		$("#clearForm").after('&nbsp;', hideButton, '&nbsp;', upButton);
		
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
		}
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
		}
		$('.banner').hide();

		if (device_type == "mobile") {
			postform.css({ "margin-bottom": '50px' });
			$('input[name=password]').remove();
		}
	}
	
	if (settings.autoResizeForm) {
		$('textarea[name="body"]').css({ "resize": 'horizontal', "overflow": 'hidden' });
		$('textarea[name="body"]').keyup(function(){
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
                    if (typeof Recaptcha != 'undefined') {
                        Recaptcha.reload();
                    }
                    if ($('#captchaimg')) {
                        $('#captchaimg').click();
                    }
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
			"clear": 'both'
		});
	}
	if (settings.showFormOnCite) {
		$(window).on('cite', function() {
			if (localStorage.getItem("displayForm") == 'false') {
				postform.show();
				$('#toggleForm').html(hideButton);
				localStorage.setItem("displayForm", true);
			}
			$('textarea').height(this.scrollHeight);
		});
	}
});