/**
 * Themify Section Highlight
 * Copyright (c) Themify
 */
;
(function ( $, window, document, undefined ) {

	var pluginName = "themifySectionHighlight",
		defaults = {
			speed: 1500
		};

	function Plugin( element, options ) {
		this.element = element;
		this.options = $.extend( {}, defaults, options );
		this._defaults = defaults;
		this.onClicking = false;
		this.init();
	}

	Plugin.prototype = {
		init: function () {
			var self = this,
				sections = [],
				$mainNavLink = $( 'a', $( '#main-nav' ) );

			// collects scrollto hash
			$mainNavLink.each( function () {
				var url = $( this ).prop( 'hash' );
				if ( 'undefined' != typeof(url) && url.indexOf( '#' ) != - 1 && url.length > 1 ) {
					sections.push( url );
				}
			});
			sections.push( '#header' );

			// set caching position top
			this.updateSecPosition( sections );
			$( window ).resize( function () {
				self.updateSecPosition( sections );
			});

			if ( sections.length > 0 ) {
				// clear highlight menu
				$mainNavLink.filter(function(index){
					var url = $(this).prop('hash');
					return 'undefined' != typeof(url) && url.indexOf( '#' ) != - 1 && url.length > 1;
				}).each(function(){
					$(this).closest('li').removeClass('current_page_item current-menu-item');
				});

				$.each( sections, function ( index, value ) {
					var section = value, obj = $( value );
					if ( obj.length > 0 ) {
						var offsetY = obj.data( 'offsetY' ),
							elemHeight = obj.height(),
							didScroll = false;

						$(window).scroll(function() {
							didScroll = true;
						});

						setInterval(function() {
							if ( didScroll ) {
								didScroll = false;

								var headerWrapHeight = $( '#headerwrap' ).outerHeight(),
									winScroll = $(window).scrollTop(),
									scrollAmount = winScroll + headerWrapHeight;
								// If hit top of element
								if ( scrollAmount > offsetY && ( offsetY + elemHeight ) > scrollAmount ) {
									if ( self.onClicking ) {
										return;
									}
									if ( section.replace( '#', '' ) !== 'header' ) {
										self.setHash(section);
									}

									$( 'a[href*="' + section + '"]', $('#main-nav') ).parent( 'li' ).addClass( 'current_page_item' ).siblings().removeClass( 'current_page_item current-menu-item' );

									// remove hash if on top browser
									if ( winScroll < 50 ) {
										self.clearHash();
									}
								}
							}
						}, 500);
					}
				});
			}
		},

		clearHash: function () {
			// remove hash
			if ( window.history && window.history.replaceState ) {
				window.history.replaceState( '', '', window.location.pathname );
			} else {
				window.location.href = window.location.href.replace( /#.*$/, '#' );
			}
		},

		setHash: function(hash) {
			if(history.pushState) {
				history.pushState(null, null, hash);
			}
			else {
				location.hash = hash;
			}
		},

		updateSecPosition: function ( sections ) {
			if ( sections.length > 0 ) {
				$.each( sections, function ( index, value ) {
					// cache the position
					$( value ).each( function () {
						$( this ).data( 'offsetY', parseInt( $( this ).offset().top ) );
					});
				});
			}
		}
	};

	$.fn[pluginName] = function ( options ) {
		return this.each( function () {
			if ( ! $.data( this, "plugin_" + pluginName ) ) {
				$.data( this, "plugin_" + pluginName, new Plugin( this, options ) );
			}
		});
	};

})( jQuery, window, document );