/*
 * markup-buttons.js
 * 
 * Adds markup buttons to the top of the form, and hotkey buttons that are using default bbcode.
 * Requires font-awesome 4  to show markup icons, replace <i class="fa fa-blah"></i> with your own pic instead.
 *
 * Usage:
 *   $config['additional_javascript'][] = 'js/jquery.min.js';
 *   $config['additional_javascript'][] = 'js/rangyinputs.min.js';
 *   $config['additional_javascript'][] = 'js/keymaster.js';
 *   $config['additional_javascript'][] = 'js/settings.js';
 *   $config['additional_javascript'][] = 'js/markup-buttons.js';
 *
 */

$(document).ready(function () {
	if (settings.markupButtons) {
		$("#body").before('<div id="markup" class="btn-group"></div><br/>');
		$("<button type=\"button\" class=\"btn btn-default\" id=\"m-bold\" title=\"" + _('Bold') + "\"><i class=\"fa fa-bold\"></i></button>" +
            "<button type=\"button\" class=\"btn btn-default\" id=\"m-italic\" title=\"" + _('Cursive') + "\"><i class=\"fa fa-italic\"></i></button>" +
            "<button type=\"button\" class=\"btn btn-default\" id=\"m-underline\" title=\"" + _('Underline') + "\"><i class=\"fa fa-underline\"></i></button>" +
            "<button type=\"button\" class=\"btn btn-default\" id=\"m-strikeout\" title=\"" + _('Strikeout') + "\"><i class=\"fa fa-strikethrough\"></i></button>" +
            "<button type=\"button\" class=\"btn btn-default\" id=\"m-quote\" title=\"" + _('Quote') + "\"><i class=\"fa fa-chevron-right\"></i></button>" +
            "<button type=\"button\" class=\"btn btn-default\" id=\"m-spoiler\" title=\"" + _('Spoiler') + "\"><i class=\"fa fa-square\"></i></button>" +
            "<button type=\"button\" class=\"btn btn-default\" id=\"m-code\" title=\"" + _('Code') + "\"><i class=\"fa fa-code\"></i></button>" +
            "<button type=\"button\" class=\"btn btn-default\" id=\"m-irony\" title=\"" + _('Irony') + "\"><i class=\"fa fa-pencil-square-o\"></i></button>" +
            "<button type=\"button\" class=\"btn btn-default\" id=\"m-roleplay\" title=\"" + _('Role Play') + "\"><i class=\"fa fa-comments\"></i></button>" +
            "<button type=\"button\" class=\"btn btn-default\" id=\"m-subscript\" title=\"" + _('Subscript') + "\"><i class=\"fa fa-subscript\"></i></button>" +
            "<button type=\"button\" class=\"btn btn-default\" id=\"m-superscript\" title=\"" + _('Superscript') + "\"><i class=\"fa fa-superscript\"></i></button>" +
            "<button type=\"button\" class=\"btn btn-default\" id=\"m-dice\" title=\"" + _('Dice (## 1d100 ##)') + "\"><i class=\"fa fa-question\"></i></button>").appendTo('#markup');
		$('#m-bold').click(function () {
			$("#body").surroundSelectedText("[b]", "[/b]");
		});
		$('#m-italic').click(function () {
			$("#body").surroundSelectedText("[i]", "[/i]");
		});
		$('#m-underline').click(function () {
			$("#body").surroundSelectedText("[u]", "[/u]");
		});
		$('#m-strikeout').click(function () {
			$("#body").surroundSelectedText("[s]", "[/s]");
		});
        $('#m-quote').click(function () {
            var seltext = $("#body").getSelection();
            $("#body").replaceSelectedText('>' + seltext.text.replace(/\n/g, '\n>'));
        });
		$('#m-spoiler').click(function () {
			$("#body").surroundSelectedText("[h]", "[/h]");
		});
		$('#m-code').click(function () {
			$("#body").surroundSelectedText("[code]", "[/code]");
		});
        $('#m-irony').click(function () {
            $("#body").surroundSelectedText("[irony]", "[/irony]");
        });
        $('#m-roleplay').click(function () {
            $("#body").surroundSelectedText("[rp]", "[/rp]");
        });
		$('#m-subscript').click(function () {
			$("#body").surroundSelectedText("[sub]", "[/sub]");
		});
		$('#m-superscript').click(function () {
			$("#body").surroundSelectedText("[sup]", "[/sup]");
		});
		$('#m-dice').click(function () {
			$("#body").surroundSelectedText("", "##1d100##");
		});
	}
	if (settings.markupHotkeys) {
		key('⌘+b, ctrl+b', function(event, handler){
			$('#m-bold').click();
			return false;
		});
		key('⌘+i, ctrl+i', function(event, handler){
			$('#m-italic').click();
			return false;
		});
		key('⌘+u, ctrl+u', function(event, handler){
			$('#m-underline').click();
			return false;
		});
		key('⌘+s, ctrl+s', function(event, handler){
			$('#m-strikeout').click();
			return false;
		});
		key('⌘+h, ctrl+h', function(event, handler){
			$('#m-spoiler').click();
			return false;
		});
        key('⌘+k, ctrl+k', function(event, handler){
            $('#m-code').click();
            return false;
        });
        key('⌘+o, ctrl+o', function(event, handler){
            $('#m-irony').click();
            return false;
        });
		key('⌘+\\, ctrl+\\', function(event, handler){
			$('#toggleForm').click();
			return false;
		});
		key('⌘+shift+\\, ctrl+shift+\\', function(event, handler){
			$('#formPosition').click();
			return false;
		});
		key('⌘+up, ctrl+up', function(event, handler){
			$('#scrollUp').click();
			return false;
		});
		key('⌘+down, ctrl+down', function(event, handler){
			$('#scrollDown').click();
			return false;
		});
		key('⌘+enter, ctrl+enter', function(event, handler){
			$('input[name="post"]').click();
			return false;
		});
	}
});