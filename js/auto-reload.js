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

    //kinda cache these
    var postctrl = $('form[name=postcontrols]');
    var $br = $('<br class="clear">');

    //growl notifications related
    //an attempt to isolate growl and ajax functional
    function growlAjaxOptions() {

        if (!settings.growlEnabled) {
            return;
        }
        options = {
            beforeSend: function () {
                this.updateGrowl = $.growl({
                    message: _('Обновление...')
                }, {
                    delay: 0,
                    allow_dismiss: false
                });
            },

            success: function (evnt, jqXHR, options) {
                this.updateGrowl.close();
            },

            error: function (evnt, jqXHR, options, error) {
                this.connectionGrowl = $.growl({
                    title: "<b>" + _('Соединение потеряно!') + "</b><br>",
                    message: _('Не удалось получить новые посты.')
                }, {
                    type: "warning"
                });
                this.updateGrowl.close();
            }
        };
        return options;
    }

    var poll = function (options) {
        $.ajax({
            url: document.location,
            data: {nocache: Math.random()},
            beforeSend: function () {
                if (options)
                    options.beforeSend();
                $('#updateThread i').addClass('fa-spin');
            },
            success: function (data) {
                //this is for debugging
                //var startTime = moment();

                //at least there should be an op-post
                var lastPost = postctrl.find('.post').last();
                var lastId = lastPost.attr('id');
                var lastIdNumber = Number(lastId.slice(6));
                var posts = $(data).find('div.post.reply', 'form[name=postcontrols]');
                //optimization - quit if there's no new posts
                if (posts.last().attr('id') != lastId) {

                    posts = posts.filter(function (index, element) {
                        return ($(element).attr('id').slice(6) > lastIdNumber);
                    })

                        .each(function (index, element) {
                            $(element).after($br.clone());
                        });
                    if (settings.useAnimateCSS) {
                        posts.addClass('animated fadeIn');
                    }
                    if (posts.length) {
                        //jQuery allows to pass either object or array
                        $(document).trigger('new_post', [posts]);
                        //TODO: make it more loosely-coupled.
                        if (settings.useMomentJS) {
                            now = moment();
                            momentize(document);
                        }

                        //Should be last action
                        lastPost.after(posts);
                    }
                }
                //var time = moment().diff(startTime);
                //wonder if that'll prevent some memory leaks
                data = null;
                //time in milliseconds
                //console.log(time);
                if (options)
                    options.success();
            },
            error: function () {
                if (options)
                    options.error();
            },
            complete: function () {
                $('#updateThread i').removeClass('fa-spin');
            }
        });
    };

    (settings.simpleNavbar) ? $("#navigation").prepend('<a id=\"updateThread\"><i class="fa fa-refresh fa-lg"></i></a>&nbsp;') :
        (device_type == "mobile") ? $("#navigation").prepend('<a id=\"updateThread\"><i class="fa fa-refresh fa-2x"></i></a>&nbsp;') :
            $("#navigation").prepend('<a id=\"updateThread\"><i class="fa fa-refresh"></i> ' + _('Обновить') + '</a>&nbsp;');

    function pollNewPosts() {
        setInterval(function () {
            poll(growlAjaxOptions())
        }, poll_accuracy);
    }

    if(settings.updateThread) {
        pollNewPosts();
    }

    $('#updateThread').click(function () {
        poll(growlAjaxOptions());

    });


});
