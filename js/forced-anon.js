/*
 * forced-anon.js
 * https://github.com/savetheinternet/Tinyboard/blob/master/js/forced-anon.js
 *
 * Released under the MIT license
 * Copyright (c) 2012 Michael Save <savetheinternet@tinyboard.org>
 *
 * Usage:
 *   $config['additional_javascript'][] = 'js/jquery.min.js';
 *   $config['additional_javascript'][] = 'js/forced-anon.js';
 *
 */

$(document).ready(function() {
    if (settings.forcedAnon) {
        var force_anon = function() {
            if($(this).children('a.capcode').length == 0) {
                var id = $(this).parent().children('a.post_no:eq(1)').text();

                if($(this).children('a.email').length != 0)
                    var p = $(this).children('a.email');
                else
                    var p = $(this);

                p.children('span.name').text(_('Anonymous'));
                if(p.children('span.trip').length != 0)
                    p.children('span.trip').text('');
            }
        };

        var enable_fa = function() {
            $('p.intro label').each(force_anon);
        };

        enable_fa();

        $(document).bind('new_post', function(e, post) {
            $(post).find('p.intro label').each(force_anon);
	    });
    }
});

