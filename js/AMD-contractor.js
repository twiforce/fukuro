//kinda makes sense to move it here since it's the furst AMD file ever
require.config({
    baseUrl : '/js/'});

if (settings.quickReply) {
    require(['lib/interact-1.2.1.min', 'AMD/quick-reply'], function (interact, quickReply) {
//identifying костыли:
//yep, that's костыль. Оставлен оригинальным разработчиком.
        require(['interact'], function (int) {
                quickReply(int);
            }
        )

    })
} else if (settings.inlineForm){
    require(['AMD/inline-form'], function(doForm){
        $(document).ready(doForm);
    })
} else if(settings.stickyForm){
    //another kind of костыли
    $(document).ready(function(){
        require(['AMD/sticky-form'], function(){});
    })
} else if (settings.bottomForm){
    $(document).ready(function(){
        require(['AMD/bottom-form'], function(){});
    })
}

if (settings.simpleForm){
    require(['AMD/simple-form'], function(simplify){
        $(document).ready(simplify);
    });
}
