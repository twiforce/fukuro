/*
 * csseditor.js
 *
 * Enables a simple CSS editor for a page as a settings toggle.
 *
 * settings.js is required.
 *
 * Usage:
 *   $config['additional_javascript'][] = 'js/jquery.min.js';
 *   $config['additional_javascript'][] = 'js/settings.js';
 *   $config['additional_javascript'][] = 'js/csseditor.js';
 */

$(document).ready(function() {
    if (settings.useCustomCSS) {
        $('body').append('<style id="customStyle">' + settings.customCSS + '</style>');
        $('#applyCSS').click(function () {
            settings.customCSS = $("textarea[name=customCSS]").val();
            $('#customStyle').html(settings.customCSS);
        });
    }
});