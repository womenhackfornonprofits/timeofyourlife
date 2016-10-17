// Chain of Responsibility pattern. Creates base class that can be overridden.
if (typeof Object.create !== "function") {
	Object.create = function (obj) {
		function F() {
		}
		F.prototype = obj;
		return new F();
	};
}

(function ($, window, document) {
	var loadAPI = function loadAPI(callback) {
		Themify.LoadAsync('//www.youtube.com/iframe_api');
		iframeIsReady(callback);
	},
	iframeIsReady = function iframeIsReady(callback) {
		// Listen for Gobal YT player callback
		if (typeof YT === 'undefined' && typeof window.loadingPlayer === 'undefined') {
			// Prevents Ready Event from being called twice
			window.loadingPlayer = true;

			// Creates deferred so, other players know when to wait.
			window.dfd = $.Deferred();
			window.onYouTubeIframeAPIReady = function () {
				window.onYouTubeIframeAPIReady = null;
				window.dfd.resolve("done");
				callback();
			};
		} else if (typeof YT === 'object') {
			callback();
		} else {
			window.dfd.done(function (name) {
				callback();
			});
		}
	};

	// YTPlayer Object
	YTPlayer = {
		player: null,
		// Defaults
		defaults: {
			ratio: 16 / 9,
			videoId: 'LSmgKRx5pBo',
			mute: true,
			repeat: true,
			width: $(window).width(),
			playButtonClass: 'YTPlayer-play',
			pauseButtonClass: 'YTPlayer-pause',
			muteButtonClass: 'YTPlayer-mute',
			volumeUpClass: 'YTPlayer-volume-up',
			volumeDownClass: 'YTPlayer-volume-down',
			start: 0,
			pauseOnScroll: false,
			playerVars: {
				iv_load_policy: 3,
				modestbranding: 1,
				autoplay: 1,
				controls: 0,
				showinfo: 0,
				wmode: 'opaque',
				branding: 0,
				autohide: 0
			},
			events: null
		},
		/**
		 * @function init
		 * Intializes YTPlayer object
		 */
		init: function init(node, userOptions) {
			var self = this;

			self.userOptions = userOptions;

			self.$body = $('body'),
					self.$node = $(node),
					self.$window = $(window);

			// Setup event defaults with the reference to this
			self.defaults.events = {
				'onReady': function (e) {
					self.onPlayerReady(e);

					// setup up pause on scroll
					if (self.options.pauseOnScroll) {
						self.pauseOnScroll();
					}

					// Callback for when finished
					if (typeof self.options.callback == 'function') {
						self.options.callback.call(this);
					}
				},
				'onStateChange': function (e) {
					if (e.data === 0 && self.options.repeat) { // video ended and repeat option is set true
						self.player.seekTo(self.options.start);
					}
				}
			}


			self.options = $.extend(true, {}, self.defaults, self.userOptions);
			self.options.height = Math.ceil(self.options.width / self.options.ratio);
			self.ID = (new Date()).getTime();
			self.holderID = 'YTPlayer-ID-' + self.ID;


			self.createBackgroundVideo();

			// Listen for Resize Event
			self.$window.on('resize.YTplayer' + self.ID, function () {
				self.resize(self);
			});

			loadAPI(self.onYouTubeIframeAPIReady.bind(self));

			self.resize(self);

			return self;
		},
		/**
		 * @function pauseOnScroll
		 * Adds window events to pause video on scroll.
		 */
		pauseOnScroll: function pauseOnScroll() {
			var self = this;
			self.$window.on('scroll.YTplayer' + self.ID, function () {
				var state = self.player.getPlayerState();
				if (state === 1) {
					self.player.pauseVideo();
				}
			});
			self.$window.scrollStopped(function () {
				var state = self.player.getPlayerState();
				if (state === 2) {
					self.player.playVideo();
				}
			});
		},
		/**
		 * @function createBackgroundVideo
		 * Adds HTML for video background
		 */
		createBackgroundVideo: function createBackgroundVideo() {
			/*jshint multistr: true */
			var self = this,
					$YTPlayerString = $('<div id="ytplayer-container' + self.ID + '" class="themify-youtube-video big-video-wrap"><div id="' + self.holderID + '" class="ytplayer-player"></div></div>');
			if (self.$node.children('.big-video-wrap').length === 0) {
				self.$node.prepend($YTPlayerString);
				self.$YTPlayerString = $YTPlayerString;
				$YTPlayerString = null;
			}
		},
		/**
		 * @function resize
		 * Resize event to change video size
		 */
		resize: function resize(self) {
			//var self = this;
			var container = self.$node;
			var width = container.outerWidth(true),
					height = container.outerHeight(true),
					pHeight = Math.ceil(width / self.options.ratio),
					$YTPlayerPlayer = $('#' + self.holderID);
			$YTPlayerPlayer.width(width).height(pHeight).css({
				left: 0,
				top: (height - pHeight) / 2
			});

			$YTPlayerPlayer = null;
			container = null;
		},
		/**
		 * @function onYouTubeIframeAPIReady
		 * @ params {object} YTPlayer object for access to options
		 * Youtube API calls this function when the player is ready.
		 */
		onYouTubeIframeAPIReady: function onYouTubeIframeAPIReady() {
			var self = this;
			self.player = new window.YT.Player(self.holderID, self.options);
		},
		/**
		 * @function onPlayerReady
		 * @ params {event} window event from youtube player
		 */
		onPlayerReady: function onPlayerReady(e) {
			if (this.options.mute) {
				e.target.mute();
			}
			e.target.playVideo();
		},
		/**
		 * @function getPlayer
		 * returns youtube player
		 */
		getPlayer: function getPlayer() {
			return this.player;
		},
		/**
		 * @function destroy
		 * destroys all!
		 */
		destroy: function destroy() {
			var self = this;

			self.$node
					.removeData('ytPlayer')
					.removeClass('loaded');

			self.$YTPlayerString.remove();

			$(window).off('resize.YTplayer' + self.ID);
			$(window).off('scroll.YTplayer' + self.ID);
			self.$body = null;
			self.$node = null;
			self.$YTPlayerString = null;
			self.player.destroy();
			self.player = null;
		}
	};

	// Scroll Stopped event.
	$.fn.scrollStopped = function (callback) {
		var $this = $(this), self = this;
		$this.scroll(function () {
			if ($this.data('scrollTimeout')) {
				clearTimeout($this.data('scrollTimeout'));
			}
			$this.data('scrollTimeout', setTimeout(callback, 250, self));
		});
	};

	// Create plugin
	$.fn.YTPlayer = function (options) {

		return this.each(function () {
			var el = this;

			var player = Object.create(YTPlayer);
			player.init(el, options);
			$(el).data('ytPlayer', player);
		});
	};

})(jQuery, window, document);