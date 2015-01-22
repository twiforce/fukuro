/*
 * show-backlinks.js
 * https://github.com/savetheinternet/Tinyboard/blob/master/js/show-backlinks.js
 *
 * Released under the MIT license
 * Copyright (c) 2012 Michael Save <savetheinternet@tinyboard.org>
 *
 * Usage:
 *   $config['additional_javascript'][] = 'js/jquery.min.js';
 *   // $config['additional_javascript'][] = 'js/post-hover'; (optional; must come first)
 *   $config['additional_javascript'][] = 'js/show-backlinks.js';
 *
 */

onready(function(){
	if (settings.showBackLinks) {

		var showBackLinks = function() {
			var reply_id = $(this).attr('id').replace(/^reply_/, '');
			
			$(this).find('div.body a:not([rel="nofollow"])').each(function() {
				var id, post, $mentioned;
			
				if(id = $(this).text().match(/^>>(\d+)$/))
					id = id[1];
				else
					return;
			
				$post = $('#reply_' + id);
				if($post.length == 0)
					return;
			
				if (settings.backLinksStyle) {
					$mentioned = $post.find('p.intro span.mentioned');
					if($mentioned.length == 0)
						$mentioned = $('<span class="mentioned unimportant"></span>').appendTo($post.find('p.intro'));
					} else {
						$mentioned = $post.find('div.body span.mentioned');
						if($mentioned.length == 0)
							$mentioned = $('<span class="mentioned unimportant" style="display: block;	margin-top: 10px">Ответы: </span>').appendTo($post.find('div.body'));
						}
				if ($mentioned.find('a.mentioned-' + reply_id).length != 0)
					return;
				
				var $link = $('<a class="mentioned-' + reply_id + '" onclick="highlightReply(\'' + reply_id + '\');" href="#' + reply_id + '">&gt;&gt;' +
					reply_id + '</a>');
				$link.appendTo($mentioned)
				
				if (window.init_hover) {
					$link.each(init_hover);
				}
			});
		};

		function addReference(postid, num, context) {

			var post = $('#reply_' + postid);
			if (post.length == 0)
				post = context.filter('#reply_' + postid);

			var link = '<a class="mentioned-' + num + '" ';
			link += 'onclick="highlightReply(\'' + num + '\');" ';
			link += 'href="#' + num + '\">';
			link += '&gt;&gt;' + num + '</a>';
			var mentionSpan = '<span class="mentioned unimportant">Ответы: ' + link + '</span>'
			var mentioned = (settings.backLinksStyle) ? post.children('.intro').children('.mentioned') : post.children('.mentioned');
			if (mentioned.length == 0) {
				if (settings.backLinksStyle) {
					post.children('.intro').append(mentionSpan);
				}
				else {
					post.append(mentionSpan)
				}
			}
			else {
				mentioned.append(link);
			}
		}

		ids = [];
		function buildRefs(postArray, context) {
			var regex = /^>>(\d+)/; //>>number
			var refmap = {};


			postArray.each(function (index, post) {
				post = $(post);
				var id = post.attr('id').match(/^reply_(\d+)/)[1];
				ids.push(id);

				post.find('.body > a').each(function (index, link) {
					var postID;
					if (postID = $(link).text().match(regex)) {
						// if ever matches, [0] item contains the string and [1], [2], [3]... substrings
						//gonna be only one substring
						postID = postID[1];
						refmap[postID] = refmap[postID] || [];
						//don't allow identical values
						if (refmap[postID].indexOf(id) == -1) {
							refmap[postID].push(id);
						}
					}
				})
			})


			for (post in refmap){
				if (ids.indexOf(post) != -1){
					//post exists in this thread
					for (var len = refmap[post].length, i = 0; i < len; i++ ){
						addReference(post, refmap[post][i], postArray)
					}
				}
			}

		}

		buildRefs($('.post'))

			$(document).bind('new_post', function(e, post) {
			var post = $(post)
				buildRefs(post);
		});
		//console.profileEnd('backlinks');
	}
});

