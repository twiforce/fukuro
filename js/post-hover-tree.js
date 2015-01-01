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
        var toFetch = {}; //{url: [post id list]}
        //var hoversBack = false;

        function Message(type, text) {
            var className;
            switch (type) {
                case 'error':
                    className = 'bg-error'; break;
                case 'warning':
                    className = 'bg-warning'; break;
                default:
                    className = 'bg-info';
            }
            return $('<p class="'+className+'">'+text+'</p>');
        }

        function PostStub(id, content) {
            var $stub =
                $('<div class="post reply row hover bg-error" id="hover_reply_' + id + '"></div>');
            if (content) {
                $stub.append(content);
            }
            return $stub;
        }

        function summonPost(link) {
            var id = $(link).text().match(/^>>(\d+)$/)[1];
            console.log('Summoning '+id+"'s clone");
            //first search for hover
            var $hover = $("#hover_reply_"+id);
            if ($hover.length !== 0) {
                console.log('Element is already hovered');
                return $hover[0];
            }
            //then search for post in document
            var $post = $('#reply_'+id);
            if ($post.length !== 0) {
                return $post.clone().addClass('hover').attr('id', 'hover_reply_'+id)[0];
            }
            //then try to retrieve it via ajax
            console.log('Post is not here. Make a placeholder until it arrives.');
            $post = PostStub(id);
            var url = $(link).attr('href').replace(/#.*$/, '');

            if ($.inArray(url, dont_fetch_again) != -1) {
                console.log('URL is already fetched. Skipping.');
                return $post.append(Message('warning', 'Пост не найден.'));
            }

            dont_fetch_again.push(url);
            //push post id to fetch list if not already there
            if (!toFetch[url]) {
                toFetch[url] = [];
            }
            if ($.inArray(id, toFetch[url]) == -1) {
                toFetch[url].push(id);
            }
            console.log('Fetching '+url+'...');
            $.ajax({
                url: url,
                context: document.body,
                success: function (data) {
                    console.log('Successfully fetched ' + url);
                    /*
                    $(data).find('div.post.reply').each(function () {
                        if ($('#' + $(this).attr('id[1]')).length == 0)
                            $('body').prepend($(this).css('display', 'none'));
                    });
                    */
                    //I AM AN ERROR: take url from XHR
                    var fetchList = toFetch[url];
                    var $thread = $(data);
                    for (var i= 0, l=fetchList.length; i<l; i++) {
                        var id = fetchList[i];
                        var $post = $thread.find('#reply_'+id);
                        var $pHolder = $('#hover_reply_' + id); //#placeholder?
                        if (!$pHolder.length) {
                            console.log('No placeholder for ' + id + '!');
                            continue;
                        }
                        if ($post.length) {
                            $('body').prepend($post.css('display', 'none'));
                            //replace placeholder with post clone
                            //I AM AN ERROR!!!
                            $pHolder.empty().append($post.clone().css('display', 'block'));
                        }
                        else {
                            //replace placeholder with an error.
                            $pHolder.empty().append(Message('warning', 'Пост не найден.'));
                        }
                    }
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    var message;
                    switch (jqXHR.status) {
                        case 404:
                            message = Message('warning', 'Тред не существует.');
                            break;
                        default:
                            message = Message('warning', 'Что-то пошло не так.');
                    }
                    //error here [url]
                    var fetchList = toFetch[url];
                    for (var i= 0, l=fetchList.length; i<l; i++) {
                        var id = fetchList[i];
                        var $pHolder = $('#hover_reply_' + id); //DRY?
                        if (!$pHolder.length) {
                            console.log('No placeholder for ' + id + '!');
                            continue;
                        }
                        $pHolder.empty().append(message);
                    }
                }
            });
            return $post.append(Message('info', 'Загрузка...'))[0];
        }

        var chainCtrl = {
            tail: null,
            activeTail: null,
            _timeout: null,

            open: function(parent, post) {
                console.log('Opening preview '+parent.id+'->'+post.id);
                var clearRoot = undefined;
                if ($(parent).is('.hover')) {
                    if ($(parent).next() != post) {
                        clearAfter = parent;
                    }
                }
                else {
                    clearAfter = null; //All previews
                }
                if (clearAfter !== undefined) {
                    this._clear(clearAfter);
                }
                if (!this.tail || this.tail == parent) {
                    $('body').append(post);
                    this.tail = post;
                }
                this.inPost(post);
            },

            inPost: function(post){
                //set active tail
                console.log('Setting active tail to '+(post?post.id:'null'));
                this.activeTail = post;
                //[re]launch the clear timer
                clearTimeout(this._timeout);
                if (post != this.tail) {
                    this._timeout = setTimeout(this._clear.bind(this), 1000);
                } else {
                    console.log('Not activating timer because post is tail');
                }
            },

            out: function() {
                this.inPost(null);
            },
            //removes hover subchain beginning from clearRoot's child
            _clear: function(clearAfter) {
                //if root is unspecified, clear from active tail
                if (clearAfter === undefined) {
                    clearAfter = this.activeTail;
                }
                if (clearAfter !== null) {
                    console.log('Removing chain after ' + clearAfter.id);
                    $(clearAfter).nextAll('.hover').remove();
                    this.tail = clearAfter;
                }
                else {
                    console.log('Clearing entire chain.');
                    $('.hover').remove();
                    this.tail = null;
                }
            }
            /*
            _clear: function(clearRoot){
                //if root is unspecified, clear from active tail
                clearRoot = clearRoot || this.activeTail;
                if (!clearRoot) return null;
                if (clearRoot == this.root) {
                    $('.hover').remove();
                }
                console.log('Clearing subtree of '+clearRoot.id);
                $(clearRoot).nextAll('.hover').remove();
                this.tail = clearRoot;
            }
            */
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
                chainCtrl.open(parent, post);
                position($(this), $(post), evnt);
            }
        };

        var hoverOver = function(evnt)
        {
            console.log('Event target: ' + event.target.tagName);
            if (!$(evnt.target).is('div.body > a, .mentioned > a')) {
                //links are handled by linkOver
                chainCtrl.inPost(this);
            }
        };

        var hoverLeave = function(evnt)
        {
            console.log('Mouse leaved hover ' + evnt.target.id);
            //mouse move to links completely processed by linkOver
            if (evnt.relatedTarget && !$(evnt.relatedTarget).is('div.body > a, .mentioned > a')) {
                console.log('!!'+evnt.relatedTarget.tagName);
                var $toPost = $(evnt.relatedTarget).closest('.hover');
                if ($toPost.length != 0) {
                    chainCtrl.inPost($toPost[0]);
                    return;
                }
            }
            //else
            chainCtrl.out();
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
