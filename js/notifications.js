/**
 * notifications.js
 *
 * Display global notifications in case something happened.
 * Rename notifications.json.example to notifications.json to get started.
 * Notification will display if user doesn't have cookie
 * or have a cookie with smaller timestamp than saved in cookie.
 *
 */
$(document).ready(function(){
    getNotifications();
    setInterval("getNotifications()", 60000);
});

function getNotifications() {
    var notificationGrowl;
    var notification_timestamp;
    $.ajax({
        type: 'GET',
        url: "/notifications.json",
        dataType: 'json',
        success: function(data) {
            notification_timestamp = data.timestamp;
            // getCookie() returns "" when the cookie is absent; compare as a
            // number so an empty value reliably means "never dismissed".
            if ((parseInt(getCookie('notification_dismissed'), 10) || 0) < data.timestamp) {
                if ($(".alert-notification").length == 0) {
                    notificationGrowl = $.growl(data.message, {
                        type: data.type + ' alert-notification',
                        allow_dismiss: true,
                        delay: 0
                    });
                }
            }
        }
    });
    $('.alert-notification > .close').click(function() {
        console.log('ok');
        setCookie('notification_dismissed', notification_timestamp)
    })
}

// I'm too lazy.
// http://www.w3schools.com/js/js_cookies.asp

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+ d.toUTCString();
    // Escape the value so it cannot break out of the cookie string and inject
    // extra attributes (e.g. a forged domain/path).
    var cnameSafe = encodeURIComponent(cname);
    var cvalueSafe = encodeURIComponent(cvalue);
    var cookieStr = cnameSafe + "=" + cvalueSafe + ";" + expires + ";path=/;SameSite=Lax";
    if (window.location.protocol === 'https:') {
        cookieStr += ";Secure";
    }
    document.cookie = cookieStr;
}

function getCookie(cname) {
    var name = encodeURIComponent(cname) + "=";
    var decodedCookie = document.cookie;
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return decodeURIComponent(c.substring(name.length, c.length));
        }
    }
    return "";
}