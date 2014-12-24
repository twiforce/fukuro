/**
 * post-hover-tree.js
 *
 * Post hover tree. Because post-hover.js isn't russian enough.
 *
 * Usage:
 *   $config['additional_javascript'][] = 'js/jquery.min.js';
 *   $config['additional_javascript'][] = 'js/settings.js';
 *   $config['additional_javascript'][] = 'js/post-hover-tree.js';
 *
 */

$(document).ready(function () {
    if (settings.postHover) {
        var hovering = false;
        var dont_fetch_again = [];
        var id;
        var hoversBack = false;

        function summonPost(link) {
            id = $(link).text().match(/^>>(\d+)$/)[1];
            console.log('Summoning '+id+"'s clone");
            //first search for hover
            var $hover = $("#hover_reply_"+id);
            if ($hover.length !== 0) {
                console.log('Element is already hovered');
                return $hover[0];
            }
            //then search for post in document
            var $post = $('#reply_'+id);
            if ($post) {
                return $post.clone().addClass('hover').attr('id', 'hover_reply_'+id);
            }

            //then try to retrieve it via ajax
            var url = $(link).attr('href').replace(/#.*$/, '');

            if ($.inArray(url, dont_fetch_again) != -1) {
                return;
            }
            dont_fetch_again.push(url);

            $.ajax({
                url: url,
                context: document.body,
                success: function (data) {
                    $(data).find('div.post.reply').each(function () {
                        if ($('#' + $(this).attr('id[1]')).length == 0)
                            $('body').prepend($(this).css('display', 'none'));
                    });
                }
            })
        }

        var lesenka = {
            tail: null,
            activeTail: null,
            root: null,
            _clearTimeout: null,

            open: function(parent, post){
                console.log('Opening '+parent.id+' -> '+id);

                var newChain = true;

                //prevent branching: remove all hovers when switching root
                if (!$(parent).hasClass('hover') && parent != this.root) {
                    console.log('Changing root to '+parent.id);
                    this.clear(this.root);
                    //if parent is not .hover, set root to parent
                    this.root = parent;
                }
                //if parent has hovers (and #hover-id is not an immediate child), remove them
                else if (parent != this.tail) {
                    // Moving to data-attributes
                    // if (!$(post).parent().is(parent)) {
                    if (!$(parent).data('hover-child') === post.id) {
                        console.log('Rebuilding chain');
                        this.clear(parent);
                    }
                    else {
                        newChain = false;
                    }
                }

                if (newChain) {
                    $(post).children('.hover').remove();
                    //append hover to current parent
                    //no this is lame i'd better use data attributes!11
                    // $(parent).append(post);
                    $('body').append(post);
                    $(parent).data('hover-child', post.id);
                    this.tail = post;
                }

                //do inPost(#hover-id) (manage active tail)
                this.inPost(post);
            },

            inPost: function(post){
                //set active tail
                console.log('Setting active tail to '+post.id);
                this.activeTail = post;
                //[re]launch the clear timer
                clearTimeout(this._clearTimeout);
                if (post != this.tail) {
                    this._clearTimeout = setTimeout(this.clear.bind(this), 1000);
                }
                /*
                 $('.active').removeClass('active');
                 $(post).addClass('active'); //if it's hover
                 */
            },
            out: function(){
                if (this.root) {
                    this.inPost(this.root);
                }
            },
            //removes hover subchain beginning from clearRoot's child
            clear: function(clearRoot){
                //if root is unspecified, clear from active tail
                clearRoot = clearRoot || this.activeTail;
                if (!clearRoot) return null;
                console.log('Clearing subtree of '+clearRoot.id);
                // Not so easy
                // $(clearRoot).children('.hover').remove();
                var nextId = $(clearRoot).data('hover-child');
                $(clearRoot).data('hover-child', null);
                while (nextId != undefined) {//undefined or null
                    var toDelete = $('#' + nextId);
                    nextId = toDelete.data('hover-child');
                    toDelete.remove();
                }
                this.tail = clearRoot;
            }
        };

        // http://stackoverflow.com/a/7385673
        $(document).mouseup(function (e) {
            if (!$(".hover").is(e.target) && $(".hover").has(e.target).length === 0) {
                setTimeout(function () {
                    $(".hover").remove();
                }, 0);
                hovering = false;
            }
        });


        function init_hover_tree(target) {

            $(target).delegate('div.body >a , .mentioned > a', 'mouseenter', linkOver);
            $(target).delegate('div.body >a , .mentioned > a', 'mouseleave', hoverLeave);
            $(target).delegate('div.post.hover', 'mouseenter', hoverOver);
            $(target).delegate('div.post.hover', 'mouseleave', hoverLeave);
        }

        var linkOver = function(evnt)
        {
            //if (!summon(id) { //retrieve url; //summonAjax(url, id) }
            var post = summonPost(this);
            if (post)
            {
                var parent = $(this).closest('div.post')[0];
                lesenka.open(parent, post);
                position($(this), post, evnt);
            }
        };

        var hoverOver = function(evnt)
        {
            lesenka.inPost(evnt.target);
        };

        var hoverLeave = function(evnt)
        {
            lesenka.out();
            /* Oh my Celestia!
             $(".hover").hover(function () {
             hovering = true;
             }, function () {
             hovering = false;
             });

             $("html").mousemove(function () {
             if (!(hovering) && ($(".hover").is(":visible"))) {
             setTimeout(function () {
             $(".hover").remove();
             }, 500);
             }
             })
             */
        };


        var position = function(link, newPost, evnt)
        {

            newPost .css({
                'display': 'inline',
                'position': 'absolute',
                'top': link.offset().top,
                'left': link.offset().left
            });

            if ($("body").width() - newPost.last().position().left-newPost.last().width() < 15)
            {
                newPost.css({
                    'left': 'auto',
                    'right': '15px'
                });
            }
        };

        init_hover_tree(document);

        // allow to work with auto-reload.js, etc.
        //no need in this now, "deledate" takes care of everything
        /*
         $(document).bind('new_post', function (e, post) {
         init_hover_tree(post);
         });
         */
    }
});


///////////////////////////////////////////////////////////////////////


/*
 document.addEventListener('DOMContentLoaded', function(e) {
 var posts = document.querySelectorAll("div.post");
 for (var i=0, len=posts.length; i<len; i++) {
 linkify(posts[i]);
 }
 }, false);

 var lesenka = {
 tail: null,
 activeTail: null,
 root: null,
 _clearTimeout: null,

 open: function(parent, id){
 console.log('Opening '+parent.id+' -> '+id);

 var newChain = true;

 //clone post #id if not already
 var post = summonPost(id);

 //prevent branching: remove all hovers when switching root
 if (!$(parent).hasClass('hover') && parent != this.root) {
 console.log('Changing root to '+parent.id);
 this.clear(this.root);
 //if parent is not .hover, set root to parent
 this.root = parent;
 }
 //if parent has hovers (and #hover-id is not an immediate child), remove them
 else if (parent != this.tail) {
 if ($(parent).children("#hover-"+id).length === 0) {
 console.log('Rebuilding chain');
 this.clear(parent);
 }
 else {
 newChain = false;
 }
 }

 if (newChain) {
 $(post).children('.hover').remove();
 //append hover to current parent
 $(parent).append(post);
 this.tail = post;
 }

 //do inPost(#hover-id) (manage active tail)
 this.inPost(post);
 },

 inPost: function(post){
 //set active tail
 console.log('Setting active tail to '+post.id);
 this.activeTail = post;
 //[re]launch the clear timer
 clearTimeout(this._clearTimeout);
 if (post != this.tail) {
 this._clearTimeout = setTimeout(this.clear.bind(this), 1000);
 }
 $('.active').removeClass('active');
 $(post).addClass('active'); //if it's hover
 },
 out: function(){
 if (this.root) {
 this.inPost(this.root);
 }
 },
 //removes hover subchain beginning from clearRoot's child
 clear: function(clearRoot){
 clearRoot = clearRoot || this.activeTail;
 if (!clearRoot) return null;
 console.log('Clearing subtree of '+clearRoot.id);
 $(clearRoot).children('.hover').remove();
 this.tail = clearRoot;
 }
 };

 document.addEventListener('mouseover', function(event) {
 var target = event.target;
 if ($(target).is(".post > a")) {
 //parse post id
 var match = $(target).text().match(/>>(\d+)/);
 if (match) {
 var id = 'p'+match[1];
 lesenka.open(target.parentNode, id);
 }
 else {
 //bad link
 return;
 }
 }
 if ($(target).is(".hover")) {
 lesenka.inPost(target);
 }
 }, false);
 document.addEventListener('mouseout', function(event) {
 var target = event.target;
 if ($(target).is(".post.hover")) {
 lesenka.out();
 }
 else if ($(target).is('.post > a')) {
 lesenka.out();
 }
 }, false);
 */
