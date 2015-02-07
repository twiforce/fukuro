/*
relies on jQuery, uses fukuro json api
 */

/*
    path : "/$board/$thread.json"
    id : number || numeric string
 */

$(function() {

    $('span.toolong').each(function (index, element) {
        //sorry for this mess
        element = $(element);
        var postId = element.parent().parent().attr('id');
        postId = postId.replace(/reply_/, '');

        var path = element.children('a').attr('href');  // looks like : /b/12345.html#12345
        path = path.replace(/html/, 'json').replace(/#\d+/, '');

        var postBody = element.parent();

        element.click(function () {
            $.get(path, function (data) {
                for (var i = 0, len = data.posts.length; i < len; i++) {
                    if (data.posts[i].no == postId) {
                        postBody.html(data.posts[i].com)
                    }
                }
            })
            return false;
        })
    })
});