/*
 * quick-reply.js
 * https://github.com/savetheinternet/Tinyboard/blob/master/js/quick-reply.js
 *
 * Released under the MIT license
 * Copyright (c) 2013 Michael Save <savetheinternet@tinyboard.org>
 *
 *
 */

define(function() {

    function perform(interact) {
        var header = $('<div class=form-header style="text-align:center">'
        + '<span class="form-header-text" >' + _("Quick Reply") + '</span>'
        + '<a class="close-btn" style="float:right" href="javascript:void(0)">X</a></div>');
        var floatingForm = $('form[name=post]');
        floatingForm.prepend(header);

        floatingForm.css({
            display: 'inline-block',
            right: '0px',
            top: '60px',
            position: 'fixed'
        });
        floatingForm.attr('id', 'quick-reply').addClass('floating-form');
        $('body').append(floatingForm);

        //placeholders and stuff
        //first move all hidden staff from table cells
        floatingForm.find('table td input:hidden, table textarea:hidden').appendTo(floatingForm).hide();
        //second - for every table row find a table header and make that header
        //a placeholder for input in that row
        floatingForm.find('tr').each(function (index, element) {
            var headerText = $(element).find('th').hide().text();

            var textContainer = $(element).find('textarea, input');
            textContainer.attr('placeholder', headerText);
        });
        //move "spoiler" checkbox closer to file input
        var spoilers = floatingForm.find('label[for=spoiler], input#spoiler');
        floatingForm.find('input[type=file]').after(spoilers);

        //probably fix textarea
        floatingForm.find('textarea[name=body]').removeAttr('cols').css('width', '100%');
        ;

        floatingForm.find('a.close-btn').on('click', function (evnt) {
            floatingForm.hide()
        });

        $(window).on('cite', function (evnt) {
            floatingForm.show();
            floatingForm.find('textarea[name=body]').focus();
        });

        //form drag
        dragForm = interact('#quick-reply .form-header');
        dragForm.draggable({
            inertia: false,
            restriction: window

        });
        dragForm.on('dragmove', function (evnt) {
            var right = parseFloat(floatingForm.css('right'));
            var top = parseFloat(floatingForm.css('top'));
            floatingForm.css('right', right - evnt.dx);
            floatingForm.css('top', top + evnt.dy);
        });

        dragForm.on('dragend', function (evnt) {
            var position = {top: 0, right: 0};
            position.right = parseFloat(floatingForm.css('right'));
            position.top = parseFloat(floatingForm.css('top'));
            localStorage.setItem('quickReplyPosition', JSON.stringify(position));
        });

        //retrieve floating form coordinates from localStorage, if present
        var qrPosition;
        if (qrPosition = localStorage.getItem('quickReplyPosition')) {
            //if there is a saved position, check whether form is inside the viewport
            qrPosition = JSON.parse(qrPosition);
            if (qrPosition.right < 0 || qrPosition.top > $(window).height() || qrPosition.top < 0 ) {
                //form is outside, reset
                qrPosition.right = 0;
                qrPosition.top = 60;
            }

            floatingForm.css('right', qrPosition.right);
            floatingForm.css('top', qrPosition.top);
        }
    };

    function doStuff(interact) {
        $(document).ready(function () {
            perform(interact)
        });
    }

    return doStuff;
});