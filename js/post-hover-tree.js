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
        function init_hover_tree() {
            var id;
            $("div.body > a, .mentioned > a").hover(function() {
                if(id = $(this).text().match(/^>>(\d+)$/)) {
                    $("#reply_" + id[1]).clone().addClass("hover").css({'position': 'absolute', 'top': $(this).offset().top+20, 'left': $(this).offset().left+20 }).appendTo("body");
                } else {
                    return;
                }
            }, function() {
                $(".hover").hover(function() {
                }, function() {
                    setTimeout(function() {
                        $(".hover").remove();
                    }, 500);
                })
            });
        }

        init_hover_tree(document);

        // allow to work with auto-reload.js, etc.
        $(document).bind('new_post', function(e, post) {
            init_hover_tree(post);
        });
    }
})