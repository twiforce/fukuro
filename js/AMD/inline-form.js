/*
 * inline-form.js
 *
 * Shows inline form after clicking on a post.
 *
 * jQuery must be loaded prior to that
 */
define(function () {
    function perform() {
    if ($(".post.op").size() != 1)
        return; //not thread page


        var link = $('<span><a class="inline-form-link" href="javascript:void(0)"\ ' +
        'style="text-decoration: none;"><i class="fa fa-caret-square-o-right"></i></a></span>');
        var $form = $('form[name="post"]');

        var formInfo = {
            //in order not to re-apply css every time form is shown
            changedToInline: false,
            previousLink: undefined,
            postID: 0
        };

        var addPostLink = function (index, element) {
            $(element).append(link.clone(true, true));
        };


        var showHideForm = function (evnt) {

            if (formInfo.previousLink == evnt.target) {
                //if we clicked at this one just before to show form
                //convert form to default and quit;
                formInfo.previousLink = undefined;
                formInfo.changedToInline = false;
                $form.css('clear', 'none');
                $form.find('table').css('margin', 'auto');
                $form.insertAfter($('.banner'));
                $form.css('float', 'none');
                return;
            }
            else {
                $form.insertAfter($(evnt.target).parents(".post"));
                formInfo.previousLink = evnt.target;
                formInfo.postID = $(formInfo.previousLink).parent().parent().parent().attr("id").replace("reply_", "");
                $("#body").val($("#body").val() + ">>" + formInfo.postID + "\n").focus();
            }

            if (!formInfo.changedToInline) {
                //convert to inline
                $form.find('table').css('margin', '4px');
                $form.css('clear', 'both');
                $form.css('float', 'left');
                $form.css('margin-bottom', '0');
                window.location.hash = "#reply_" + formInfo.postID;
                changedToInline = true;
            }
        };

        $('p.intro', 'div[id^=thread]').each(addPostLink);
        $('.inline-form-link', '.post').on('click', showHideForm);

        // quick reply hax
        if (/^#q\d+$/.test(window.location.hash)) {
            $("#body").val("");
            $("#reply_" + window.location.hash.substring(2, window.location.hash.length)).find(".inline-form-link").click();
        }

        $(document).bind("new_post", function (e, post) {
            //post is an array now, sorry
            post[0].children('.intro').each(addPostLink);
            post[0].find('.inline-form-link').on('click', showHideForm);
        });
    };
    return perform;
});