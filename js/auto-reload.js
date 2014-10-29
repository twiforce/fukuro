/*
 * auto-reload.js
 * https://github.com/savetheinternet/Tinyboard/blob/master/js/auto-reload.js
 *
 * Brings AJAX to Tinyboard.
 *
 * Released under the MIT license
 * Copyright (c) 2012 Michael Save <savetheinternet@tinyboard.org>
 *
 * Usage:
 *   $config['additional_javascript'][] = 'js/jquery.min.js';
 *   $config['additional_javascript'][] = 'js/settings.js';
 *   $config['additional_javascript'][] = 'js/auto-reload.js';
 *
 */

$(document).ready(function(){
	if($('div.banner').length == 0)
		return; // not index
		
	if($(".post.op").size() != 1)
		return; //not thread page

	if ((settings.updateFrequency <= 10) || (typeof settings.updateFrequency == 'undefined')) {
		settings.updateFrequency = 10;
	}
	var poll_accuracy = settings.updateFrequency * 1000;
    var updateGrowl;
    var connectionGrowl;
	
	var poll = function() {
		$.ajax({
			url: document.location,
            data: {nocache: Math.random()},
			beforeSend: function() {
                $('#updateThread i').addClass('fa-spin');
                if (settings.growlEnabled) {
                    updateGrowl = $.growl({
                        message: _('Обновление...')
                    }, {
                        delay: 0,
                        allow_dismiss: false
                    });
                }
            },
            error: function(xhr, status, error) {
                if (settings.growlEnabled) {
                    connectionGrowl = $.growl({
                        title: "<b>" + _('Соединение потеряно!') + "</b><br>",
                        message: _('Не удалось получить новые посты.')
                    }, {
                        type: "warning"
                    });
                }
            },
			success: function(data) {
                if (settings.updateThread && settings.growlEnabled) {
                    updateGrowl.close();
                }
				$(data).find('div.post.reply').each(function() {
					var id = $(this).attr('id');
					if($('#' + id).length == 0) {
						$(this).insertAfter($('div.post:not(.hover):not(.post-hover):last').next()).after('<br class="clear">');
                        if (settings.useAnimateCSS) {
                            $(this).addClass('animated fadeIn');
                        }
						$(document).trigger('new_post', this);
					}
                    if (settings.useMomentJS) {
                        now = moment();
                        momentize(document);
                    }
				});
                $('#updateThread i').removeClass('fa-spin');
                updateGrowl.close();
			}
		});
	};

    (settings.simpleNavbar) ? $("#navigation").prepend('<a id=\"updateThread\"><i class="fa fa-refresh fa-lg"></i></a>&nbsp;') :
        (device_type == "mobile") ? $("#navigation").prepend('<a id=\"updateThread\"><i class="fa fa-refresh fa-2x"></i></a>&nbsp;') :
            $("#navigation").prepend('<a id=\"updateThread\"><i class="fa fa-refresh"></i> ' + _('Обновить') + '</a>&nbsp;');
	
	function pollNewPosts() {
        setInterval(poll, poll_accuracy);
	}
	
	if(settings.updateThread) {
        pollNewPosts();
	}
	
	$('#updateThread').click(function () {
        poll();
	});
});

