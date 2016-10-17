;// Themify Theme Scripts - http://themify.me/

// Initialize object literals
var FixedHeader = {},
	ThemeTransition = {};

/////////////////////////////////////////////
// jQuery functions					
/////////////////////////////////////////////
(function($){

// Initialize carousels //////////////////////////////
function createCarousel(obj) {
	obj.each(function() {
		var $this = $(this);
		$this.carouFredSel({
			responsive : true,
			prev : '#' + $this.data('id') + ' .carousel-prev',
			next : '#' + $this.data('id') + ' .carousel-next',
			pagination : {
				container : '#' + $this.data('id') + ' .carousel-pager'
			},
			circular : true,
			infinite : true,
			swipe: true,
			scroll : {
				items : 1,
				fx : $this.data('effect'),
				duration : parseInt($this.data('speed'))
			},
			auto : {
				play : !!('off' != $this.data('autoplay')),
				timeoutDuration : 'off' != $this.data('autoplay') ? parseInt($this.data('autoplay')) : 0
			},
			items : {
				visible : {
					min : 1,
					max : 1
				},
				width : 222
			},
			onCreate : function() {
				$this.closest('.slideshow-wrap').css({
					'visibility' : 'visible',
					'height' : 'auto'
				});
				var $testimonialSlider = $this.closest('.testimonial.slider');
				if( $testimonialSlider.length > 0 ) {
					$testimonialSlider.css({
						'visibility' : 'visible',
						'height' : 'auto'
					});
				}
				$(window).resize();
			}
		});
	});
}

// Test if touch event exists //////////////////////////////
function is_touch_device() {
	return $('body').hasClass('touch');
}

// throttledresize
!function($){var e=$.event,t,n={_:0},r=0,s,i;t=e.special.throttledresize={setup:function(){$(this).on("resize",t.handler)},teardown:function(){$(this).off("resize",t.handler)},handler:function(h,o){var a=this,l=arguments;s=!0,i||(setInterval(function(){r++,(r>t.threshold&&s||o)&&(h.type="throttledresize",e.dispatch.apply(a,l),s=!1,r=0),r>9&&($(n).stop(),i=!1,r=0)},30),i=!0)},threshold:0}}(jQuery);

// Fixed Header /////////////////////////
FixedHeader = {
	headerHeight: 0,
	hasHeaderSlider: false,
	headerSlider: false,
	init: function() {
		this.calculateHeaderHeight();
		if( '' !== themifyScript.fixedHeader ) {
			this.activate();
			$(window).on('scroll touchstart.touchScroll touchmove.touchScroll', this.activate);
		}
	},
	activate: function() {
		var $window = $(window),
			scrollTop = $window.scrollTop(),
			$headerWrap = $('#headerwrap');

		if( scrollTop >= FixedHeader.headerHeight ) {
			if ( ! $headerWrap.hasClass( 'fixed-header' ) ) {
				FixedHeader.scrollEnabled();
			}
		} else {
			if ( $headerWrap.hasClass( 'fixed-header' ) ) {
				FixedHeader.scrollDisabled();
			}
		}
	},
	scrollDisabled: function() {
		$('#pagewrap').css('paddingTop', '');
		$('#headerwrap').removeClass('fixed-header');
		$('#header').removeClass('header-on-scroll');
		$('body').removeClass('fixed-header-on');
	},
	scrollEnabled: function() {
		$('#pagewrap').css('paddingTop', Math.floor( this.headerHeight ));
		$('#headerwrap').addClass('fixed-header');
		$('#header').addClass('header-on-scroll');
		$('body').addClass('fixed-header-on');
	},
	calculateHeaderHeight : function(){
		var headerHeight = $('#headerwrap').outerHeight();
		headerHeight += parseFloat( $('#headerwrap').css( 'marginTop' ) );
		FixedHeader.headerHeight = headerHeight;
	}
};

// Theme Transition Animation /////////////////////////
ThemeTransition = {
	init: function() {
		this.setup();
	},
	setup: function() {
		// shortcode columns add class
		$('.col2-1.first, .col3-1.first, .col3-2.first, .col4-1.first, .col4-2.first, .col4-3.first').each(function(){
			var $this = $(this);
			if($this.hasClass('col2-1')) {
				$this.next('.col2-1').addClass('last');
				$this.next('.col4-1').addClass('third').next('.col4-1').addClass('last');
			} else if($this.hasClass('col3-1')) {
				$this.next('.col3-1').addClass('second').next('.col3-1').addClass('last');
				$this.next('.col3-2').addClass('last');
			} else if($this.hasClass('col3-2')) {
				$this.next('.col3-1').addClass('last');
			} else if($this.hasClass('col4-1')) {
				$this.next('.col4-1').addClass('second').next('.col4-1').addClass('third').next('.col4-1').addClass('last');
			} else if($this.hasClass('col4-2')) {
				$this.next('.col4-2').addClass('last');
				$this.next('.col4-1').addClass('third').next('.col4-1').addClass('last');
			} else if($this.hasClass('col4-3')) {
				$this.next('.col4-1').addClass('last');
			}
		});
		var col_nums = 1;
		$('.col-full').each(function(){
			var $this = $(this);
			$this.removeClass('first last');
			if( col_nums % 2 == 0) {
				$this.addClass('last');
			} else {
				$this.addClass('first');
			}
			col_nums += 1;
		});
	}
};

// Scroll to Element //////////////////////////////
function themeScrollTo(offset) {
	$('body,html').animate({ scrollTop: offset }, 800);
}

// Transition Effect
// Call earlier before $.ready and $.load
if ( themifyScript.scrollingEffectOn ) {
	ThemeTransition.init();
}

// DOCUMENT READY
$(document).ready(function() {

	var $body = $('body'), $charts = $('.chart'), $skills = $('.progress-bar');

	// Fixed header
	if( ( '' != themifyScript.fixedHeader ) || (! is_touch_device() && '' != themifyScript.fixedHeader) ){
		FixedHeader.init();
	}

	/////////////////////////////////////////////
	// Chart Initialization
	/////////////////////////////////////////////
        
	function ChartInit(){
            $charts.each(function(){
                    var $self = $(this),
                        barColor = $self.data('color'),
                        percent = $self.data('percent');
                    $.each(themifyScript.chart, function(index, value){
                            if( 'false' == value || 'true' == value ){
                                    themifyScript.chart[index] = 'false'!=value;
                            } else if( parseInt(value) ){
                                    themifyScript.chart[index] = parseInt(value);
                            } else if( parseFloat(value) ){
                                    themifyScript.chart[index] = parseFloat(value);
                            }
                    });
                    if( typeof barColor !== 'undefined' )
                        themifyScript.chart.barColor = '#' + barColor.toString().replace('#', '');
                    $self.easyPieChart( themifyScript.chart);
                    $self.data('easyPieChart').update(0);
                    $self.waypoint(function(direction){
                            $self.data('easyPieChart').update(percent);
                    }, {offset: '80%'});
                  
            });
	};
        
        if($charts.length>0){
            if(!$.fn.waypoint || !$.fn.easyPieChart){
                Themify.LoadAsync(themify_vars.url+'/js/jquery.easy-pie-chart.js',function(){
                    Themify.LoadAsync(themify_vars.url+'/js/waypoints.min.js',ChartInit);
                });
            }
            else{
                this.chartsCallBack();
            }
        }

	/////////////////////////////////////////////
	// Skillset Animation
	/////////////////////////////////////////////
        function SkillInit(){
            
            $skills.each(function(){
                var $self = $(this).find('span'),
                    percent = $self.data('percent');
                    $self.width(0);
                    $self.waypoint(function(direction){
                            $self.animate({width: percent}, 800,function(){
                                    $(this).addClass('animated');
                            });
                    }, {offset: '80%'});
            });
        };
        if($skills.length>0){
            if(!$.fn.waypoint){
                Themify.LoadAsync(themify_vars.url+'/js/waypoints.min.js',SkillInit);
            }
            else{
                SkillInit();
            }
        }
        
	/////////////////////////////////////////////
	// Scroll to top
	/////////////////////////////////////////////
	$('.back-top a').on('click', function(e){
		e.preventDefault();
		themeScrollTo(0);
	});

	// anchor scrollTo
	$body.on('click', 'a[href*="#"]', function(e){
		var url = $(this).prop('href'),
			idx = url.indexOf('#'),
			hash = idx != -1 ? url.substring(idx+1) : '',
			offset = 0;

		if(hash.length > 1 && $('#' + hash).length > 0 && hash !== 'header') {
			offset = $('#' + hash).offset().top;
			// If header is set to fixed, calculate this
			if ( $('.fixed-header' ).length > 0 ) {
				offset += $( '#headerwrap' ).outerHeight();
			}

			themeScrollTo(offset);
			e.preventDefault();
		}
		
	});

	/////////////////////////////////////////////
	// Toggle main nav on mobile
	/////////////////////////////////////////////
	$('#menu-icon').themifySideMenu({
		close: '#menu-icon-close'
	});
	var $overlay = $( '<div class="body-overlay">' );
	$body.append( $overlay ).on( 'sidemenushow.themify', function () {
		$overlay.addClass( 'body-overlay-on' );
	} ).on( 'sidemenuhide.themify', function () {
		$overlay.removeClass( 'body-overlay-on' );
	} ).on( 'click.themify touchend.themify', '.body-overlay', function () {
		$( '#menu-icon' ).themifySideMenu( 'hide' );
	} );

	$(window).resize(function(){
		if( $( '#menu-icon' ).is(':visible') && $('#mobile-menu').hasClass('sidemenu-on')){
			$overlay.addClass( 'body-overlay-on' );
		}
		else{
			 $overlay.removeClass( 'body-overlay-on' );
		}
	});

	$body.on('touchstart touchmove touchend', '#main-nav', function(e) {
		e.stopPropagation();
	});

	/////////////////////////////////////////////
	// Add class "first" to first elements
	/////////////////////////////////////////////
	$('.highlight-post:odd').addClass('odd');

	// tablet hack for search focus issue #4366
	var searchFocusFix = {
		headerwrap: $('#headerwrap'),
		init: function() {
			if ( is_touch_device() ) {
				$(document).on('focus', '#header #searchform #s', this.onFocus)
				.on('blur', '#header #searchform #s', this.onBlur);
			}
		},
		onFocus: function() {
			if ( searchFocusFix.headerwrap.hasClass('fixed-header') && $(window).width() > 780 ) {
				setTimeout(function(){
					searchFocusFix.fixFixedPosition();
				}, 1000);
				$('body,html').animate({ scrollTop: $(window).scrollTop() }, 0);
				$(document).scroll(searchFocusFix.updateScrollTop);
			}
		},
		onBlur: function() {
			searchFocusFix.headerwrap.css({
				top: ''
			}).removeClass('fixed-header-search-focus');
			$(document).off('scroll', searchFocusFix.updateScrollTop);
		},
		fixFixedPosition: function() {
			searchFocusFix.headerwrap.css({
				top: document.body.scrollTop + 'px'
			}).addClass('fixed-header-search-focus');
		},
		updateScrollTop: function(){
			if ( searchFocusFix.headerwrap.hasClass('fixed-header') ) {
				searchFocusFix.fixFixedPosition();
			} else {
				searchFocusFix.headerwrap.css('top', '').removeClass('fixed-header-search-focus');
			}
		}
	};
	searchFocusFix.init();
});

// WINDOW LOAD
$(window).load(function() {
	// scrolling nav
	if ( typeof $.fn.themifySectionHighlight !== 'undefined' ) {
		$('body').themifySectionHighlight();
	}

	/////////////////////////////////////////////
	// Carousel initialization
	/////////////////////////////////////////////
	if($('.slideshow').length>0) {
            if(!$.fn.carouFredSel){
                Themify.LoadAsync(themify_vars.url+'/js/carousel.js',function(){
                    createCarousel($('.slideshow'));
                });
             }
             else{
               createCarousel($('.slideshow'));
             }  
	}
	
	// EDGE MENU //
	jQuery(function ($) {
		$("#main-nav li").on('mouseenter mouseleave dropdown_open', function (e) {
			if ($('ul', this).length) {
				var elm = $('ul:first', this);
				var off = elm.offset();
				var l = off.left;
				var w = elm.width();
				var docW = $(window).width();
				var isEntirelyVisible = (l + w <= docW);

				if (!isEntirelyVisible) {
					$(this).addClass('edge');
				} else {
					$(this).removeClass('edge');
				}

			}
		});
	});

});
	
})(jQuery);