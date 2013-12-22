 /*
 * notifications-html5.js
 * 
 * Cool html5 notifications
 *
 * Usage:
 *   $config['additional_javascript'][] = 'js/jquery.min.js';
 *   $config['additional_javascript'][] = 'js/notifications-html5.js';
 *
 */

$(document).ready(function(){
	if(settings.html5Notifications) {
		var board = $('form input[name="board"]').val().toString();
		
		var mailNotification = new Notification("Син.ч - " + document.title, {
			tag : "synch-message", 
			body : "body-message",
			icon : "post-image"
		});

		$(document).bind("new_post", function(e, post) {
			console.log($post.fin);
		});
		
	}
});
