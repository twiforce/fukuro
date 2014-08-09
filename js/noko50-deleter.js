/*
 * noko50-deleter.js
 *
 * Hides posts on noko50 pages
 *
 * Usage:
 *   $config['additional_javascript'][] = 'js/jquery.min.js';
 *   $config['additional_javascript'][] = 'js/settings.js';
 *   $config['additional_javascript'][] = 'js/noko50-deleter.js';
 *
 */

onready(function(){
    if (settings.noko50clear) {
        var noko50clear = function () {
            if (window.location.pathname.split("+").pop() == '50.html')
                while ($(".post.reply").length > 50)
                    $(".post.reply:first").remove();
        };
        noko50clear();
        // allow to work with auto-reload.js, etc.
        $(document).bind('new_post', function (e, post) {
            noko50clear();
        });
    }
});