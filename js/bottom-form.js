/**
 * bottom-form.js
 *
 * Moving reply form to the bottom of the screen.
 *
 * Usage:
 *   $config['additional_javascript'][] = 'js/jquery.min.js';
 *   $config['additional_javascript'][] = 'js/settings.js';
 *   $config['additional_javascript'][] = 'js/bottom-form.js';
 *
 */

$(document).ready(function(){
    if($('div.banner').length == 0)
        return; // not index

    $("div.banner").insertBefore("div.delete:first");
    $("form[name='post']").insertBefore("div.delete:first");
});