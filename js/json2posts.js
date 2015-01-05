//json_parser

//шаблон поста.
'use strict';

var templatePost = $('<div class="post reply row" id="post-none"></div>');
var templateIntro = $('<p class="intro" id=intro-none></p>');
//these are inside templateIntro;
var templateDeleteBox = $('<input type="checkbox" class="delete" name="delete-none" id="delete-none">');
var templateLabel = $('<label for="none">');
//these are inside label
var templateSpanName = $('<span class="name"></span>');
var templateTrip = $('<span class="trip"></span>');
var templateDate = $('<time datetime="none" data-local="true"></time>');

var templatePostNo = $('<a class="post_no" href=none><i class="fa fa-sort"></i></a>');
var templatePostNo2 = $('<a class="post_no" href=javascript:void(0) onclick=none></a>');

//done with intro
var templateFileInfo = $('<span class="file-info">Later, pwease</span>');
var templateOldFileInfo = $('<p class="fileinfo hide">Later, mummy</p>');
var templateBody = $('<div class="body media-body"></div>');

function makePost(entry) {
    var post = templatePost.clone(false).attr('id', 'reply_' + entry.no);
    var intro = templateIntro.clone(false).attr('id', entry.no).appendTo(post);
    var box = templateDeleteBox.clone(false).attr('id', 'delete_' + entry.no).attr('name', 'delete_' + entry.no).appendTo(intro);
    //label area
    var label = templateLabel.clone(false).attr('for', 'delete_' + entry.no).appendTo(intro);
    var name = templateSpanName.clone(false).appendTo(label);
    if (entry.name)
        name.text(entry.name);
    if (entry.trip) {
        var trip = templateTrip.clone(true).text(entry.trip).appendTo(label);
    }
    var date = templateDate.clone().attr('datetime', entry.time).text(entry.time).appendTo(label);
    //done with label
    var postNo = templatePostNo.clone().appendTo(intro);
    var postNo2 = templatePostNo2.clone().html('<i class="fa fa-share-square-o"></i>' + entry.no).appendTo(intro);

    if (entry.filename) {
        var fileInfo = templateFileInfo.clone().appendTo(post);
        var oldInfo = templateOldFileInfo.clone().appendTo(post);
    }
    var body = templateBody.clone().html(entry.com).appendTo(post);

    return post;
}
