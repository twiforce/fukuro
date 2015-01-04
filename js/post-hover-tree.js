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
 * Known bugs:
 * 1) Re-fetch single thread for different posts;
 * 2) Multiple positioning calls;
 * 3) No right 'dead zone';
 * 4) Wrong positioning for fetched posts;
 *
 * ToDo: Immediate clear when clicked inside post.
 */

$(document).ready(function () {
    if (settings.postHover) {
        //Some hardcoded 'settings':
        //hovering time before opening preview (ms)
        rollOnDelay = 100;
        //timeout for closing inactive previews (ms)
        rollOverDelay = 1000;
        //minimal distance in pixels between post preview and the screen edge
        deadZone = 20;

        //end of 'settings'.

        var hovering = false;
        //var dont_fetch_again = [];
        var toFetch = {}; //{url: [post id list]}
        var rollOnTimer = null;

        function _debug(text) {
            if (window.FUKURO_DEBUG) {
                console.info(text);
            }
        }

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
            _debug('Summoning '+id+"'s clone");
            //first search for hover
            var $hover = $("#hover_reply_"+id);
            if ($hover.length !== 0) {
                return $hover[0];
            }
            //then search for post in document
            var $post = $('#reply_'+id);
            if ($post.length !== 0) {
                return $post.clone().addClass('hover').attr('id', 'hover_reply_'+id)[0];
            }
            //then try to retrieve it via ajax
            $post = PostStub(id);
            var url = $(link).attr('href').replace(/#.*$/, '');
            /*
            if ($.inArray(url, dont_fetch_again) != -1) {
                return $post.append(Message('warning', 'Пост не найден.'));
            }

            dont_fetch_again.push(url);
            */
            //push post id to fetch list if not already there
            if (!toFetch[url]) {
                toFetch[url] = [];
            }
            if ($.inArray(id, toFetch[url]) == -1) {
                toFetch[url].push(id);
            }
            _debug('Fetching '+url+'...');
            $.ajax({
                url: url,
                context: document.body,
                success: function (data) {
                    _debug('Successfully fetched ' + url);
                    /*
                    $(data).find('div.post.reply').each(function () {
                        if ($('#' + $(this).attr('id[1]')).length == 0)
                            $('body').prepend($(this).css('display', 'none'));
                    });
                    */
                    var fetchList = toFetch[url];
                    var $thread = $(data);
                    for (var i= 0, l=fetchList.length; i<l; i++) {
                        var id = fetchList[i];
                        var $post = $thread.find('#reply_'+id);
                        var $pHolder = $('#hover_reply_' + id); //#placeholder?
                        if (!$pHolder.length) {
                            console.warn('No placeholder for ' + id + '! This is a bug.');
                            continue;
                        }
                        if ($post.length) {
                            $('body').prepend($post.css('display', 'none'));
                            //replace placeholder with post clone
                            $pHolder.empty().append($post.clone().contents());
                            //ToDo: call position here.
                        }
                        else {
                            //replace placeholder with an error.
                            $pHolder.empty().append(Message('warning', 'Пост не найден.'));
                        }
                    }
                    delete toFetch[url];
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    var message;
                    switch (jqXHR.status) {
                        case 404:
                            //TODO: keep non-existent thread ids or error messages.
                            message = Message('warning', 'Тред не существует.');
                            break;
                        default:
                            message = Message('warning', 'Что-то пошло не так.');
                    }
                    var fetchList = toFetch[url];
                    for (var i= 0, l=fetchList.length; i<l; i++) {
                        var id = fetchList[i];
                        var $pHolder = $('#hover_reply_' + id); //DRY?
                        if (!$pHolder.length) {
                            console.warn('No placeholder for ' + id + '! This is a bug.');
                            continue;
                        }
                        $pHolder.empty().append(message);
                    }
                    delete toFetch[url];
                }
            });
            return $post.append(Message('info', 'Загрузка...'))[0];
        }

        var chainCtrl = {
            tail: null,
            activeTail: null,
            _timeout: null,

            open: function(parent, post) {
                //_debug('Opening preview '+parent.id+'->'+post.id);
                var clearAfter = undefined;
                if ($(parent).is('.hover')) {
                    if ($(parent).next()[0] != post) {
                        clearAfter = parent;
                    }
                }
                else {
                    if ($('.hover')[0] != post) {
                        clearAfter = null; //All previews
                    }
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
                //_debug('Setting active post to '+(post?post.id:'null'));
                this.activeTail = post;
                //[re]launch the clear timer
                clearTimeout(this._timeout);
                if (post != this.tail) {
                    this._timeout = setTimeout(this._clear.bind(this), rollOverDelay);
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
                    _debug('Removing chain after ' + clearAfter.id);
                    $(clearAfter).nextAll('.hover').remove();
                    this.tail = clearAfter;
                }
                else {
                    _debug('Clearing entire chain.');
                    $('.hover').remove();
                    this.tail = null;
                }
            }
        };

        // Backup for 'frozen' previews (which should not appear normally)
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

            $(target).delegate('div.body >a , .mentioned > a', 'mouseenter', linkEnter);
            $(target).delegate('div.body >a , .mentioned > a', 'mouseleave', hoverLeave);
            $(target).delegate('div.post.hover', 'mouseenter', hoverEnter);
            $(target).delegate('div.post.hover', 'mouseleave', hoverLeave);
        }

        var linkEnter = function(evnt)
        {
            //if (!summon(id) { //retrieve url; //summonAjax(url, id) }
            clearTimeout(rollOnTimer);
            var that = this;
            rollOnTimer = setTimeout(function() {
                var post = summonPost(that);
                if (post) {
                    var parent = $(that).closest('div.post')[0];
                    chainCtrl.open(parent, post);
                    position($(that), $(post).hide(), evnt);
                    $(post).show();
                }
            }, rollOnDelay);
        };

        var hoverEnter = function(evnt)
        {
            if (!$(evnt.target).is('div.body > a, .mentioned > a')) {
                //links are handled by linkOver
                chainCtrl.inPost(this);
            }
        };

        var hoverLeave = function(evnt)
        {
            clearTimeout(rollOnTimer);
            //mouse move to links completely processed by linkOver
            if (evnt.relatedTarget && !$(evnt.relatedTarget).is('div.body > a, .mentioned > a')) {
                var $toPost = $(evnt.relatedTarget).closest('.hover');
                if ($toPost.length != 0) {
                    chainCtrl.inPost($toPost[0]);
                    return;
                }
            }
            //else
            chainCtrl.out();
        };

        //credits for original function to GhostPerson
        var position = function(link, newPost, evnt) {

            newPost.css({
                //use jQuery .show() instead (less style-dependend)
                //'display': 'block',
                'position': 'absolute',
                //margins prevent precise positioning
                'margin-top': 0,
                'margin-left': 0
            });

            //a bit more complex positioning
            if (!position.direction)
                position.direction = 'down';
            //TODO: reset direction on preview clear?

            //  mouseEvent has .clientX and .clientY (viewport coords of cursor)
            //  Supported by "all" modern browsers (except IE<=8 but who cares)

            var viewportHigh = evnt.clientY;
            var viewportLow = window.innerHeight - viewportHigh;

            function positionUp() {
                newPost.css('top', link.offset().top - newPost.outerHeight());
            }
            function positionDown() {
                newPost.css('top', link.offset().top + link.outerHeight());
            }

            switch (position.direction) {
                case 'down':
                    if (newPost.outerHeight() + deadZone > viewportLow) {
                        position.direction = 'up';
                        positionUp();
                    }
                    else {
                        positionDown();
                    }
                    break;

                case 'up':
                    if (newPost.outerHeight() + deadZone > viewportHigh) {
                        position.direction = 'down';
                        positionDown();
                    }
                    else {
                        positionUp();
                    }
                    break;

                default:
                    console.error('now you fucked up');
            }

            //simple horizontal positioning
            function positionLeft() {
                newPost.css({
                    'left': Math.max(
                        link.offset().left + link.outerWidth() - newPost.outerWidth(),
                        deadZone),
                    'right': 'auto'
                });
            }
            function positionRight() {
                newPost.css({
                    'left': link.offset().left,
                    'right': 'auto'
                });
            }

            var viewportRight = $(window).width() - evnt.clientX;
            var viewportLeft = $(window).width() - viewportRight;

            if (viewportRight > viewportLeft) {
                positionRight();
            }
            else {
                positionLeft();
            }
        };

        init_hover_tree(document);

        // allow to work with auto-reload.js, etc.
        //no need in this now, "delegate" takes care of everything
        /*
         $(document).bind('new_post', function (e, post) {
         init_hover_tree(post);
         });
         */
    }
});
