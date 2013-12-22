/*
 * helper.js
 * 
 * Helper file, you probably will not need this one.
 * Must be loaded as the very last js file, be careful.
 *
 */

$(document).ready(function(){
	$('#navigation a, #markup a').css({
		"cursor": 'pointer',
		"text-decoration": 'none'
	});
	if (settings.showInfo) {
		$('footer').append("<p id=\"showInfo\" class=\"unimportant\" style=\"text-align:center;\"></p>");
		showInfo();
		setInterval("showInfo()",60000);
	}
	var do_replace_audio = function() {
		$('audio').mediaelementplayer();
	}
	/*var do_replace_math = function() {
		MathJax.Hub.Queue(["Typeset",MathJax.Hub]);
	}*/
	
	do_replace_audio(document);
	
	$(document).bind('new_post', function(e, post) {
		do_replace_audio(post);
		//do_replace_math(post);
	});
});

function showInfo() { 
	$.ajax({
		type: 'GET',
		url: "/testcount.json",
		dataType: 'json',
		success: function(data){
			ajaxInfo = data;
			$('#showInfo').text("Скорость борды: " + JSON.parse(ajaxInfo.speed) + " п/час | Онлайн: " + JSON.parse(ajaxInfo.online));
		}
	});
	
}