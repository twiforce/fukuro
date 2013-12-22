/*
 * auto-reload.js
 * https://github.com/savetheinternet/Tinyboard/blob/master/js/auto-reload.js
 *
 * Navigation buttons and stuff
 *
 * Usage:
 *   $config['additional_javascript'][] = 'js/jquery.min.js';
 *   $config['additional_javascript'][] = 'js/jquery.scrollTo.min.js';
 *   $config['additional_javascript'][] = 'js/navigation.js';
 *
 */
 
$(document).ready(function () {
	$('body').append("<div id=\"navigation\"></div>")
		$("<a id=\"scrollUp\"><i class=\"fa fa-arrow-up\"></i> Наверх</a>&nbsp;<a id=\"scrollDown\"><i class=\"fa fa-arrow-down\"></i> Вниз</a>&nbsp;<a onclick=\"clearForm();\"><i class=\"fa fa-trash-o\"></i> Очистить</a>&nbsp;<a id=\"toggleForm\"><i class=\"fa fa-compress\"></i> Спрятать</a>&nbsp;<a id=\"formPosition\"><i class=\"fa fa-chevron-up\"></i> Поднять</a>").appendTo('#navigation');
		$('#navigation').css({
			"position": 'fixed',
			"bottom": '0px',
			"right": '0px',
			'padding': '5px',
			'background': '#AAAAAA',
		});
		
		if(isAndroid) {
			$('#navigation').html('<a id=\"scrollUp\"><i class=\"fa fa-arrow-up fa-2x\"></i></a>\
			<a id=\"scrollDown\"><i class=\"fa fa-arrow-down fa-2x\"></i></a>\
			<a onclick=\"clearForm();\"><i class=\"fa fa-trash-o fa-2x\"></i></a>\
			<a id=\"toggleForm\"><i class=\"fa fa-compress fa-2x\"></i></a>\
			<a id=\"formPosition\"><i class=\"fa fa-chevron-up fa-2x\"></i></a>');
			$('#navigation').css({
				"letter-spacing": '5px',
			});
		}
		$('#style-select').css({
			float: 'left'
		});
	$('#scrollDown').click(function () {
		jQuery.scrollTo('100%', 400);
	});
	$('#scrollUp').click(function () {
		jQuery.scrollTo('0%', 400);
	});
});