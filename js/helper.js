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

    var do_add_shorten = function() {
        $("div.post.reply div.body").shorten({
            moreText: 'Весь текст',
            lessText: 'Скрыть',
            showChars: (settings.hideLongTextNum),
        });
    }

    do_replace_audio(document);
    if (settings.hideLongText)
        do_add_shorten(document);
	
	$(document).bind('new_post', function(e, post) {
        do_replace_audio(post);
        if (settings.hideLongText)
            do_add_shorten(post);
	});

    if (device_type == "mobile") {
        $("#navigation .fa").addClass("fa-2x");
        $("#navigation .fa").click(function() {
            $("#navigation .fa").addClass("fa-2x");
        });
    }
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