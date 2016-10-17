/**
 * Tabify
 */
;
(function ($) {

	'use strict';

	$.fn.tabify = function () {
		return this.each(function () {
			var tabs = $(this);
			if (!tabs.data('tabify')) {
				tabs.data('tabify', true);
				$('ul.tab-nav:first li:first', tabs).addClass('current');
				$('div:first', tabs).show();
				var tabLinks = $('ul.tab-nav:first li', tabs);
				$(tabLinks).click(function () {
					$(this).addClass('current').attr('aria-expanded', 'true').siblings().removeClass('current').attr('aria-expanded', 'false');
					$('ul.tab-nav:first', tabs).siblings('.tab-content').hide().attr('aria-hidden', 'true');
					var activeTab = $(this).find('a').attr('href');
					$(activeTab).show().attr('aria-hidden', 'false').trigger('resize');
					$('body').trigger('tf_tabs_switch', [activeTab, tabs]);
					Themify.triggerEvent(window, 'resize');
					return false;
				});
				$('ul.tab-nav:first', tabs).siblings('.tab-content').find('a[href^="#tab-"]').on('click', function (event) {
					event.preventDefault();
					var dest = $(this).prop('hash').replace('#tab-', ''),
							contentID = $('ul.tab-nav:first', tabs).siblings('.tab-content').eq(dest - 1).prop('id');
					if ($('a[href^="#' + contentID + '"]').length > 0) {
						$('a[href^="#' + contentID + '"]').trigger('click');
					}
				});
			}
		});
	};

	// $('img.photo',this).themifyBuilderImagesLoaded(myFunction)
	// execute a callback when all images have loaded.
	// needed because .load() doesn't work on cached images
	$.fn.themifyBuilderImagesLoaded = function (callback) {
		var elems = this.filter('img'),
				len = elems.length,
				blank = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";

		elems.bind('load.imgloaded', function () {
			if (--len <= 0 && this.src !== blank) {
				elems.unbind('load.imgloaded');
				callback.call(elems, this);
			}
		}).each(function () {
			// cached images don't fire load sometimes, so we reset src.
			if (this.complete || this.complete === undefined) {
				var src = this.src;
				// webkit hack from http://groups.google.com/group/jquery-dev/browse_thread/thread/eee6ab7b2da50e1f
				// data uri bypasses webkit log warning (thx doug jones)
				this.src = blank;
				this.src = src;
			}
		});

		return this;
	};
})(jQuery);

/*
 * Parallax Scrolling Builder
 */
(function ($) {

	'use strict';

	var $window = $(window);
	var windowHeight = $window.height();

	$window.resize(function () {
		windowHeight = $window.height();
	});

	$.fn.builderParallax = function (xpos, speedFactor, outerHeight) {
		var $this = $(this);
		var getHeight;
		var firstTop;
		var resizeId;

		//get the starting position of each element to have parallax applied to it
		$this.each(function () {
			firstTop = $this.offset().top;
		});
		$window.resize(function () {
			clearTimeout(resizeId);
			resizeId = setTimeout(function () {
				$this.each(function () {
					firstTop = $this.offset().top;
				});
			}, 500);
		});

		if (outerHeight) {
			getHeight = function (jqo) {
				return jqo.outerHeight(true);
			};
		} else {
			getHeight = function (jqo) {
				return jqo.height();
			};
		}

		// setup defaults if arguments aren't specified
		if (arguments.length < 1 || xpos === null)
			xpos = "50%";
		if (arguments.length < 2 || speedFactor === null)
			speedFactor = 0.1;
		if (arguments.length < 3 || outerHeight === null)
			outerHeight = true;

		// function to be called whenever the window is scrolled or resized
		function update() {
			var pos = $window.scrollTop();

			$this.each(function () {
				var $element = $(this);
				var top = $element.offset().top;
				var height = getHeight($element);

				// Check if totally above or totally below viewport
				if (top + height < pos || top > pos + windowHeight) {
					return;
				}

				if (isMobile()) {
					/* #3699 = for mobile devices increase background-size-y in 30% (minimum 400px) and decrease background-position-y in 15% (minimum 200px) */
					var outerHeight = $element.outerHeight(true);
					var outerWidth = $element.outerWidth(true);
					var dynamicDifference = outerHeight > outerWidth ? outerHeight : outerWidth;
					dynamicDifference = Math.round(dynamicDifference * 0.15);
					if (dynamicDifference < 200)
						dynamicDifference = 200;
					$this.css('backgroundSize', "auto " + Math.round(outerHeight + (dynamicDifference * 2)) + "px");
					$this.css('backgroundPosition', xpos + " " + Math.round(((firstTop - pos) * speedFactor) - dynamicDifference) + "px");
				}
				else {
					$this.css('backgroundPosition', xpos + " " + Math.round((firstTop - pos) * speedFactor) + "px");
				}
			});
		}

		function isMobile() {
			var isTouchDevice = navigator.userAgent.match(/(iPhone|iPod|iPad|Android|playbook|silk|BlackBerry|BB10|Windows Phone|Tizen|Bada|webOS|IEMobile|Opera Mini)/);
			return isTouchDevice;
		}

		$window.bind('scroll', update).resize(update);
		update();
	};
})(jQuery);

// the semi-colon before function invocation is a safety net against concatenated
// scripts and/or other plugins which may not be closed properly.
;(function ( $, window, document, undefined ) {

	"use strict";

		// undefined is used here as the undefined global variable in ECMAScript 3 is
		// mutable (ie. it can be changed by someone else). undefined isn't really being
		// passed in so we can ensure the value of it is truly undefined. In ES5, undefined
		// can no longer be modified.

		// window and document are passed through as local variable rather than global
		// as this (slightly) quickens the resolution process and can be more efficiently
		// minified (especially when both are regularly referenced in your plugin).

		// Create the defaults once
		var pluginName = 'themifyParallaxit',
				defaults = {
				selectors: 'div',
				duration: '0.2'
		};

		// The actual plugin constructor
		function Plugin ( element, options ) {
				this.element = element;
				// jQuery has an extend method which merges the contents of two or
				// more objects, storing the result in the first object. The first object
				// is generally empty as we don't want to alter the default options for
				// future instances of the plugin
				this.settings = $.extend( {}, defaults, options );
				this._defaults = defaults;
				this._name = pluginName;

				this.fps = 60;
				this.now = 0;
				this.then = Date.now();
				this.interval = 1000/this.fps;
				this.delta = 0;
				this.requestId = undefined;
				this.parallaxElemns = [];
				this.init();
		}

		// Avoid Plugin.prototype conflicts
		$.extend(Plugin.prototype, {

				lastScrollTop: 0,

				init: function () {
					
					this.parallaxElemns = Array.prototype.slice.call(document.querySelectorAll(this.settings.selectors));//convert to array to add/remove an element;
					for (var i = 0; i < this.parallaxElemns.length; i++) {
						this.reset(i);
					}
					this.start();					
				},
				scrollHandler: function(){
					this.requestId = requestAnimationFrame(this.scrollHandler.bind(this));
	 
					this.now = Date.now();
					this.delta = this.now - this.then;
					 
					if (this.delta > this.interval) {
						// update time stuffs
						 
						// Just `then = now` is not enough.
						// Lets say we set fps at 10 which means
						// each frame must take 100ms
						// Now frame executes in 16ms (60fps) so
						// the loop iterates 7 times (16*7 = 112ms) until
						// delta > interval === true
						// Eventually this lowers down the FPS as
						// 112*10 = 1120ms (NOT 1000ms).
						// So we have to get rid of that extra 12ms
						// by subtracting delta (112) % interval (100).
						// Hope that makes sense.
						 
						this.then = this.now - (this.delta % this.interval);
						 
						this.parallaxit();
					}
				},
				add:function(el){
					if(!el.data('current-delta')){
						this.parallaxElemns.push(el[0]);
						var i = this.parallaxElemns.length-1;
						this.reset(i);
					}
				},
				reset:function(i){
					this.parallaxElemns[i].settings = Object.create(null);
					this.parallaxElemns[i].settings.speed = this.parallaxElemns[i].getAttribute('data-parallax-element-speed') ? ( this.parallaxElemns[i].getAttribute('data-parallax-element-speed') / 10 ) : this.settings.duration;
					this.parallaxElemns[i].settings.reverse = this.parallaxElemns[i].getAttribute('data-parallax-element-reverse') ? this.parallaxElemns[i].getAttribute('data-parallax-element-reverse') : false;
					this.parallaxElemns[i].settings.firstTop = $(this.parallaxElemns[i]).offset().top;
					this.parallaxElemns[i].setAttribute('data-current-delta', 0);
				},
				stop: function() {
					if (this.requestId) {
						window.cancelAnimationFrame(this.requestId);
						this.requestId = undefined;
					}
				},
				start: function() {
					if (!this.requestId) {
						this.requestId = requestAnimationFrame(this.scrollHandler.bind(this));
					}
				},
				parallaxit: function() {
					var scrollTop = window.pageYOffset,
						$window = $(window);

					for (var i = 0; i < this.parallaxElemns.length; i++) {

						if ( this.parallaxElemns[i].settings.reverse ) {
							var pos = ( ( this.parallaxElemns[i].settings.firstTop + $(this.parallaxElemns[i]).outerHeight() ) - scrollTop ) - $window.height();
						} else {
							var pos = ( scrollTop + $window.height() ) - ( this.parallaxElemns[i].settings.firstTop + $(this.parallaxElemns[i]).outerHeight() );
						}

						var currentDelta = this.parallaxElemns[i].getAttribute('data-current-delta'),
							newDelta = (0 - (pos * this.parallaxElemns[i].settings.speed)),
							tweenDelta = (currentDelta - ((currentDelta - newDelta) * 0.08));

						if ( this.parallaxElemns[i].settings.reverse ) {
							tweenDelta = Math.max( tweenDelta, -( $window.height() - $(this.parallaxElemns[i]).outerHeight() ) );
							tweenDelta = Math.min( tweenDelta, ( $window.height() / 4 ) );
						}

						this.parallaxElemns[i].style.top = tweenDelta + 'px'; // use "top" property to prevent conflict with wow js
						//this.parallaxElemns[i].style.transform = "translateY(" + tweenDelta + "px) translateZ(0)";
						//this.parallaxElemns[i].style.webkitTransform = "translateY(" + tweenDelta + "px) translateZ(0)";
						this.parallaxElemns[i].setAttribute('data-current-delta', tweenDelta);
					}
				},
				isElementInViewport:function (el) {

					var rect = el.getBoundingClientRect();

					return (
						rect.top >= 0 &&
						rect.left >= 0 &&
						rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && /*or $(window).height() */
						rect.right <= (window.innerWidth || document.documentElement.clientWidth) /*or $(window).width() */
					);
				}
		});

		// A really lightweight plugin wrapper around the constructor,
		// preventing against multiple instantiations
		$.fn[ pluginName ] = function ( options ) {
				return this.each(function() {
						if ( !$.data( this, "plugin_" + pluginName ) ) {
								$.data( this, "plugin_" + pluginName, new Plugin( this, options ) );
						}
				});
		};

})( jQuery, window, document );

var ThemifyBuilderModuleJs;
(function ($, window, document, undefined) {

	'use strict';

	ThemifyBuilderModuleJs = {
		fwvideos: [], // make it accessible to public
		init: function () {
			this.setupBodyClasses();
			this.bindEvents();
		},
		bindEvents: function () {
			if ('complete' !== document.readyState) {
				$(document).ready(this.document_ready);
			} else {
				this.document_ready();
			}
			if (window.loaded) {
				this.window_load();
			} else {
				$(window).load(this.window_load);
			}
			$(window).bind('hashchange', this.tabsDeepLink);
		},
		/**
		 * Executed on jQuery's document.ready() event.
		 */
		document_ready: function () {
			$.event.trigger("themify_builder_loaded");
			var self = ThemifyBuilderModuleJs;
			if (tbLocalScript.fullwidth_support == '') {
				self.setupFullwidthRows();
				$(window).resize(function (e) {
					if (e.target === window) {
						self.setupFullwidthRows()
					}
				});
			}

			self.InitCSS();
			Themify.bindEvents();
			self.touchdropdown();
			self.accordion();
			self.tabs();
			self.rowCover();
			self.fallbackRowId();
			self.onInfScr();
			self.InitScrollHighlight();
			self.galleryPagination();
			self.showcaseGallery();
			self.InitVideoDimension();
			self.carousel();
		},
		/**
		 * Executed on JavaScript 'load' window event.
		 */
		window_load: function () {
			var self = ThemifyBuilderModuleJs;
			window.loaded = true;
			self.tabsDeepLink();
			self.charts();
			self.backgroundSlider();
			ThemifyBuilderModuleJs.parallaxScrollingInit();
			if (tbLocalScript.isParallaxActive)
				self.backgroundScrolling();
			if (self._isTouch()) {
				self.fullheight();
				return;
			}
			self.fullwidthVideo();
		},
		setupFullwidthRows: function () {
			var container = $(tbLocalScript.fullwidth_container);
			$('div.themify_builder_row.fullwidth').each(function () {
				var $this = $( this ),
					row = $this.closest('.themify_builder_content'),
					padding = $this.data( 'original-padding' );
				if( padding == undefined ) {
					padding = [ parseInt( $this.css( 'paddingLeft' ) ), parseInt( $this.css( 'paddingRight' ) ) ];
					$this.data( 'original-padding', padding );
				}

				var left = row.offset().left - container.offset().left;
				var right = container.outerWidth() - left - row.outerWidth();
				$this.css({
					'margin-left': -left,
					'margin-right': -right,
					'padding-left': left + padding[0],
					'padding-right': right + padding[1],
					'width': container.outerWidth() + 'px'
				});
			});
		},
		fallbackRowId: function () {
			$('.themify_builder_content').each(function () {
				var index = 0;
				$(this).find('.themify_builder_row').each(function () {
					if (!$(this).attr('class').match(/module_row_\d+/)) {
						$(this).addClass('module_row_' + index);
					}
					index++;
				});
			});
		},
		addQueryArg: function (e, n, l) {
			l = l || window.location.href;
			var r, f = new RegExp("([?&])" + e + "=.*?(&|#|$)(.*)", "gi");
			if (f.test(l))
				return"undefined" != typeof n && null !== n ? l.replace(f, "$1" + e + "=" + n + "$2$3") : (r = l.split("#"), l = r[0].replace(f, "$1$3").replace(/(&|\?)$/, ""), "undefined" != typeof r[1] && null !== r[1] && (l += "#" + r[1]), l);
			if ("undefined" != typeof n && null !== n) {
				var i = -1 !== l.indexOf("?") ? "&" : "?";
				return r = l.split("#"), l = r[0] + i + e + "=" + n, "undefined" != typeof r[1] && null !== r[1] && (l += "#" + r[1]), l
			}
			return l
		},
		onInfScr: function () {
			var self = ThemifyBuilderModuleJs;
			$(document).ajaxSend(function (e, request, settings) {
				var page = settings.url.replace(/^(.*?)(\/page\/\d+\/)/i, '$2'),
						regex = /^\/page\/\d+\//i,
						match;

				if ((match = regex.exec(page)) !== null) {
					if (match.index === regex.lastIndex) {
						regex.lastIndex++;
					}
				}

				if (null !== match) {
					settings.url = self.addQueryArg('themify_builder_infinite_scroll', 'yes', settings.url);
				}
			});
		},
		InitCSS: function () {
			// Enqueue builder style and assets before theme style.css
			var refs = (window.document.getElementsByTagName("head")[ 0 ]).childNodes,
					ref = refs[ refs.length - 1];

			for (var i = 0; i < refs.length; i++) {
				if ('LINK' == refs[i].nodeName && 'stylesheet' == refs[i].rel && refs[i].href.indexOf('style.css') > -1) {
					ref = refs[i];
					break;
				}
			}
			Themify.LoadCss(tbLocalScript.builder_url + '/css/animate.min.css', null, ref);
			if ($('.module-image').length > 0 || $('.module-slider').length > 0 || $('.module-feature .module-feature-chart-html5').length > 0 || $('.module .fa').length > 0) {
				Themify.LoadCss(themify_vars.url + '/fontawesome/css/font-awesome.min.css', tbLocalScript.version);
			}

		},
		InitScrollHighlight: function () {
			if (tbLocalScript.loadScrollHighlight == true && $('div[class*=tb_section-]').length > 0) {
				Themify.LoadAsync(tbLocalScript.builder_url + '/js/themify.scroll-highlight.js', this.ScrollHighlightCallBack, null, null, function () {
					return('undefined' !== typeof $.fn.themifyScrollHighlight);
				});
			}
		},
		ScrollHighlightCallBack: function () {
			$('body').themifyScrollHighlight(themifyScript.scrollHighlight ? themifyScript.scrollHighlight : {});
		},
		// Row, col, sub-col: Background Slider
		backgroundSlider: function ($bgSlider) {
			$bgSlider = $bgSlider || $('.row-slider, .col-slider, .sub-col-slider');

			if ($bgSlider.length) {
				Themify.LoadAsync(
					themify_vars.url + '/js/backstretch.themify-version.js',
					function () {
						this.backgroundSliderCallBack($bgSlider);
					}.bind(this),
					null,
					null,
					function () {
						return ('undefined' !== typeof $.fn.backstretch);
					}
				);
			}
		},
		// Row, col, sub-col: Background Slider
		backgroundSliderCallBack: function ($bgSlider) {
					
			if ($bgSlider.length > 0) {
							
								var themifySectionVars = {
										autoplay: tbLocalScript.backgroundSlider.autoplay,
										speed: tbLocalScript.backgroundSlider.speed
								};

								// Parse injected vars
								themifySectionVars.autoplay = parseInt(themifySectionVars.autoplay, 10);
								if (themifySectionVars.autoplay <= 10) {
										themifySectionVars.autoplay *= 1000;
								}
								themifySectionVars.speed = parseInt(themifySectionVars.speed, 10);
								var $is_builder_active = ThemifyBuilderModuleJs.isBuilderActive();
				// Initialize slider
				$bgSlider.each(function () {
					var $thisRowSlider = $(this),
							$backel = $thisRowSlider.parent(),
							rsImages = [],
							bgMode = $thisRowSlider.data('bgmode');

					// Initialize images array with URLs
					$thisRowSlider.find('li').each(function () {
						rsImages.push($(this).attr('data-bg'));
					});
										
					// Call backstretch for the first time
					$backel.backstretch(rsImages, {
						speed: 2000,
						duration: 5000,
						mode: bgMode
					});
										
					// Needed for col styling icon and row grid menu to be above row and sub-row top bars.
					if ($is_builder_active) {
											$backel.css('z-index', 'auto');
					}

					// Fix for navigation dots.
					if ($backel.hasClass('module_column')) {
						var $closestRowSliderNavigation = $backel.closest('.themify_builder_row').find('.row-slider .row-slider-slides');
						$backel.on('mouseover mouseout', function (e) {
													$closestRowSliderNavigation.css('z-index', e.type==='mouseout'?1:0);
												});
					}
					// Cache Backstretch object
										var thisBGS = $backel.data('backstretch');
										
					// Previous and Next arrows
					$thisRowSlider.find('.row-slider-prev,.row-slider-next').on('click', function (e) {
						e.preventDefault();
												if($(this).hasClass('row-slider-prev')){
													thisBGS.prev();
												}
												else{
													thisBGS.next();
												}
					});

					// Dots
					$thisRowSlider.find('.row-slider-dot').each(function () {
						var $dot = $(this);
						$dot.on('click', function () {
							thisBGS.show($dot.data('index'));
						});
					});
				});
			}
		},
		// Row: Fullwidth video background
		fullwidthVideo: function ($videoElmt) {
			$videoElmt = $videoElmt || $('.themify_builder_row[data-fullwidthvideo], .module_column[data-fullwidthvideo], .sub_column[data-fullwidthvideo]');

			if ($videoElmt.length > 0) {
				var self = this,
						$is_youtube = [],
						$is_vimeo = [],
						$is_local = [];

				$.each($videoElmt, function (i, elm) {
					var $video = $(elm);
					if ($video.find('.big-video-wrap').length > 0) {
						$video.find('.big-video-wrap:first-child').remove();
					}
					var provider = self.parseVideo($video.data('fullwidthvideo'));
					if (provider.type === 'youtube') {
						if (provider.id) {
							$is_youtube.push({'el': $video, 'id': provider.id});
						}
					}
					else if (provider.type === 'vimeo') {
						if (provider.id) {
							$is_vimeo.push({'el': $video, 'id': provider.id});
						}
					}
					else {
						$is_local.push($(elm));
					}
				});

				if ($is_local.length > 0 && !this._checkBrowser('opera')) {
					Themify.LoadAsync(themify_vars.url + '/js/video.js', function () {
						Themify.LoadAsync(
							themify_vars.url + '/js/bigvideo.js',
							function () {
								self.fullwidthVideoCallBack($is_local);
							},
							null,
							null,
							function () {
								return ('undefined' !== typeof $.BigVideo);
							}
						);
					});
				}

				if ($is_vimeo.length > 0) {
					Themify.LoadAsync(
						tbLocalScript.builder_url + '/js/froogaloop.min.js',
						function () {
							self.fullwidthVimeoCallBack($is_vimeo);
						}
					);
				}
				if ($is_youtube.length > 0) {
					Themify.LoadAsync(
						tbLocalScript.builder_url + '/js/themify-youtube-bg.js',
						function () {
							self.fullwidthYoutobeCallBack($is_youtube);
						}
					);
				}
			}

		},
		parseVideo: function (url) {
			url.match(/(http:|https:|)\/\/(player.|www.)?(vimeo\.com|youtu(be\.com|\.be|be\.googleapis\.com))\/(video\/|embed\/|watch\?v=|v\/)?([A-Za-z0-9._%-]*)(\&\S+)?/);

			if (RegExp.$3.indexOf('youtu') > -1) {
				var type = 'youtube';
			} else if (RegExp.$3.indexOf('vimeo') > -1) {
				var type = 'vimeo';
			}

			return {
				type: type,
				id: RegExp.$6
			};
		},
		videoParams: function ($el) {
			var loop = true, mute = false;
			// If data-unloopvideo or unmutevideo exist is because they have a certain value.
			if ('undefined' !== typeof $el.data('unloopvideo')) {
				loop = 'loop' === $el.data('unloopvideo');
			} else {
				// Backwards compatibility
				loop = 'yes' === tbLocalScript.backgroundVideoLoop;
			}
			if ('undefined' !== typeof $el.data('mutevideo')) {
				mute = 'mute' === $el.data('mutevideo');
			}

			return {'mute': mute, 'loop': loop};
		},
		// Row: Fullwidth video background
		fullwidthVideoCallBack: function ($videos) {
			var self = ThemifyBuilderModuleJs;
			$.each($videos, function (i, elm) {
				var $video = $(elm);

				var videoURL = $video.data('fullwidthvideo');
				// Video was removed.
				if (!videoURL.length && typeof self.fwvideos[i] !== 'undefined') {
					self.fwvideos[i].dispose();
					return;
				}
				var params = self.videoParams($video),
						mute = params.mute,
						loop = params.loop;

				var BV = new $.BigVideo({
					doLoop: loop,
					ambient: mute,
					container: $video,
					id: i,
					poster: tbLocalScript.videoPoster
				});
				BV.init();
				BV.show(videoURL);
				BV.getPlayer().on('loadeddata', function () {
					if ($video.children('.big-video-wrap').length > 1) {
						$video.children('.big-video-wrap').slice(1).remove();
					}
				});
				self.fwvideos[i] = BV;
			});

		},
		fullwidthYoutobeCallBack: function ($videos) {
			var self = this;
			$.each($videos, function (i, elm) {
				var $video = elm.el;
				var params = self.videoParams($video),
						mute = params.mute,
						loop = params.loop;
				$video.YTPlayer({videoId: elm.id,
					mute: mute,
					loop: loop,
					width: $video.width(),
					realfullscreen: true,
					showYTLogo: false,
					showControls: false,
					gaTrack: false
				});
			});

		},
		fullwidthVimeoCallBack: function ($videos) {
			var self = this;
			if (typeof self.fullwidthVimeoCallBack.counter === 'undefined') {
				self.fullwidthVimeoCallBack.counter = 1;
				$(window).resize(function (e) {
					if (!e.isTrigger) {
						$.each($videos, function (i, elm) {
							VimeoVideo(elm.el.children('.themify-video-vmieo'));
						});
					}
				});

			}
			function VimeoVideo($video) {
				var width = $video.outerWidth(true),
						height = $video.outerHeight(true),
						pHeight = Math.ceil(width / 1.7), //1.7 ~ 16/9 aspectratio
						iframe = $video.children('iframe');
				iframe.width(width).height(pHeight).css({
					left: 0,
					top: (height - pHeight) / 2
				});
			}
			$.each($videos, function (i, elm) {
				var $video = elm.el;
				var params = self.videoParams($video),
						mute = params.mute,
						loop = params.loop;
				var $iframe = $('<div class="big-video-wrap themify-video-vmieo"><iframe id="themify-vimeo-' + i + '" src="//player.vimeo.com/video/' + elm.id + '?api=1&portrait=0&title=0&title=0&badge=0&player_id=themify-vimeo-' + i + '" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe></div>');
				$video.prepend($iframe);
				var player = $f($('#themify-vimeo-' + i)[0]);
				player.addEvent('ready', function () {
					player.api('setLoop', loop);
					player.api('setVolume', mute);
					player.api('fullscreen', 0);
					if ($video.children('.big-video-wrap').length > 1) {
						$video.children('.big-video-wrap').slice(1).remove();
					}
					VimeoVideo($iframe);
					player.api('play');
				});
			});
		},
		charts: function () {
			if ($('.module-feature .module-feature-chart-html5').length > 0) {
				var $self = this;
				Themify.LoadAsync(themify_vars.url + '/js/waypoints.min.js', $self.chartsCallBack, null, null, function () {
					return ('undefined' !== typeof $.fn.waypoint);
				});
			}
		},
		chartsCallBack: function () {
			var $self = ThemifyBuilderModuleJs;
			$self.chartsCSS();

			$('.module-feature .module-feature-chart-html5').each(function () {
				var $this = $(this);

				// this mess adjusts the size of the chart, to make it responsive
				var setChartSize = function(){
					var width = Math.min( $this.data( 'size' ), $this.closest( '.module-feature' ).width() );
					$this.css( { width: width, height: width } );
					$this.find( '.chart-html5-circle' ).empty().append( [
						'<div class="chart-html5-mask chart-html5-full" style="width: {width}px; height: {width}px; clip: rect(0px, {width}px, {width}px, {halfwidth}px);">',
							'<div class="chart-html5-fill" style="width: {width}px; height: {width}px; clip: rect(0px, {halfwidth}px, {width}px, 0px);"></div>',
						'</div>',
						'<div class="chart-html5-mask chart-html5-half" style="width: {width}px; height: {width}px; clip: rect(0px, {width}px, {width}px, {halfwidth}px);">',
							'<div class="chart-html5-fill" style="width: {width}px; height: {width}px; clip: rect(0px, {halfwidth}px, {width}px, 0px);"></div>',
						'</div>'
						].join( '' ).replace( /{width}/g, width ).replace( /{halfwidth}/g, Math.ceil( width / 2 ) )
					);
				};
				setChartSize();
				$( window ).tfsmartresize(setChartSize);

				$this.waypoint(function () {
					$this.attr('data-progress', $this.attr('data-progress-end'));
				},
				{
					offset: '100%',
					triggerOnce: true
				});
			});
		},
		chartsCSS: function () {
			var ang = 180,
				percent = 100,
				deg = parseFloat(ang / percent).toFixed(2),
				degInc,
				i = 0,
				styleId = 'chart-html5-styles',
				styleHTML = '<style id="' + styleId + '">';

			while (i <= percent) {
				degInc = parseFloat(deg * i).toFixed(2);
				degInc = degInc - 0.1;
				styleHTML += '.module-feature-chart-html5[data-progress="' + i + '"] .chart-html5-circle .chart-html5-mask.chart-html5-full,' +
						'.module-feature-chart-html5[data-progress="' + i + '"] .chart-html5-circle .chart-html5-fill {' +
						'-webkit-transform: rotate(' + degInc + 'deg);' +
						'-moz-transform: rotate(' + degInc + 'deg);' +
						'-ms-transform: rotate(' + degInc + 'deg);' +
						'-o-transform: rotate(' + degInc + 'deg);' +
						'transform: rotate(' + degInc + 'deg);' +
						'}';
				i++;
			}

			styleHTML += '</style>';

			if ($('#' + styleId).length == 1) {
				$('#' + styleId).replaceWith(styleHTML);
			}
			else {
				$('head').append(styleHTML);
			}
		},
		carousel: function () {
			if ($('.themify_builder_slider').length > 0) {
			
				var $self = this;
				if(typeof $.fn.carouFredSel==='undefined'){
					Themify.LoadAsync(themify_vars.url + '/js/carousel.js', function () {
						$self.carouselCalback();
					}, null, null, function () {
						return ('undefined' !== typeof $.fn.carouFredSel);
					});
				}
				else{
					$self.carouselCalback();
				}
			}

		},
		videoSliderAutoHeight: function ($this) {
			// Get all the possible height values from the slides
			var heights = $this.children().map(function () {
				return $(this).height();
			});
			// Find the max height and set it
			$this.parent().height(Math.max.apply(null, heights));
		},
		carouselCalback: function () {
			var self = this;
			$('.themify_builder_slider').each(function () {
				if ($(this).data('themify_slider_ready') || $(this).closest('.caroufredsel_wrapper').length > 0) {
					return;
				}
				$(this).data('themify_slider_ready',1);
				var $this = $(this),
					img_length = $this.find('img').length,
					$height = (typeof $this.data('height') === 'undefined') ? 'variable' : $this.data('height'),
					$args = {
						responsive: true,
						circular: true,
						infinite: true,
						height: $height,
						items: {
							visible: {min: 1, max: $this.data('visible')},
							width: 150,
							height: 'variable'
						},
						onCreate: function (items) {
							$('.themify_builder_slider_wrap').css({'visibility': 'visible', 'height': 'auto'});
							$this.trigger('updateSizes');
							$('.themify_builder_slider_loader').remove();

							// Fix bug video height with auto height settings.
							if ('auto' == $height && 'video' == $this.data('type')) {
								ThemifyBuilderModuleJs.videoSliderAutoHeight($this);
							}
						}
					};

				// fix the one slide problem
				if ($this.children().length < 2) {
					$('.themify_builder_slider_wrap').css({'visibility': 'visible', 'height': 'auto'});
					$('.themify_builder_slider_loader').remove();
					$(window).resize();
					return;
				}

				// Auto
				if (parseInt($this.data('auto-scroll')) > 0) {
					$args.auto = {
						play: true,
						timeoutDuration: parseInt($this.data('auto-scroll') * 1000)
					};
				}
				else if ($this.data('effect') !== 'continuously' && (typeof $this.data('auto-scroll') !== 'undefined' || parseInt($this.data('auto-scroll')) == 0)) {
					$args.auto = false;
				}

				// Scroll
				if ($this.data('effect') == 'continuously') {
					var speed = $this.data('speed'), duration;
					if (speed == .5) {
						duration = 0.10;
					} else if (speed == 4) {
						duration = 0.04;
					} else {
						duration = 0.07;
					}
					$args.auto = {timeoutDuration: 0};
					$args.align = false;
					$args.scroll = {
						delay: 1000,
						easing: 'linear',
						items: $this.data('scroll'),
						duration: duration,
						pauseOnHover: $this.data('pause-on-hover')
					};
				} else {
					$args.scroll = {
						items: $this.data('scroll'),
						pauseOnHover: $this.data('pause-on-hover'),
						duration: parseInt($this.data('speed') * 1000),
						fx: $this.data('effect')
					}
				}

				if ($this.data('arrow') == 'yes') {
					$args.prev = '#' + $this.data('id') + ' .carousel-prev';
					$args.next = '#' + $this.data('id') + ' .carousel-next';
				}

				if ($this.data('pagination') == 'yes') {
					$args.pagination = {
						container: '#' + $this.data('id') + ' .carousel-pager',
						items: $this.data('visible')
					};
				}

				if ($this.data('wrap') == 'no') {
					$args.circular = false;
					$args.infinite = false;
				}


				if (img_length > 0) {
					$(this).find('img').themifyBuilderImagesLoaded(function () {
						self.carouselInitSwipe($this, $args);
					});
				} else {
					self.carouselInitSwipe($this, $args);
				}

				$('.mejs-video').on('resize', function (e) {
					e.stopPropagation();
				});

				var didResize = false, afterResize;
				$(window).resize(function () {
					didResize = true;
				});
				setInterval(function () {
					if (didResize) {
						didResize = false;
						clearTimeout(afterResize);
						afterResize = setTimeout(function () {
							$('.mejs-video').resize();
							$this.trigger('updateSizes');

							// Fix bug video height with auto height settings.
							if ('auto' == $height && 'video' == $this.data('type')) {
								ThemifyBuilderModuleJs.videoSliderAutoHeight($this);
							}
						}, 100);
					}
				}, 250);

			});
		},
		carouselInitSwipe: function ($this, $args) {
			$this.carouFredSel($args);
			$this.swipe({
				excludedElements: 'label, button, input, select, textarea, .noSwipe',
				swipeLeft: function () {
					$this.trigger('next', true);
				},
				swipeRight: function () {
					$this.trigger('prev', true);
				},
				tap: function (event, target) {
					// in case of an image wrapped by a link click on image will fire parent link
					$(target).parent().trigger('click');
				}
			});
		},
		loadOnAjax: function () {
			var $self = ThemifyBuilderModuleJs;
			if (tbLocalScript.fullwidth_support == '') {
				$self.setupFullwidthRows();
			}
			$self.touchdropdown();
			$self.tabs();
			$self.carousel();
			$self.charts();
			$self.fullwidthVideo();
			$self.backgroundSlider();
		},
		rowCover: function () {
			$('body').on('mouseenter mouseleave', '.themify_builder_row, .module_column, .sub_column', function (e) {
				var cover = $(this).children('.builder_row_cover');
				if (cover.length === 0) {
					// for split theme
					cover = $(this).children('.tb-column-inner, .ms-tableCell').first().children('.builder_row_cover');
					if (cover.length === 0) {
										   
						return;
					}
								   
				}
				if(cover.data('hover-type')==='gradient' || cover.data('type')==='gradient' || cover.data('updated')){
					return;
				}
				//backward for old data
				var new_color = e.type === 'mouseenter' ? cover.data('hover-color') : cover.data('color');
				if (new_color !== undefined) {
									cover.css({
											background:new_color,
											opacity:1
									});
				}
				else if (e.type === 'mouseleave') {
									cover.css('opacity',0);
				}
			});
		},
		fullheight: function () {
			// Set full-height rows to viewport height
			if (navigator.userAgent.match(/(iPad)/g)) {
				var didResize = false,
						selector = '.themify_builder_row.fullheight';
				$(window).resize(function () {
					didResize = true;
				});
				setInterval(function () {
					if (didResize) {
						didResize = false;
						$(selector).each(function () {
							$(this).css({
								'height': $(window).height()
							});
						});
					}
				}, 250);
			}
		},
		touchdropdown: function () {
			if (tbLocalScript.isTouch && typeof jQuery.fn.themifyDropdown != 'function') {
				Themify.LoadAsync(themify_vars.url + '/js/themify.dropdown.js', function () {
					$('.module-menu .nav').themifyDropdown();
				});
			}
		},
		accordion: function () {
			$('body').off('click.themify', '.accordion-title').on('click.themify', '.accordion-title', function (e) {
				var $this = $(this),
						$panel = $this.next(),
						$item = $this.closest('li'),
						type = $this.closest('.module.module-accordion').data('behavior'),
						def = $item.toggleClass('current').siblings().removeClass('current'); /* keep "current" classname for backward compatibility */

				if ('accordion' === type) {
					def.find('.accordion-content').slideUp().attr('aria-expanded', 'false').closest('li').removeClass('builder-accordion-active');
				}
				if ($item.hasClass('builder-accordion-active')) {
					$panel.slideUp();
					$item.removeClass('builder-accordion-active');
					$panel.attr('aria-expanded', 'false');
				} else {
					$item.addClass('builder-accordion-active');
					$panel.slideDown(function () {
						if ( type == 'accordion' && window.scrollY > $panel.offset().top ) {
							var $scroll = $('html,body');
							$scroll.animate({
								scrollTop: $this.offset().top
							},
							{duration: tbScrollHighlight.speed,
								complete: function () {
									if (tbScrollHighlight.fixedHeaderSelector != '' && $(tbScrollHighlight.fixedHeaderSelector).length > 0) {
										var to = Math.ceil($this.offset().top - $(tbScrollHighlight.fixedHeaderSelector).outerHeight(true));
										$scroll.stop().animate({scrollTop: to}, 300);
									}
								}
							}
							);
						}
					});
					$panel.attr('aria-expanded', 'true');
				}

				$('body').trigger('tf_accordion_switch', [$panel]);
				Themify.triggerEvent(window, 'resize');
				e.preventDefault();
			});
		},
		tabs: function () {
			$(".module.module-tab").each(function () {
				var $height = $(".tab-nav:first", this).outerHeight();
				if ($height > 200) {
					$(".tab-nav:first", this).siblings(".tab-content").css('min-height', $height);
				}
			}).tabify();
		},
		tabsDeepLink: function () {
			var hash = window.location.hash;
			hash = hash.replace('!/', ''); // fix conflict with section highlight
			if ('' != hash && '#' != hash && $(hash + '.tab-content').length > 0) {
				var cons = 100,
						$moduleTab = $(hash).closest('.module-tab');
				if ($moduleTab.length > 0) {
					$('a[href="' + hash + '"]').click();
					$('html, body').animate({scrollTop: $moduleTab.offset().top - cons}, 1000);
				}
			}
		},
		backgroundScrolling: function () {
			$('.builder-parallax-scrolling').each(function () {
				$(this).builderParallax('50%', 0.1);
			});
		},
		animationOnScroll: function () {
			var self = ThemifyBuilderModuleJs;
			if (!self.supportTransition())
				return;

			$('body').addClass('animation-on')
					.on('builder_toggle_frontend', function (event, is_edit) {
						self.doAnimation();
					});
			self.doAnimation();
		},
		doAnimation: function (resync) {
			resync = resync || false;
			// On scrolling animation
			var self = ThemifyBuilderModuleJs, selectors = tbLocalScript.animationInviewSelectors,
					$body = $('body'), $overflow = $('body');

			if (!ThemifyBuilderModuleJs.supportTransition())
				return;

			if ($body.find(selectors).length > 0) {
				if (!$overflow.hasClass('animation-running')) {
					$overflow.addClass('animation-running');
				}
			} else {
				if ($overflow.hasClass('animation-running')) {
					$overflow.removeClass('animation-running');
				}
			}

			// Global Animation
			if (tbLocalScript.createAnimationSelectors.selectors) {
				$.each(tbLocalScript.createAnimationSelectors.selectors, function (key, val) {
					$(val).addClass(tbLocalScript.createAnimationSelectors.effect);
				});
			}

			// Specific Animation
			if (tbLocalScript.createAnimationSelectors.specificSelectors) {
				$.each(tbLocalScript.createAnimationSelectors.specificSelectors, function (selector, effect) {
					$(selector).addClass(effect);
				});
			}

			// Core Builder Animation
			$.each(selectors, function (i, selector) {
				$(selector).addClass('wow');
			});

			if (resync)
				Themify.wow.doSync();
		},
		supportTransition: function () {
			var b = document.body || document.documentElement,
					s = b.style,
					p = 'transition';

			if (typeof s[p] == 'string') {
				return true;
			}

			// Tests for vendor specific prop
			var v = ['Moz', 'webkit', 'Webkit', 'Khtml', 'O', 'ms'];
			p = p.charAt(0).toUpperCase() + p.substr(1);

			for (var i = 0; i < v.length; i++) {
				if (typeof s[v[i] + p] == 'string') {
					return true;
				}
			}
			return false;
		},
		setupBodyClasses: function () {
			var classes = [];
			if (ThemifyBuilderModuleJs._isTouch()) {
				classes.push('builder-is-touch');
			}
			if (ThemifyBuilderModuleJs._isMobile()) {
				classes.push('builder-is-mobile');
			}
			if (tbLocalScript.isParallaxActive)
				classes.push('builder-parallax-scrolling-active');
			$('.themify_builder_content').each(function () {
				if ($(this).children(':not(.js-turn-on-builder)').length > 0) {
					classes.push('has-builder');
					return false;
				}
			});

			$('body').addClass(classes.join(' '));
		},
		_checkBrowser: function (browser) {
			var isOpera = !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
			return  'opera' == browser ? isOpera : false;

		},
		isBuilderActive: function () {
			return $('body').hasClass('themify_builder_active');
		},
		_isTouch: function () {
			var isTouchDevice = navigator.userAgent.match(/(iPhone|iPod|iPad|Android|playbook|silk|BlackBerry|BB10|Windows Phone|Tizen|Bada|webOS|IEMobile|Opera Mini)/),
					isTouch = (('ontouchstart' in window) || (navigator.msMaxTouchPoints > 0) || (navigator.maxTouchPoints));
			return isTouchDevice || isTouch;
		},
		_isMobile: function () {
			var isTouchDevice = navigator.userAgent.match(/(iPhone|iPod|iPad|Android|playbook|silk|BlackBerry|BB10|Windows Phone|Tizen|Bada|webOS|IEMobile|Opera Mini)/);
			return isTouchDevice;
		},
		InitVideoDimension: function () {
			var $video = $('.video-wrap').find('iframe,object, embed');
			function VideoDimension($el) {
				var newWidth = $el.closest('.video-wrap').width();
				$el.width(newWidth).height(newWidth * $el.data('aspectRatio'));
			}
			if ($video.length > 0) {
				$video.each(function () {
					$(this).data('aspectRatio', this.height / this.width).removeAttr('height width');
					VideoDimension($(this));
				});
				$(window).resize(function () {
					$video.each(function () {
						VideoDimension($(this));
					});
				});
			}
		},
		galleryPagination: function () {
			$('body').delegate('.builder_gallery_nav a', 'click', function (e) {
				e.preventDefault();
				var $wrap = $(this).closest('.module-gallery');
				$.ajax({
					url: this,
					beforeSend: function () {
						$wrap.addClass('builder_gallery_load');
					},
					complete: function () {
						$wrap.removeClass('builder_gallery_load');
					},
					success: function (data) {
						if (data) {
							var $id = $wrap.prop('id');
							$wrap.html($(data).find('#' + $id).html());
						}
					}
				});
			});
		},
		showcaseGallery: function () {
			$('body').on('click', '.module.module-gallery.layout-showcase a', function () {
				$(this).closest('.gallery').find('.gallery-showcase-image img').prop('src', $(this).data('image'));
				return false;
			});
		},
		isResponsiveFrame: false,
		parallaxScrollingInit: function(){
			// Custom parallax
			if ( $('[data-parallax-element-speed]').length && ! this.isResponsiveFrame ) {
				Themify.LoadAsync(tbLocalScript.builder_url + '/js/premium/themify.parallaxit.js', ThemifyBuilderModuleJs.parallaxScrollingCallback);
			}
		},
		parallaxScrollingCallback: function(){
			// Custom parallax
			if ( $('body').data('plugin_themifyParallaxit') ) {
				$('body').data('plugin_themifyParallaxit').init();
			} else {
				$('body').themifyParallaxit({ selectors: '[data-parallax-element-speed]'});
			}

			$('body').on('builder_toggle_frontend', function(event, is_edit){
				if ( is_edit ) {
					$('body').data('plugin_themifyParallaxit').stop();
				}
			});
			$( document ).ajaxComplete(function() {
				if(typeof ThemifyBuilderCommon==='undefined'){//builder is disabled
					var $elem = $('[data-parallax-element-speed]');
					if($elem.length>0){
						setTimeout(function(){
							$('body').data('plugin_themifyParallaxit').stop();
							$('body').removeData('plugin_themifyParallaxit');

							$elem.each(function(){
								$(this).css('top', ''); // reset top attr
							});

							if($.fn.imagesLoaded){
								$elem.imagesLoaded().always(function (instance) {
									$('body').themifyParallaxit({ selectors: '[data-parallax-element-speed]'});
								});
							}
							else{
								$('body').themifyParallaxit({ selectors: '[data-parallax-element-speed]'});
							}

						},500);
					}
				}
			});
		}
	};

	// Initialize
	ThemifyBuilderModuleJs.init();

}(jQuery, window, document));
