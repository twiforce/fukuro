 /*
 * hide-posts.js
 * 
 * Hide individual posts.
 *
 * Usage:
 *   $config['additional_javascript'][] = 'js/jquery.min.js';
 *   $config['additional_javascript'][] = 'js/hide-posts.js';
 *
 */

$(document).ready(function(){
	if(settings.hidePosts) {
		var board = $('form input[name="board"]').val().toString();

        if (!localStorage.hiddenposts)
            localStorage.hiddenposts = '{}';
        if (settings.hidePostsMD5)
            if (!localStorage.hiddenpostsmd5)
                localStorage.hiddenpostsmd5 = '{}';

		// Load data from HTML5 localStorage
        var hidden_data = JSON.parse(localStorage.hiddenposts);
        if (settings.hidePostsMD5)
            var hidden_data_md5 = JSON.parse(localStorage.hiddenpostsmd5);

        var store_data = function() {
            localStorage.hiddenposts = JSON.stringify(hidden_data);
        };
        if (settings.hidePostsMD5)
            var store_data_md5 = function() {
                localStorage.hiddenpostsmd5 = JSON.stringify(hidden_data_md5);
            };

		// Delete old hidden posts (30+ days old)
		for (var key in hidden_data) {
			for (var id in hidden_data[key]) {
				if (hidden_data[key][id] < Math.round(Date.now() / 1000) - 60 * 60 * 24 * 30) {
					delete hidden_data[key][id];
					store_data();
				}
			}
		}

        if (!hidden_data[board]) {
            hidden_data[board] = {}; // id : timestamp
        }
        if (settings.hidePostsMD5)
            if (!hidden_data_md5[board]) {
                hidden_data_md5[board] = {}; // id : timestamp
            }

		var do_hidepost = function() {
			var post = this;
            var id = $(this).attr('id');
            var hash = $(this).parent().children('a').data('fileHash');
			var replacement = $('<span><a class="hide-post-link" title=\"' + _('Hide post') + '\" href="javascript:void(0)" style="text-decoration: none;"><i class="fa fa-minus-square"></i></a></span>');
			
			replacement.find('a').click(function() {
                hidden_data[board][id] = Math.round(Date.now() / 1000);
                store_data();
                if (settings.hidePostsMD5 && hash != undefined) {
                    hidden_data_md5[board][hash] = Math.round(Date.now() / 1000);
                    store_data_md5();
                }
				
				var show_link = $('<a class="show-post-link" title=\"' + _('Show post') + '\"  href="javascript:void(0)" style="text-decoration: none;"><i class="fa fa-plus-square"></i></a>').click(function() {
					delete hidden_data[board][id];
					store_data();
                    if (settings.hidePostsMD5 && hash != undefined) {
                        delete hidden_data_md5[board][hash];
                        store_data_md5();
                    }
					
					$(post).parent().removeClass('closed');
					$(this).prev().show();
					$(this).remove();
				});
				
				$(this).hide().after(show_link);
				
				if ($(post).parent()[0].dataset.expanded == 'true') {
					$(post).parent().click();
				}
				$(post).parent().addClass('closed');
			});
			
			$(this).append(replacement);

            if (hidden_data[board][id])
                $(this).find('.hide-post-link').click();
            if (settings.hidePostsMD5)
                if (hidden_data_md5[board][hash])
                    $(this).find('.hide-post-link').click();
		};
		
		$('.post.reply p.intro').each(do_hidepost);
		
		$(document).bind("new_post", function(e, post) {
			$(post.firstChild).each(do_hidepost);
		});
	}
});
