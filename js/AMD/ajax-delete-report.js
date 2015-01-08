/*
 * Former ajax-post-controls.js
 *
 */

define(function(){
    function setupForm ($form) {
        $form.find('input[type="submit"]').click(function () {
            $form.data('submit-btn', this);
        });

        $form.submit(function (e) {
            if (!$(this).data('submit-btn'))
                return true;
            if (window.FormData === undefined) {
                return true;
            }

            var form = $(this);
            var triggerButton = $(form.data('submit-btn'));
            var formData = new FormData(form[0]);
            formData.append('json_response', '1');
            formData.append(triggerButton[0], triggerButton.val());
            //formData.append($($(form).data('submit-btn')).attr('name'), $($(form).data('submit-btn')).val());


            $.ajax({
                url: this.action,
                type: 'POST',
                success: function (post_response) {

                    if (post_response.error) {
                        alert(post_response.error);
                    } else if (post_response.success) {
                        switch (triggerButton.attr('name')) {
                            case 'report':
                                alert(_('Reported post(s).'));
                                break;
                            case 'delete':
                                alert('Deleted successfully');
                                break;
                            default :
                                console.debug('now we fucked up');
                        }
                    }
                    else
                        window.location.reload();

                    triggerButton.val(triggerButton.data('orig-val'))
                        .removeAttr('disabled');
                },
                error: function (xhr, status, er) {
                    // An error occured
                    // TODO
                    alert(_('Something went wrong... An unknown error occured!'));
                },
                data: formData,
                cache: false,
                contentType: false,
                processData: false
            }, 'json');

            triggerButton.attr('disabled', true)
                .data('orig-val', triggerButton.val())
                .val(_('Working...'));

            return false;
        });
    }

    //setup_form($('form[name="postcontrols"]'));
    /*
    $(window).on('quick-post-controls', function (e, form) {
        setupForm($(form));
    });
    */
    return setupForm
});
