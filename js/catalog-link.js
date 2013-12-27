/*
 * catalog-link.js
 * https://github.com/savetheinternet/Tinyboard/blob/master/js/auto-reload.js
 *
 * Adds a link to catalog on the top and the bottom of page.
 * Requires catalog theme to be installed. 
 *
 * Usage:
 *   $config['additional_javascript'][] = 'js/jquery.min.js';
 *   $config['additional_javascript'][] = 'js/catalog-link.js';
 *
 */

function catalog() {
var board = $("input[name='board']").attr('value');

if (board) { 
var catalog_url = "/" + board + "/" + 'catalog.html';
var pages = document.getElementsByClassName('pages')[0];
var bottom = document.getElementsByClassName('boardlist bottom')[0]
var subtitle = document.getElementsByClassName('subtitle')[0];

var link = document.createElement('a');
link.href = catalog_url;

if (pages) {
	link.textContent = _('Каталог тредов');
	link.style.color = '#F10000';
	link.style.padding = '4px';
	link.style.paddingLeft = '9px';
	link.style.borderLeft = '1px solid'
	link.style.borderLeftColor = '#A8A8A8';
	link.style.textDecoration = "underline";

	pages.appendChild(link)
}
else {
	link.textContent = '[' + _('Каталог тредов') + ']';
	link.style.paddingLeft = '10px';
	link.style.textDecoration = "underline";
	document.body.insertBefore(link, bottom);
}

if (subtitle) { 
	var link2 = document.createElement('a');
	link2.textContent = _('Каталог тредов');
	link2.href = catalog_url;

	var br = document.createElement('br');
	subtitle.appendChild(br);
	subtitle.appendChild(link2);	
}
}
}
$(document).ready(catalog);