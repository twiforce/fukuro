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
	
	var poll_interval;
	if ((settings.updateFrequency <= 10) || (typeof settings.updateFrequency == 'undefined')) {
		settings.updateFrequency = 10;
	}
	var poll_accuracy = settings.updateFrequency * 1000;
    var updateGrowl;
    var connectionGrowl;
    var manualUpdate = false;
	
	var poll = function() {
		$.ajax({
			url: document.location,
            data: {nocache: Math.random()},
			beforeSend: function() {
                $('#updateThread i').addClass('fa-spin');
                if (settings.growlEnabled) {
                    if (manualUpdate && $("[data-growl=container]").length != 0) {
                        updateGrowl.update('message', 'Продолжаем обновление...');
                    } else updateGrowl = $.growl({
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
						$(document).trigger('new_post', this);
						$('#updateThread i').removeClass('fa-spin');
					}
                    if (settings.useMomentJS) {
                        now = moment();
                        momentize(document);
                    }
				});
			}
		});
		(settings.updateThread == "false") ? poll_interval = false : poll_interval = setTimeout(poll, poll_accuracy);
	};

    (settings.simpleNavbar) ? $("#navigation").prepend('<a id=\"updateThread\"><i class="fa fa-refresh fa-lg"></i></a>&nbsp;') :
        (device_type == "mobile") ? $("#navigation").prepend('<a id=\"updateThread\"><i class="fa fa-refresh fa-2x"></i></a>&nbsp;') :
            $("#navigation").prepend('<a id=\"updateThread\"><i class="fa fa-refresh"></i> ' + _('Обновить') + '</a>&nbsp;');
	
	function pollNewPosts() {
		clearTimeout(poll_interval);
		poll_interval = setTimeout(poll, poll_accuracy);
	}
	
	if(settings.updateThread) {
        pollNewPosts();
	}
	
	$('#updateThread').click(function () {
		$('#updateThread i').addClass('fa-spin');
		poll_interval = setTimeout(poll, 1000);
        manualUpdate = true;
		$(document).bind('new_post', function(e, post) {
			clearTimeout(poll_interval);
            updateGrowl.close();
        });
	});
});

