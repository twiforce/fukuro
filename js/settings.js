/*
 * settings.js
 * 
 * Basic settings for Tinyboard. Requires .html file like this one http://syn-ch.ru/settings.html for setting up things.
 * Add to config after all jquery files to use settings.settingname in additional javascripts.
 * To add your own setting, simply change your settings.html and create if (settings.settingsname) condition
 * in additional js, you really have to include your new setting here only if you need to fix the state.
 *
 * This file now contains a tweaked interface, probably you'll need to wait a bit or just use this script within 18-21 lines.
 *
 * Usage:
 *   $config['additional_javascript'][] = 'js/jquery.min.js';
 *   $config['additional_javascript'][] = 'js/settings.js';
 *
 */

// Default settings
if (localStorage.getItem("settings") == null)
    localStorage.setItem("settings", "{\"ajax\":true, \"useLocalTime\":true, \"showInfo\":true, \"postHover\":true, \"markupButtons\":true, \"showSpoiler\":false, \"showNewMessages\":true, \"showSaveOriginalLinks\":true, \"showBackLinks\":true}");

// Current settings version. We'll be using this to notinfy users for updates
// Let's just start from one. That's kinda not the first settings.js but still, whatever, nobody cares
var version = 6;

var settings = JSON.parse(localStorage.getItem("settings"));

// A very rough and dirty settings panel, dollscript-like. Needs rewiting ASAP.
$(document).ready(function () {
    (settings.simpleNavbar) ? $('#navigation').append('&nbsp;<a id=\"toggleSettings\"><i class="fa fa-cogs fa-lg"></i></a>') :
        (device_type == "mobile") ? $('#navigation').append('&nbsp;<a id=\"toggleSettings\"><i class="fa fa-cogs fa-2x"></i></a>') :
            $('#navigation').append('&nbsp;<a id=\"toggleSettings\"><i class="fa fa-cogs"></i> ' + _('Настройки') + '</a>');
    $('body').append('<div id="settingsPopup"><h2>' + _('Настройки') + '</h2></div>');

    var bottom = document.getElementsByClassName('boardlist bottom')[0];
    var link = document.createElement('a');
    link.href = 'javascript:void(0);';
    link.id = 'settingsBottom';
    link.textContent = _('[Настройки]');
    link.style.paddingLeft = '10px';
    link.style.textDecoration = "underline";
    document.body.insertBefore(link, bottom);

    $('#settingsBottom').click(function () {
        $('#settingsPopup').toggle();
    });

    $('#settingsPopup').append('<div id="wrapper">\
	<a href="javascript:;" id="tab1" class="tabs active"><i class="fa fa-comments-o"></i> ' + _('Посты') + '</a>\
	<a href="javascript:;" id="tab2" class="tabs"><i class="fa fa-pencil-square-o"></i> ' + _('Форма') + '</a>\
	<a href="javascript:;" id="tab3" class="tabs"><i class="fa fa-puzzle-piece"></i> ' + _('Полезности') + '</a>\
	<a href="javascript:;" id="tab4" class="tabs"><i class="fa fa-wrench"></i> ' + _('CSS') + '</a>\
	<a href="javascript:;" id="tab5" class="tabs"><i class="fa fa-info"></i> ' + _('Дополнительно') + '</a>\
	<br/>\
	<div id="con_tab1" class="tabs active">\
	<p></p><input type="checkbox" name="updateThread">' + _('Обновлять тред каждые') + ' <input type="number" min="10" max="900" name="updateFrequency"> ' + _('с') + '<br>\
	' + _('Использовать') + ' <select id="ajaxPolling"><option value="ajax">' + _('новую') + '</option><option value="noRefresh">' + _('старую') + '</option><option value="externalPolling">' + _('внешнюю') + '</option></select> ' + _('AJAX-отправку сообщений') + '<br>\
	<input type="checkbox" name="showBackLinks">' + _('Отображать ссылки на ответы') + ' <select id="backLinksStyle"><option value="backLinksNormal">' + _('внизу') + '</option><option value="backLinks4chan">' + _('наверху') + '</option></select><br>\
	<select id="postHover"><option value="postHover">' + _('Новое') + '</option><option value="postHoverOld">' + _('Старое') + '</option><option value="postHoverDisabled">' + _('Не отображать') + '</option></select> ' + _('превью поста при наведении на ссылку') + '<br>\
	<input type="checkbox" name="imageHover">' + _('Показывать изображение при наведении на превью') + '<br>\
	<input type="checkbox" name="showNewMessages">' + _('Отображать количество новых постов в заголовке') + '<br>\
	<input type="checkbox" name="boopNewMessages">' + _('Звуковые уведомления о новых постах') + '<br>\
	<input type="checkbox" name="quoteSelection">' + _('Цитировать текст при выделении в посте') + '<br>\
	<input type="checkbox" name="hidePosts">' + _('Добавить кнопки для скрытия постов') + '<br>\
	<input type="checkbox" name="hideImageLinks">' + _('Добавить кнопки для скрытия изображений') + '<br>\
	</p></div><div id="con_tab2" class="tabs">\
	<p><select id="formStyle"><option value="defaultForm">' + _('Обычная (наверху)') + '</option><option value="bottomForm">' + _('Обычная (внизу)') + '</option><option value="stickyForm">' + _('Прикрепленная') + '</option><option value="quickReply">' + _('Плавающая') + '</option><option value="inlineForm">' + _('Внутри постов') + '</option></select> ' + _('форма ответа') + '<br>\
	<input type="checkbox" name="simpleForm">' + _('Упрощенная форма') + '<br>\
	<input type="checkbox" name="markupButtons">' + _('Отображать кнопки разметки') + '<br>\
	<input type="checkbox" name="markupHotkeys">' + _('Включить хоткеи') + '<br>\
	<input type="checkbox" name="textCountForm">' + _('Отображать количество введенных символов') + '<br>\
	<input type="checkbox" name="autoResizeForm">' + _('Автоматически расширять поле ввода') + '<br>\
	<input type="checkbox" name="showFormOnCite">' + _('Показывать прикрепленную форму при цитировании поста') + '<br>\
	</p></div><div id="con_tab3" class="tabs">\
	<p></p><input type="checkbox" name="snowfall">' + _('Включить снег') + '<br>\
	<input type="checkbox" name="useLocalTime">' + _('Использовать местное время') + '<br>\
	<input type="checkbox" name="useMomentJS">' + _('Местное время в формате "x минут назад"') + '<br>\
	<input type="checkbox" name="showSpoiler">' + _('Раскрывать изображения-спойлеры') + '<br>\
	<input type="checkbox" name="textSpoiler">' + _('Раскрывать текстовые спойлеры') + '<br>\
	<input type="checkbox" name="forcedAnon">' + _('Принудительная анонимизация') + '<br>\
	<input type="checkbox" name="simpleNavbar">' + _('Упрощенная панель навигации') + '<br>\
	<input type="checkbox" name="hideRoleplay">' + _('Не отображать тег [rp]') + '<br>\
	<input type="checkbox" name="hideLongText">' + _('Скрывать текст длиной более') + ' <input type="number" min="0" max="4000" name="hideLongTextNum"> ' + _('символов') + '<br>\
	<input type="checkbox" name="showInfo">' + _('Показывать онлайн и скорость борды') + '<br>\
	</p></div><div id="con_tab4" class="tabs">\
	<p><input type="checkbox" name="useCustomCSS">' + _('Использовать свой CSS') + '<button id="applyCSS" style="float: right"><i class="fa fa-eye"></i> ' + _('Предпросмотр') + '</button><br>\
	<textarea id="customCSS" rows="10" cols="45" name="customCSS"></textarea>\
	</p></div><div id="con_tab5" class="tabs">\
	<p>' + _('Экспорт/импорт настроек') + '<button id="applySettingsPlain" style="float: right"><i class="fa fa-check"></i> ' + _('Применить') + '</button><br>\
	<textarea id="settingsPlain" rows="10" cols="45" name="settingsPlain"></textarea></p></div></div>\
	<p><button id="save" href="javascript:void(0);"><i class="fa fa-floppy-o"></i> ' + _('Сохранить') + '</button>&nbsp;\
    <button id="close" href="javascript:void(0);" onclick="$(\'#settingsPopup\').hide()"><i class="fa fa-times"></i> ' + _('Закрыть') + '</button>&nbsp;\
    <button id="clear" href="javascript:void(0);"><i class="fa fa-eraser"></i> ' + _('Сбросить настройки') + '</button></p>');

    // http://jsfiddle.net/gxy45/2/
    $('#wrapper a').click(function () {
        var tab_id = $(this).attr('id');
        tabClick(tab_id)
    });
    function tabClick(tab_id) {
        if (tab_id != $('#wrapper a.active').attr('id')) {
            $('#wrapper .tabs').removeClass('active');
            $('#' + tab_id).addClass('active');
            $('#con_' + tab_id).addClass('active');
        }
    }

    $('#settingsPopup').css({
        "position": 'fixed',
        "top": '0px',
        "right": '0px',
        "width": '400px',
    });
    $('#settingsPopup').hide(); // That's how we roll, baby
    $('#toggleSettings').toggle(function () {
        $('#settingsPopup').show();
    }, function () {
        $('#settingsPopup').hide();
    });

    // Holy shit that's a lot
    $("textarea[name=customCSS]").val(settings.customCSS);
    if (settings.updateThread) {
        $("input[name=updateThread]").attr('checked', true);
        if (typeof settings.updateFrequency == 'undefined')
            $('input[name="updateFrequency"]').val(30);
        if (settings.updateFrequency <= 10)
            settings.updateFrequency = 20;
        $('input[name="updateFrequency"]').val(settings.updateFrequency)
    }
    if (settings.hideLongText) {
        $("input[name=hideLongText]").attr('checked', true);
        if (typeof settings.hideLongTextNum == 'undefined' || settings.hideLongTextNum == '')
            settings.hideLongTextNum = 2000;
        $('input[name="hideLongTextNum"]').val(settings.hideLongTextNum)
    }
    if (settings.showNewMessages) $("input[name=showNewMessages]").attr('checked', true);
    if (settings.postHover) $('#postHover option[value="postHover"]').attr('selected', 'selected');
    if (settings.postHoverOld) $('#postHover option[value="postHoverOld"]').attr('selected', 'selected');
    if (settings.postHoverDisabled)  $('#postHover option[value="postHoverDisabled"]').attr('selected', 'selected');
    if (settings.imageHover) $("input[name=imageHover]").attr('checked', true);
    if (settings.boopNewMessages) $("input[name=boopNewMessages]").attr('checked', true);
    if (settings.ajax) $('#ajaxPolling option[value="ajax"]').attr('selected', 'selected');
    if (settings.noRefresh) $('#ajaxPolling option[value="noRefresh"]').attr('selected', 'selected');
    if (settings.externalPolling) $('#ajaxPolling option[value="externalPolling"]').attr('selected', 'selected');
    if (settings.quoteSelection) $("input[name=quoteSelection]").attr('checked', true);
    if (settings.useLocalTime) $("input[name=useLocalTime]").attr('checked', true);
    if (settings.useMomentJS) $("input[name=useMomentJS]").attr('checked', true);
    if (settings.hideImageLinks) $("input[name=hideImageLinks]").attr('checked', true);
    if (settings.hidePosts) $("input[name=hidePosts]").attr('checked', true);
    if (settings.showSpoiler) $("input[name=showSpoiler]").attr('checked', true);
    if (settings.textSpoiler) $("input[name=textSpoiler]").attr('checked', true);
    if (settings.hideRoleplay) $("input[name=hideRoleplay]").attr('checked', true);
    if (settings.defaultForm)  $('#formStyle option[value="defaultForm"]').attr('selected', 'selected');
    if (settings.bottomForm) $('#formStyle option[value="bottomForm"]').attr('selected', 'selected');
    if (settings.stickyForm) $('#formStyle option[value="stickyForm"]').attr('selected', 'selected');
    if (settings.inlineForm) $('#formStyle option[value="inlineForm"]').attr('selected', 'selected');
    if (settings.simpleForm) $("input[name=simpleForm]").attr('checked', true);
    if (settings.quickReply)  $('#formStyle option[value="quickReply"]').attr('selected', 'selected');
    if (settings.textCountForm) $("input[name=textCountForm]").attr('checked', true);
    if (settings.autoResizeForm) $("input[name=autoResizeForm]").attr('checked', true);
    if (settings.showFormOnCite) $("input[name=showFormOnCite]").attr('checked', true);
    if (settings.showInfo) $("input[name=showInfo]").attr('checked', true);
    if (settings.snowfall) $("input[name=snowfall]").attr('checked', true);
    if (settings.useCustomCSS) $("input[name=useCustomCSS]").attr('checked', true);
    if (settings.markupButtons) $("input[name=markupButtons]").attr('checked', true);
    if (settings.forcedAnon) $("input[name=forcedAnon]").attr('checked', true);
    if (settings.simpleNavbar) $("input[name=simpleNavbar]").attr('checked', true);
    if (settings.markupHotkeys) $("input[name=markupHotkeys]").attr('checked', true);
    if (settings.showBackLinks) $("input[name=showBackLinks]").attr('checked', true);
    if (settings.backLinksStyle) $('#backLinksStyle option[value="backLinks4chan"]').attr('selected', 'selected');

    $('#save').click(function () {
        // Oh my god this is awkward.
        settings.updateFrequency = $("input[name=updateFrequency]").val();
        settings.hideLongTextNum = $("input[name=hideLongTextNum]").val();
        switch ($('#ajaxPolling option:selected').val()) {
            case 'ajax':
                settings.ajax = true;
                settings.noRefresh = false;
                settings.externalPolling = false;
                break;
            case 'noRefresh':
                settings.ajax = false;
                settings.noRefresh = true;
                settings.externalPolling = false;
                break;
            case 'externalPolling':
                settings.ajax = false;
                settings.noRefresh = false;
                settings.externalPolling = true;
                break;
            // shouldn't there be default case?
        }
        // huh, I thought it would look better this way
        switch ($('#formStyle option:selected').val()) {
            case 'stickyForm':
                settings.stickyForm = true;
                settings.bottomForm = false;
                settings.quickReply = false;
                settings.defaultForm = false;
                settings.inlineForm = false;
                break;
            case 'bottomForm':
                settings.stickyForm = false;
                settings.bottomForm = true;
                settings.quickReply = false;
                settings.defaultForm = false;
                settings.inlineForm = false;
                break;
            case 'quickReply':
                settings.stickyForm = false;
                settings.bottomForm = false;
                settings.quickReply = true;
                settings.defaultForm = false;
                settings.inlineForm = false;
                break;
            case 'defaultForm':
                settings.stickyForm = false;
                settings.bottomForm = false;
                settings.quickReply = false;
                settings.defaultForm = true;
                settings.inlineForm = false;
                break;
            case 'inlineForm':
                settings.stickyForm = false;
                settings.bottomForm = false;
                settings.quickReply = false;
                settings.defaultForm = false;
                settings.inlineForm = true;
                break;
        }
        switch ($('#postHover option:selected').val()) {
            case 'postHover':
                settings.postHover = true;
                settings.postHoverOld = false;
                settings.postHoverDisabled = false;
                break;
            case 'postHoverOld':
                settings.postHover = false;
                settings.postHoverOld = true;
                settings.postHoverDisabled = false;
                break;
            case 'postHoverDisabled':
                settings.postHover = false;
                settings.postHoverOld = false;
                settings.postHoverDisabled = true;
                break;
        }
        ($('#backLinksStyle option:selected').val() == "backLinks4chan") ? settings.backLinksStyle = true : settings.backLinksStyle = false;
        ($("input[name=updateThread]").prop('checked')) ? settings.updateThread = true : settings.updateThread = false;
        ($("input[name=showNewMessages]").prop('checked')) ? settings.showNewMessages = true : settings.showNewMessages = false;
        ($("input[name=imageHover]").prop('checked')) ? settings.imageHover = true : settings.imageHover = false;
        ($("input[name=boopNewMessages]").prop('checked')) ? settings.boopNewMessages = true : settings.boopNewMessages = false;
        ($("input[name=showBackLinks]").prop('checked')) ? settings.showBackLinks = true : settings.showBackLinks = false;
        ($("input[name=quoteSelection]").prop('checked')) ? settings.quoteSelection = true : settings.quoteSelection = false;
        ($("input[name=useLocalTime]").prop('checked')) ? settings.useLocalTime = true : settings.useLocalTime = false;
        ($("input[name=useMomentJS]").prop('checked')) ? settings.useMomentJS = true : settings.useMomentJS = false;
        ($("input[name=hideImageLinks]").prop('checked')) ? settings.hideImageLinks = true : settings.hideImageLinks = false;
        ($("input[name=hidePosts]").prop('checked')) ? settings.hidePosts = true : settings.hidePosts = false;
        ($("input[name=showSpoiler]").prop('checked')) ? settings.showSpoiler = true : settings.showSpoiler = false;
        ($("input[name=textSpoiler]").prop('checked')) ? settings.textSpoiler = true : settings.textSpoiler = false;
        ($("input[name=hideRoleplay]").prop('checked')) ? settings.hideRoleplay = true : settings.hideRoleplay = false;
        ($("input[name=markupButtons]").prop('checked')) ? settings.markupButtons = true : settings.markupButtons = false;
        ($("input[name=markupHotkeys]").prop('checked')) ? settings.markupHotkeys = true : settings.markupHotkeys = false;
        ($("input[name=simpleForm]").prop('checked')) ? settings.simpleForm = true : settings.simpleForm = false;
        ($("input[name=textCountForm]").prop('checked')) ? settings.textCountForm = true : settings.textCountForm = false;
        ($("input[name=autoResizeForm]").prop('checked')) ? settings.autoResizeForm = true : settings.autoResizeForm = false;
        ($("input[name=showFormOnCite]").prop('checked')) ? settings.showFormOnCite = true : settings.showFormOnCite = false;
        ($("input[name=snowfall]").prop('checked')) ? settings.snowfall = true : settings.snowfall = false;
        ($("input[name=forcedAnon]").prop('checked')) ? settings.forcedAnon = true : settings.forcedAnon = false;
        ($("input[name=simpleNavbar]").prop('checked')) ? settings.simpleNavbar = true : settings.simpleNavbar = false;
        ($("input[name=showInfo]").prop('checked')) ? settings.showInfo = true : settings.showInfo = false;
        ($("input[name=hideLongText]").prop('checked')) ? settings.hideLongText = true : settings.hideLongText = false;
        ($("input[name=enableBots]").prop('checked')) ? settings.enableBots = true : settings.enableBots = false;
        ($("input[name=useCustomCSS]").prop('checked')) ? settings.useCustomCSS = true : settings.useCustomCSS = false;
        settings.customCSS = $("textarea[name=customCSS]").val();
        settings.version = version;
        localStorage.setItem("settings", JSON.stringify(settings));
        location.reload();
    });

    if (($('#de-main').length) && (localStorage.getItem("dollScriptNotice") != "shown")) {
        $('body').append('<div id="dollScriptInfo"><b>' + _('Обратите внимание!') + '</b><br/>' + _('Кажется, у вас активирован пользовательский скрипт Dollchan Extension Tools ("Куклоскрипт"). Для стабильной работы сайта просим вас отключить этот пользовательский скрипт или <a id="dismissDollScript" href="javascript:void(0);">автоматически настроить имиджборд для корректной работы</a> (страница перезагрузится).') + '<br/>' + _('Кликните на это окно, чтобы закрыть его.') + '</div>');
        $('#dollScriptInfo').css({'position': 'fixed', 'cursor': 'pointer', 'top': '10px', 'width': '60%', 'padding': '5px', 'border-radius': '2px', 'background-color': 'white'});
        $("#dismissDollScript").click(function () {
            localStorage.setItem("settings", "{\"ajax\":false, \"showInfo\":true, \"markupButtons\":true, \"showSpoiler\":false}");
            localStorage.setItem("dollScriptNotice", "shown");
            $("#dollScriptInfo").hide();
            location.reload();
        });
        $("#dollScriptInfo").click(function () {
            localStorage.setItem("dollScriptNotice", "shown");
            $(this).hide();
        });
    } else if (settings.version != version) {
        noty({
            layout: 'topLeft',
            text: '<b>' + _('Обратите внимание!') + '</b><br/>'
                + _('Произошло обновление сайта. Возможно, добавились некоторые новые функции,' +
                    'или вам необходимо включить отсутствующий функционал в настройках.' +
                    'Загляните на <a href="/">главную страницу</a>, чтобы узнать список изменений.') +
                    '<br/>' + _('Кликните на это окно, чтобы закрыть его.'),
            callback: {
                onClose: function () {
                    settings.version = version;
                    localStorage.setItem("settings", JSON.stringify(settings));
                    $("#updateInfo").hide();
                }
            }
        });
    }
    $("#clear").click(function () {
        if (confirm(_('Вы уверены, что хотите вернуть настройки борды к стандартным?'))) {
            localStorage.removeItem('settings');
            location.reload();
        }
    });
    $("#settingsPlain").val(localStorage.getItem("settings"));
    $("#applySettingsPlain").click(function () {
        localStorage.setItem("settings", $("#settingsPlain").val());
        location.reload();
    });
});