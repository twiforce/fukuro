/**
 * ajax.js
 * https://github.com/twiforce/fukuro/blob/master/js/ajax.js
 *
 * Send posts via AJAX
 *
 * Released under the MIT license
 * Copyright (c) 2013 Michael Save <savetheinternet@tinyboard.org>
 * 				 2013-2015 Simon Twiforce <twiforce@syn-ch.ru>
 * 				 2014-2015 GhostPerson <https://github.com/GhostPerson>
 *
 * Usage:
 *   $config['additional_javascript'][] = 'js/jquery.min.js';
 *   $config['additional_javascript'][] = 'js/settings.js';
 *   $config['additional_javascript'][] = 'js/ajax.js';
 *   $config['additional_javascript'][] = 'js/postcount.js';
 *
 */
var messageGrowl;
$(window).ready(function() {
	if (settings.ajax) {
		var do_not_ajax = false;
		//kinda cache these
		var postctrl = $('form[name=postcontrols]');

		function receive(data){

			var lastPost = postctrl.find('.post').last(),
				lastID = lastPost.attr('id').replace(/reply_/, '');
			lastID = Number(lastID);

			var posts = $(data).find('.post.reply')
				.filter(function(index, elem){
					var id = Number($(elem).attr('id').replace(/reply_/, ''));

					return (id > lastID)
				})
				.each(function (index, element) {
					$(element).after('<br class="clear">');
				});

			if (settings.useAnimateCSS){
				posts.addClass('animated fadeIn');
			}

			$(document).trigger('new_post', [posts]);

			lastPost.after(posts);

		}

		var setup_form = function($form) {
			$form.submit(function() {

				if (settings.growlEnabled) {
					messageGrowl = $.growl({
						message: _('Отправка...')
					}, {
						delay: 0
					});
				}

				if (do_not_ajax)
					return true;
				var form = $(this);
				var submitBtn = form.find('input[type="submit"]');
				var submit_txt = submitBtn.val();

				if (window.FormData === undefined)
					return true;

				var formData = new FormData(this);
				formData.append('json_response', '1');
				formData.append('post', submit_txt);

				var updateProgress = function(e) {
					var percentage;
					if (e.position === undefined) { // Firefox
						percentage = Math.round(e.loaded * 100 / e.total);
					}
					else { // Chrome?
						percentage = Math.round(e.position * 100 / e.total);
					}
					if (settings.growlEnabled)
						messageGrowl.update('message', _('Posting... (#%)').replace('#', percentage));
					else
						$(form).find('input[type="submit"]').val(_('Posting... (#%)').replace('#', percentage));
				};

				$.ajax({
					url: this.action,
					type: 'POST',
					xhr: function() {
						var xhr = $.ajaxSettings.xhr();
						if(xhr.upload) {
							xhr.upload.addEventListener('progress', updateProgress, false);
						}
						return xhr;
					},
					success: function(post_response) {
						if (typeof Recaptcha != 'undefined') {
							Recaptcha.reload();
						}
						if ((typeof actually_load_captcha === 'function') && captchaProvider && captchaExtra) {
							actually_load_captcha(captchaProvider, captchaExtra);
						}
						if (typeof grecaptcha === "object") {
							grecaptcha.reset();
						}
						if (post_response.error) {
							if (post_response.banned) {
								if (settings.growlEnabled) {
									messageGrowl.update('message', post_response.banned);
								}
								// You are banned. Must post the form normally so the user can see the ban message.
								do_not_ajax = true;
								submitBtn.each(function() {
									var $replacement = $('<input type="hidden">');
									$replacement.attr('name', $(this).attr('name'));
									$replacement.val(submit_txt);
									$(this)
										.after($replacement)
										.replaceWith($('<input type="button">').val(submit_txt));
								});
								form.submit();

							} else {
								if (settings.growlEnabled)
									messageGrowl.update('message', post_response.error);
								else
									alert(post_response.error);
								submitBtn.val(submit_txt);
								submitBtn.removeAttr('disabled');
							}
						} else if (post_response.redirect && post_response.id) {
							if (!$(form).find('input[name="thread"]').length) {
								document.location = post_response.redirect;
								stats.threads.created++;
								saveAndUpdateStats();
							} else {
								$.ajax({
									url: document.location,
									cache: false,
									contentType: false,
									processData: false
								}, 'html')
									.done(receive)
									.done(function(){
										stats.posts.sent++;
										saveAndUpdateStats();
										highlightReply(post_response.id);

										window.location.hash = post_response.id;
										$(window).scrollTop($('#reply_' + post_response.id).offset().top);
									})
									.always(function(){
										if (settings.growlEnabled)
											messageGrowl.close();

										$(form).find('input[type="submit"]').val(submit_txt);
										$(form).find('input[type="submit"]').removeAttr('disabled');
										$(form).find('input[name="subject"],input[name="file_url"],\
											textarea[name="body"],input[type="file"],input[name="embed"]').val('').change();
									})

							}
							submitBtn.val(_('Posted...'));
						} else {
							if (settings.growlEnabled)
								messageGrowl.update('message', _('An unknown error occured when posting!'));
							else
								alert(_('An unknown error occured when posting!'));
							submitBtn.val(submit_txt);
							submitBtn.removeAttr('disabled');
						}
					},
					error: function() {
						// An error occured
						do_not_ajax = true;
						submitBtn.each(function() {
							var $replacement = $('<input type="hidden">');
							$replacement.attr('name', $(this).attr('name'));
							$replacement.val(submit_txt);
							$(this)
								.after($replacement)
								.replaceWith($('<input type="button">').val(submit_txt));
						});
						$(form).submit();
					},
					data: formData,
					cache: false,
					contentType: false,
					processData: false
				}, 'json');

				submitBtn.val(_('Posting...'));
				submitBtn.attr('disabled', true);

				return false;
			});
		};
		setup_form($('form[name="post"]'));

		$(window).on('quick-reply', function() {
			setup_form($('form#quick-reply'));
		});
	}
});
