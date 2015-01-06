/*
 Comes AFTER any form
 */

$(document).ready(function() {
    if (settings.simpleForm) {
        $('form[name=post] th').hide();
        $('label[for="spoiler"]').text(_('Spoiler'));
        $('input[name=name]').attr('placeholder', _('Имя (оставьте пустым)'));
        $('input[name=email]').attr('placeholder', _('Email (или sage)'));
        $('input[name=subject]').attr('placeholder', _('Тема'));
        $('input[name=body]').attr('placeholder', _('Введите сообщение'));
        $('input[name=embed]').attr('placeholder', _('Youtube/Pleer'));
        $('form[name=post] input[name=password]').hide();
        $('input[name="email"]').appendTo($('input[name="name"]').parent());
        $('input[name="email"], input[name="name"]').attr('size', 18);
        $('input[name="subject"]').attr('size', 28);
        $('input[name="spoiler"], label[for="spoiler"]').appendTo($('input[name="file"]').parent());
        $('form[name=post]').css({"padding": '0px!important'});
        $('form[name=post] table').css({"border-spacing": '0px'});
        $('input[name=embed]').css({"width": '100%'});
        $('textarea[name=body]').css({"width": '100%'});
        $('input[name=name]').css({"width": '50%'});
        $('input[name=email]').css({"width": '50%', "float": 'right'});
        $('input[name=post]').css({"float": 'right'});
        $('input[name=subject]').css({"width": '50%'});
        $('form[name=post]').addClass('simplified');
    }
});