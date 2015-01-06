//kinda makes sense to move it here since it's the furst AMD file ever
require.config({
    baseUrl : 'http://fukurodev.com' + '/js/'});

if (settings.quickReply) {
    require(['lib/interact-1.2.1.min', 'AMD/quick-reply'], function (interact, quickReply) {
//identifying костыли:
//yep, that's костыль.	
        require(['interact'], function (int) {
                quickReply(int);
            }
        )

    })
}