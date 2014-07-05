/*
 * archive-link.js
 * https://github.com/twiforce/fukuro/blob/master/js/archive-link.js
 *
 * Adds a link to archive on the top and the bottom of page.
 * Requires catalog theme to be installed. 
 *
 * Usage:
 *   $config['additional_javascript'][] = 'js/jquery.min.js';
 *   $config['additional_javascript'][] = 'js/archive-link.js';
 *
 */

function archive() {
    var board = $("input[name='board']").attr('value');

    if (board) {
        var archive_url = "/" + board + "/arch/";
        var pages = document.getElementsByClassName('pages')[0];
        var bottom = document.getElementsByClassName('boardlist bottom')[0]
        var subtitle = document.getElementsByClassName('subtitle')[0];

        var link = document.createElement('a');
        link.href = archive_url;

        if (pages) {
            link.textContent = _('Архив');
            link.style.color = '#F10000';
            link.style.padding = '4px';
            link.style.paddingLeft = '9px';
            link.style.borderLeft = '1px solid';
            link.style.borderLeftColor = '#A8A8A8';
            link.style.textDecoration = "underline";

            pages.appendChild(link)
        }
        else {
            link.textContent = '[' + _('Архив') + ']';
            link.style.paddingLeft = '10px';
            link.style.textDecoration = "underline";
            document.body.insertBefore(link, bottom);
        }

        if (subtitle) {
            var link2 = document.createElement('a');
            link2.textContent = _('Архив');
            link2.href = archive_url;

            var br = document.createElement('br');
            subtitle.appendChild(br);
            subtitle.appendChild(link2);
        }
    }
}
$(document).ready(archive);