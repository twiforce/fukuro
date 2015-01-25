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
    var spinner = $('#updateThread i');

    function receive(data, textStatus, jqXHR){

        var lastPost = postctrl.find('.post').last(),
            lastID = lastPost.attr('id').replace(/reply_/, '');
        lastID = Number(lastID);

        var posts = $(data).find('.post.reply');
        //kinda optimization - quit if no new posts
        if (posts.last().attr('id') != lastPost.attr('id')) {

            posts = posts.filter(function (index, elem) {
                var id = Number($(elem).attr('id').replace(/reply_/, ''));

                return (id > lastID)
            })
                .each(function (index, element) {
                    $(element).after('<br class="clear">');
                });

            if (settings.useAnimateCSS) {
                posts.addClass('animated fadeIn');
            }
            //smart move - send all fetched posts at once
            //in array because jQuery
            $(document).trigger('new_post', [posts]);

            lastPost.after(posts);
        }

    }


    var poll = function () {
        var updateGrowl;
        $.ajax({
            url: document.location,
            data: {nocache: Math.random()},
            beforeSend: function () {
                spinner.addClass('fa-spin');
                //fuck i'm never satisfied with how growl can crawl everywhere
                if (settings.growlEnabled){
                    updateGrowl = $.growl({
                        message: _('Обновление...')
                    }, {
                        delay: 0,
                        allow_dismiss: false
                    });
                }
            }
        }).done(receive)
            .fail(function(){
                $.growl({
                    title: "<b>" + _('Соединение потеряно!') + "</b><br>",
                    message: _('Не удалось получить новые посты.')
                }, {
                    type: "warning"
                });
            })
            .always(function(){
                spinner.removeClass('fa-spin');
                if (settings.growlEnabled){
                    updateGrowl.close();
                }
            });
    };

    (settings.simpleNavbar) ? $("#navigation").prepend('<a id=\"updateThread\"><i class="fa fa-refresh fa-lg"></i></a>&nbsp;') :
        (device_type == "mobile") ? $("#navigation").prepend('<a id=\"updateThread\"><i class="fa fa-refresh fa-2x"></i></a>&nbsp;') :
            $("#navigation").prepend('<a id=\"updateThread\"><i class="fa fa-refresh"></i> ' + _('Обновить') + '</a>&nbsp;');

    function pollNewPosts() {
        setInterval(function () {
            poll()
        }, poll_accuracy);
    }

    if(settings.updateThread) {
        pollNewPosts();
    }

    $('#updateThread').click(function () {
        poll();

    });


});
