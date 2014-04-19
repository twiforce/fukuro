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
			$(this).append('<span><a class="inline-form-link" href="javascript:void(0)" style="text-decoration: none;"><i class="fa fa-caret-square-o-right"></i></a></span>');
			$('.inline-form-link').click(function() {
                // That's a bit faster than parents().get(3)
                $('form[name="post"]').insertAfter($(this).parent().parent().parent()).css({ 'clear': 'both', 'margin-bottom': '0em' })
                $('form table').css({ 'margin': '4px' })
                $('input[name="post"]').click(function() {
                    $('form[name="post"]').insertAfter($('.banner'));
                    $('form table').css({ 'margin': 'auto' })
                })
            });
		};

		$('p.intro').each(do_addinlineform);

		$(document).bind("new_post", function(e, post) {
			$(post.firstChild).each(do_addinlineform);
		});
	}
});
