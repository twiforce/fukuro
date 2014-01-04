/*
 * image-hover.js
 *
 * Hover an image to view it.
 *
 * Released under the MIT license
 * Copyright (c) 2013 Macil Tech <maciltech@gmail.com>
 *
 * Usage:
 *   $config['additional_javascript'][] = 'js/jquery.min.js';
 *   $config['additional_javascript'][] = 'js/settings.js';
 *   $config['additional_javascript'][] = 'js/image-hover.js';
 *
 *
 */

$(document).ready(function(){
    if (settings.imageHover) {
        function init_image_hover() {
            var $image = $(this);
            var hovered_at;
            $image.hover(function(e) {
                var imageurl = $image.parent().attr("href");
                if($image.attr('data-old-src'))
                    return;

                hovered_at = {'x': e.pageX, 'y': e.pageY};

                var $newImage = $("<img/>");
                $newImage
                    .addClass('image-hover')
                    .attr('src', imageurl)
                    .css('position', 'absolute')
                    .css('margin', '0')
                    .css('padding', '0')
                    .css('maxWidth', '75%')
                    .css('maxHeight', '95%')
                    .css('z-index', 10)
                    .insertAfter($image.parent())
                    .load(function() {
                        $(this).trigger('mousemove');
                    });
                $image.trigger('mousemove');
            }, function() {
                $('.image-hover').remove();
            }).mousemove(function(e) {
                    var $hover = $('.image-hover');
                    if($hover.length == 0)
                        return;

                    var top = (e.pageY ? e.pageY : hovered_at['y']) - 10;

                    if(e.pageY < $(window).scrollTop() + 15) {
                        top = $(window).scrollTop();
                    } else if(e.pageY > $(window).scrollTop() + $(window).height() - $hover.height() - 30) {
                        top = $(window).scrollTop() + $(window).height() - $hover.height() - 30;
                    }

                    $hover.css('left', (e.pageX ? e.pageX : hovered_at['x']) + 20).css('top', top);
                }).click(function() {
                    $image.trigger('mouseleave');
                });
        }

        $('a:not([class="file"]) > img.post-image').each(init_image_hover);
        $(document).on('new_post', function(e, post) {
            $(post).find('> a:not([class="file"]) > img.post-image').each(init_image_hover);
        });
    }
});