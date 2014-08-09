/**
 * post-hover-tree.js
 *
 * Post hover tree. Because post-hover.js isn't russian enough.
 *
 * Usage:
 *   $config['additional_javascript'][] = 'js/jquery.min.js';
 *   $config['additional_javascript'][] = 'js/settings.js';
 *   $config['additional_javascript'][] = 'js/post-hover-tree.js';
 *
 */

$(document).ready(function () {
    if (settings.postHover) {
        var hovering = false;
        var dont_fetch_again = [];
        var id;

        // http://stackoverflow.com/a/7385673
        $(document).mouseup(function (e) {
            if (!$(".hover").is(e.target) && $(".hover").has(e.target).length === 0) {
                $(".hover").remove();
                hovering = false;
            }
        });

        function init_hover_tree() {
            $("div.body > a, .mentioned > a").on({
                mouseenter: function () {
                    id = $(this).text().match(/^>>(\d+)$/);
                    $post = $('div.post#reply_' + id[1]);
                    if ($post.length == 0) {
                        var url = $(this).attr('href').replace(/#.*$/, '');

                        if ($.inArray(url, dont_fetch_again) != -1) {
                            return;
                        }
                        dont_fetch_again.push(url);

                        $.ajax({
                            url: url,
                            context: document.body,
                            success: function (data) {
                                $(data).find('div.post.reply').each(function () {
                                    if ($('#' + $(this).attr('id[1]')).length == 0)
                                        $('body').prepend($(this).css('display', 'none').addClass('hidden'));
                                });

                                $post = $('div.post#reply_' + id);
                                if ($post.length > 0) {
                                    init_hover_tree();
                                }
                            }
                        })
                    } else {
                        $("#reply_" + id[1]).clone().addClass("hover")
                            .css({'display': 'inline', 'position': 'absolute', 'top': $(this).offset().top + 20, 'left': $(this).offset().left })
                            .appendTo("body");
                        // This is still bad and I should feel bad.
                        $("#reply_" + id[1]+ ".hover:not(:last-child)").remove();
                        if ($("body").width()-$("#reply_" + id[1] + ".hover").last().position().left-$("#reply_" + id[1] + ".hover").last().width() < 100)
                           $("#reply_" + id[1] + ".hover").css({'left': $("body").width()-$("#reply_" + id[1] + ".hover").last().position().left});
                        hovering = true;
                    }
                },
                mouseleave: function () {
                    $(".hover").hover(function () {
                        hovering = true;
                        $("#reply_" + id[1]).trigger(init_hover_tree());
                    }, function () {
                        hovering = false;
                    });

                    $("html").mousemove(function () {
                        if (!(hovering) && ($(".hover").is(":visible"))) {
                            setTimeout(function () {
                                $(".hover").remove();
                            }, 500);
                        }
                    })
                }
            });
            ;
        }

        init_hover_tree(document);

        // allow to work with auto-reload.js, etc.
        $(document).bind('new_post', function (e, post) {
            init_hover_tree(post);
        });
    }
})