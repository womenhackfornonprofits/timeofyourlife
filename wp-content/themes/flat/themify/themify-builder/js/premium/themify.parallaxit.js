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

						// Parallax fade on scroll
						if( $( this.parallaxElemns[i] ).data( 'prallax-fade' ) ) {
							var parallaxElposition = this.parallaxElemns[i].getBoundingClientRect(),
								opacityValue;
							if( (parallaxElposition.bottom - window.innerHeight * 0.15) <= this.parallaxElemns[i].offsetHeight && parallaxElposition.bottom >= 0 ) {
								opacityValue = (parallaxElposition.bottom - window.innerHeight * 0.15) / this.parallaxElemns[i].offsetHeight;
								this.parallaxElemns[i].style.opacity = opacityValue;
							} else if( parallaxElposition.top > 0 ) {
								this.parallaxElemns[i].style.opacity = 1;
							}
						}
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