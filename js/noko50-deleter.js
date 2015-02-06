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
        // Pass new posts number to clear function
        // because it's called before new posts are appended to document.
        var noko50clear = function (newPosts) {
            if (window.location.pathname.split("+").pop() == '50.html')
                while ($(".post.reply").length + newPosts > 50)
                    $(".post.reply:first").next('br').andSelf().remove();
        };
        noko50clear(0);
        // allow to work with auto-reload.js, etc.
        $(document).bind('new_post', function (e, post) {
            noko50clear(post.length);
        });
    }
});