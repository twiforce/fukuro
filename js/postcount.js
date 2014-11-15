/*
 * postcount.js
 *
 * Usage:
 *   $config['additional_javascript'][] = 'js/jquery.min.js';
 *   $config['additional_javascript'][] = 'js/moment.js';
 *   $config['additional_javascript'][] = 'js/settings.js';
 *   $config['additional_javascript'][] = 'js/postcount.js';
 *
 */

defaultStats = {
    start: new Date(),
    posts: {
        sent: 0
    },
    threads: {
        created: 0
    }
};

if (localStorage.getItem("stats") == null)
    localStorage.setItem("stats", JSON.stringify(defaultStats));
var stats = JSON.parse(localStorage.getItem("stats"));

function saveAndUpdateStats() {
    $("#stats-start").html(' (' + _('с') + ' ' + moment(stats.start).format("LL") + ')');
    $("#stats-posts-sent").html(stats.posts.sent);
    $("#stats-threads-created").html(stats.threads.created);
    localStorage.setItem("stats", JSON.stringify(stats));
}

$(document).ready(function () {
   saveAndUpdateStats();
});