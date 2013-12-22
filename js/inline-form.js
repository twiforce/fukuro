 /*
 * inline-form.js
 * 
 * Shows inline form after clicking on a post.
 *
 * Usage:
 *   $config['additional_javascript'][] = 'js/jquery.min.js';
 *   $config['additional_javascript'][] = 'js/hide-posts.js';
 *
 */

$(document).ready(function(){
	if(settings.inlineForm) {
		var do_addinlineform = function() {
			var post = this;
			var id = $(this).attr('id');
			$(this).append('<span><a class="inline-form-link" href="javascript:void(0)" style="text-decoration: none;"><i class="icon-play-sign"></i></a></span>');
			$('.inline-form-link').click(function() { $('form[name="post"]').appendTo($(this).parent().parent().parent()) });
			// That's a bit faster than parents().get(3)
		};
		
		$('p.intro').each(do_addinlineform);
		
		$(document).bind("new_post", function(e, post) {
			$(post.firstChild).each(do_addinlineform);
		});
	}
});
