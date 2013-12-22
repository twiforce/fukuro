Synch Imageboard Engine, based on Tinyboard
==========================================

About
------------
Tinyboard is a free light-weight, fast, highly configurable and user-friendly
imageboard software package. It is written in PHP and has few dependencies.
Synch IE is a fork with several cool features that shoud work out of the box.

Requirements
------------
1.	PHP >= 5.3
2.	MySQL server
3.	[mbstring](http://www.php.net/manual/en/mbstring.installation.php) 
4.	[PHP GD](http://www.php.net/manual/en/intro.image.php)
5.	[PHP PDO](http://www.php.net/manual/en/intro.pdo.php)

@savetheinternet and its crew are trying to make sure Tinyboard is compatible with all
major web servers and operating systems. SynchIE, just like Tinyboard, does not include an Apache
```.htaccess``` file nor does it need one.

### Recommended
1.	MySQL server >= 5.5.3
2.	ImageMagick (command-line ImageMagick or GraphicsMagick preferred).
3.	[APC (Alternative PHP Cache)](http://php.net/manual/en/book.apc.php), [XCache](http://xcache.lighttpd.net/) or [Memcached](http://www.php.net/manual/en/intro.memcached.php)

Contributing
------------
You can contribute to Tinyboard by:
*	Developing patches/improvements/translations and using GitHub to submit pull requests
*	Providing feedback and suggestions
*	Writing/editing documentation

If you need help developing a patch, please join our IRC channel.

Installation
-------------
0.  Make sure that you really know what are you doind. I've never tried
    to install this anywhere and you're aware of this. Tinyboard is great
    but SynchIE has some critical vulnerabilities.
1.	Download and extract Tinyboard to your web directory or get the latest
	development version with:

        git clone git://github.com/twiforce/synch-dev.git
	
2.	Navigate to ```install.php``` in your web browser and follow the
	prompts.
3.	SynchIE should now be installed. Log in to ```mod.php``` with the
	default username and password combination: **admin / password**.

Please remember to change the administrator account password.

See also: [Configuration Basics](http://tinyboard.org/docs/?p=Config).

Support
--------
Tinyboard is still beta software -- there are bound to be bugs. If you find a
bug, please report it.

SynchIE is even more beta software, but at some time it'll be pretty useable.

If you need assistance with installing, configuring, or using Tinyboard, you may
find support from a variety of sources:

*	If you're unsure about how to enable or configure certain features, make
	sure you have read the comments in ```inc/config.php```.
*	Documentation can be found [here](http://tinyboard.org/docs/).
*	You can join Tinyboard's IRC channel for support and general queries: 
	[irc.datnode.net #tinyboard](irc://irc.datnode.net/tinyboard).
*	You may find help at [tinyboard.org](http://tinyboard.org/#help).

License
--------
See original [LICENSE.md](http://github.com/savetheinternet/Tinyboard/blob/master/LICENSE.md).

