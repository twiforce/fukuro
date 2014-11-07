/*
 * auto-reload.js
 * https://github.com/savetheinternet/Tinyboard/blob/master/js/auto-reload.js
 *
 * Navigation buttons and stuff
 *
 * Usage:
 *   $config['additional_javascript'][] = 'js/jquery.min.js';
 *   $config['additional_javascript'][] = 'js/navigation.js';
 *
 */
 
$(document).ready(function () {
	$('body').append("<div id=\"navigation\"></div>");
		$("<a id=\"scrollUp\"><i class=\"fa fa-arrow-up\"></i> " + _("Наверх") +"</a>&nbsp;" +
				"<a id=\"scrollDown\"><i class=\"fa fa-arrow-down\"></i> " + _("Вниз") + "</a>&nbsp;" +
				"<a id=\"clearForm\" onclick=\"clearForm();\"><i class=\"fa fa-trash-o\"></i> " + _("Очистить") +"</a>")
			.appendTo('#navigation');
		$('#navigation').css({
			"position": 'fixed',
			"bottom": '0px',
			"right": '0px',
			'padding': '5px',
			'background': '#AAAAAA'
		});

    if (settings.simpleNavbar) {
        $('#navigation').html('<a id=\"scrollUp\"><i class=\"fa fa-arrow-up fa-lg\"></i></a>\
		<a id=\"scrollDown\"><i class=\"fa fa-arrow-down fa-lg\"></i></a>\
		<a id=\"clearForm\" onclick=\"clearForm();\"><i class=\"fa fa-trash-o fa-lg\"></i></a>')
			.css({
				"letter-spacing": '3px'
			});
    } else if(device_type == "mobile") {
		$('#navigation').html('<a id=\"scrollUp\"><i class=\"fa fa-arrow-up fa-2x\"></i></a>\
		<a id=\"scrollDown\"><i class=\"fa fa-arrow-down fa-2x\"></i></a>\
		<a id=\"clearForm\" onclick=\"clearForm();\"><i class=\"fa fa-trash-o fa-2x\"></i></a>')
			.css({
				"letter-spacing": '5px'
			});
	}
	$('#scrollDown').click(function () {
        $("html, body").animate({ scrollTop: $(document).height() }, "slow");
	});
	$('#scrollUp').click(function () {
        $("html, body").animate({ scrollTop: 0 }, "slow");
	});
});