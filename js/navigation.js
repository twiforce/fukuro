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
	$('body').append("<div id='navigation_frame'><a id='show_hide_navigation_frame'><i class=\"fa fa-arrow-right\"></i>"+_("Убрать")+"</a><div id=\"navigation\"></div></div>");
		$("<a id=\"scrollUp\"><i class=\"fa fa-arrow-up\"></i> " + _("Наверх") + "</a>&nbsp;<a id=\"scrollDown\"><i class=\"fa fa-arrow-down\"></i> " + _("Вниз") + "</a>&nbsp;<a onclick=\"clearForm();\"><i class=\"fa fa-trash-o\"></i> " + _("Очистить") + "</a>&nbsp;<a id=\"toggleForm\"><i class=\"fa fa-compress\"></i> " + _("Спрятать") + "</a>&nbsp;<a id=\"formPosition\"><i class=\"fa fa-chevron-up\"></i> " + _("Поднять") + "</a>").appendTo('#navigation');
		$('#navigation_frame').css({
			"position": 'fixed',
			"bottom": '0px',
			"right": '0px',
			"padding": '0 0 0 5px',
		});
		$('#navigation').css({
			"display": 'inline-block',
			"padding": '5px',
			"margin": '0 0 0 5px'			
		});

    if (settings.simpleNavbar) {
        $('#navigation').html('<a id=\"scrollUp\"><i class=\"fa fa-arrow-up fa-lg\"></i></a>\
		<a id=\"scrollDown\"><i class=\"fa fa-arrow-down fa-lg\"></i></a>\
		<a onclick=\"clearForm();\"><i class=\"fa fa-trash-o fa-lg\"></i></a>\
		<a id=\"toggleForm\"><i class=\"fa fa-compress fa-lg\"></i></a>\
		<a id=\"formPosition\"><i class=\"fa fa-chevron-up fa-lg\"></i></a>');
        $('#navigation').css({
            "letter-spacing": '3px',
        });
    } else if(device_type == "mobile") {
		$('#navigation').html('<a id=\"scrollUp\"><i class=\"fa fa-arrow-up fa-2x\"></i></a>\
		<a id=\"scrollDown\"><i class=\"fa fa-arrow-down fa-2x\"></i></a>\
		<a onclick=\"clearForm();\"><i class=\"fa fa-trash-o fa-2x\"></i></a>\
		<a id=\"toggleForm\"><i class=\"fa fa-compress fa-2x\"></i></a>\
		<a id=\"formPosition\"><i class=\"fa fa-chevron-up fa-2x\"></i></a>');
		$('#navigation').css({
			"letter-spacing": '5px',
		});
	}
	$('#scrollDown').click(function () {
        $("html, body").animate({ scrollTop: $(document).height() }, "slow");
	});
	$('#scrollUp').click(function () {
        $("html, body").animate({ scrollTop: 0 }, "slow");
	});
	$('#show_hide_navigation_frame').click(function () {
		if (document.getElementById('navigation_frame').style.right == "0px"){
			$('#navigation_frame').animate({right: document.getElementById('navigation').offsetWidth*-1}, "slow");
			this.innerHTML = "<i class=\"fa fa-arrow-left\"></i>"+_("Меню");
		} else {
			$('#navigation_frame').animate({right: 0}, "slow");
			this.innerHTML = "<i class=\"fa fa-arrow-right\"></i>"+_("Убрать");
		}
	});
});
