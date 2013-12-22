/*
 * markup-buttons.js
 * 
 * Adds markup buttons to the top of the form, and hotkey buttons that are using default bbcode.
 * Requires font-awesome 4  to show markup icons, replace <i class="fa fa-blah"></i> with your own pic instead.
 *
 * Usage:
 *   $config['additional_javascript'][] = 'js/jquery.min.js';
 *   $config['additional_javascript'][] = 'js/keymaster.js';
 *   $config['additional_javascript'][] = 'js/settings.js';
 *   $config['additional_javascript'][] = 'js/markup-buttons.js';
 *
 */

$(document).ready(function () {
	if (settings.markupButtons) {
		$("#body").before('<div id=\"markup\"></div><br/>');
		$("<a id=\"m-bold\"><i class=\"fa fa-bold\"></i></a><a id=\"m-italic\"><i class=\"fa fa-italic\"></i></a><a id=\"m-underline\"><i class=\"fa fa-underline\"></i></a><a id=\"m-strikethrough\"><i class=\"fa fa-strikethrough\"></i></a><a id=\"m-quote\"><i class=\"fa fa-chevron-right\"></i></a><a id=\"m-spoiler\"><i class=\"fa fa-square\"></i></a><a id=\"m-code\"><i class=\"fa fa-code\"></i></a><a id=\"m-roleplay\"><i class=\"fa fa-comments\"></i></a><a id=\"m-subscript\"><i class=\"fa fa-subscript\"></i></a><a id=\"m-superscript\"><i class=\"fa fa-superscript\"></i></a><a id=\"m-dice\"><i class=\"fa fa-question\"></i></a>").appendTo('#markup');
		$('#m-bold').click(function () {
			$("#body").surroundSelectedText("[b]", "[/b]");
		});
		$('#m-italic').click(function () {
			$("#body").surroundSelectedText("[i]", "[/i]");
		});
		$('#m-underline').click(function () {
			$("#body").surroundSelectedText("[u]", "[/u]");
		});
		$('#m-strikethrough').click(function () {
			$("#body").surroundSelectedText("[s]", "[/s]");
		});
		$('#m-quote').click(function () {
			$("#body").surroundSelectedText(">", "");
		});
		$('#m-spoiler').click(function () {
			$("#body").surroundSelectedText("[h]", "[/h]");
		});
		$('#m-code').click(function () {
			$("#body").surroundSelectedText("[code]", "[/code]");
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
			$('#m-strikethrough').click();
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