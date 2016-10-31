<?php
/**
 * Provide compatibility with third party plugins
 *
 * @package Themify
 */

if ( function_exists( 'icl_register_string' ) ) :
	/**
	 * Make dynamic strings in Themify theme available for translation with WPML String Translation
	 * @param $context
	 * @param $name
	 * @param $value
	 * @since 1.5.3
	 */
	function themify_register_wpml_strings( $context, $name, $value ) {
	    $value = maybe_unserialize( $value );
	    if ( is_array( $value ) ) {
	        foreach ( $value as $k => $v ) {
				themify_register_wpml_strings( $context, $k, $v );
			}
	    } else {
			$translatable = array(
				'setting-footer_text_left',
				'setting-footer_text_right',
				'setting-homepage_welcome',
				'setting-action_text',
			);
			foreach ( array('one','two','three','four','five','six','seven','eight','nine','ten') as $option ) {
				$translatable[] = 'setting-slider_images_' . $option . '_title';
				$translatable[] = 'setting-header_slider_images_' . $option . '_title';
				$translatable[] = 'setting-footer_slider_images_' . $option . '_title';
			}
			if ( stripos( $name, 'title_themify-link' ) || in_array( $name, $translatable ) ) {
				icl_register_string( $context, $name, $value );
			}
	    }
	}
	themify_register_wpml_strings( 'Themify', 'Themify Option', themify_get_data() );
endif;

if( class_exists( 'SitePress' ) ) {
	/**
	 * Checks if WPML is active and if so, sets the correct page number.
	 *
	 * @since 1.7.3
	 * @since 2.3.7 Only applied to query pages.
	 * @param $wp_query
	 */
	function themify_wpml_pagination_setup( $wp_query ) {
		if ( themify_is_query_page() ) {
			$paged = 1;
			if ( get_query_var( 'paged' ) ) {
				$paged = get_query_var( 'paged' );
			} elseif( get_query_var( 'page' ) ) {
				$paged = get_query_var( 'page' );
			}
			set_query_var( 'paged', $paged );
		}
	}
	add_action( 'pre_get_posts', 'themify_wpml_pagination_setup' );
}

// Remove default WC wrappers
remove_action( 'woocommerce_before_main_content', 'woocommerce_output_content_wrapper', 10);
remove_action( 'woocommerce_after_main_content', 'woocommerce_output_content_wrapper_end', 10);

// Remove default WC sidebar
remove_action( 'woocommerce_sidebar', 'woocommerce_get_sidebar', 10);

// Remove breadcrumb for later insertion within Themify wrapper
remove_action( 'woocommerce_before_main_content', 'woocommerce_breadcrumb', 20 );

if( ! function_exists( 'themify_before_shop_content' ) ) :
	/**
	 * Add initial portion of wrapper
	 * @since 1.4.6
	 */
	function themify_before_shop_content() { ?>
		<!-- layout -->
		<div id="layout" class="pagewidth clearfix">

			<?php themify_content_before(); // Hook ?>

			<!-- content -->
			<div id="content" class="<?php echo (is_product() || is_shop()) ? 'list-post':''; ?>">

				<?php
				if(!themify_check('setting-hide_shop_breadcrumbs')) {
					themify_breadcrumb_before();
					woocommerce_breadcrumb();
					themify_breadcrumb_after();
				}
				themify_content_start(); // Hook
	}
endif;
add_action( 'woocommerce_before_main_content', 'themify_before_shop_content', 20 );

if( ! function_exists( 'themify_after_shop_content' ) ) :
	/**
	 * Add end portion of wrapper
	 * @since 1.4.6
	 */
	function themify_after_shop_content() {
				if (is_search() && is_post_type_archive() ) {
					add_filter( 'woo_pagination_args', 'woocommerceframework_add_search_fragment', 10 );
				}
				themify_content_end(); // Hook ?>

			</div>
			<!-- /#content -->

			<?php themify_content_after() // Hook ?>

		</div><!-- /#layout -->
	<?php
	}
endif;
add_action( 'woocommerce_after_main_content', 'themify_after_shop_content', 20 );

if( ! function_exists( 'themify_wc_compatibility_sidebar' ) ) :
	/**
	 * Add sidebar if it's enabled in theme settings
	 * @since 1.4.6
	 */
	function themify_wc_compatibility_sidebar(){

		// Check if WC is active and this is a WC-managed page
		if( !themify_is_woocommerce_active() || !function_exists('is_woocommerce') || !is_woocommerce() ) return;

		$sidebar_layout = 'sidebar1';

		if ( is_product() ) {
			if ( themify_check('setting-single_product_layout') ) {
				$sidebar_layout = themify_get('setting-single_product_layout');
			} elseif( themify_check('setting-default_page_post_layout') ) {
				$sidebar_layout = themify_get('setting-default_page_post_layout');
			}
		} else if ( is_shop() ) {
			$woo_page_layout = get_post_meta( get_option('woocommerce_shop_page_id') , 'page_layout', true);
			if ( $woo_page_layout == 'default' ) {
				if ( themify_check( 'setting-shop_layout' ) ) {
						$sidebar_layout = themify_get( 'setting-shop_layout' );
				}
				elseif( themify_check( 'setting-default_page_layout' ) ) {
						$sidebar_layout = themify_get( 'setting-default_page_layout' );
				}
				elseif ( themify_check( 'setting-default_layout' ) ) {
						$sidebar_layout = themify_get('setting-default_layout');
				}
			} else {
				$sidebar_layout = $woo_page_layout;
			}
		}
		elseif(is_product_category() || is_product_tag()){
			$sidebar_layout = themify_check('setting-shop_archive_layout')?themify_get('setting-shop_archive_layout'):themify_get('setting-default_layout');
		}
		themify_ecommerce_sidebar_before(); // Hook

		if ( $sidebar_layout != 'sidebar-none' ) {
			get_sidebar();
		}

		themify_ecommerce_sidebar_after(); // Hook
	}
endif;
add_action( 'themify_content_after', 'themify_wc_compatibility_sidebar', 10 );

if ( ! function_exists( 'themify_wc_body_class' ) ) :
	/**
	 * Set correct layout class in body for Shop page
	 *
	 * @since 1.9.4
	 *
	 * @param array $classes
	 * @return array
	 */
	function themify_wc_body_class( $classes = array() ) {
		// Check if WC is active and this is a WC-managed page
		if( !themify_is_woocommerce_active() || !function_exists('is_woocommerce') || !is_woocommerce() ) return $classes;
		$sidebar_layout = '';
		if( is_product() ) {
			if( themify_check('setting-single_product_layout') ) {
				$sidebar_layout = themify_get('setting-single_product_layout');
			} elseif( themify_check('setting-default_page_post_layout') ) {
				$sidebar_layout = themify_get('setting-default_page_post_layout');
			}
		} elseif (is_shop()) {
			$sidebar_in_page = get_post_meta( get_option( 'woocommerce_shop_page_id' ) , 'page_layout', true );
			$sidebar_layout = '';
			if ( $sidebar_in_page == 'default' ) {
				if ( themify_check('setting-shop_layout') ) {
					$sidebar_layout = themify_get( 'setting-shop_layout' );
				} 
				elseif( themify_check( 'setting-default_page_layout' ) ) {
					$sidebar_layout = themify_get( 'setting-default_page_layout' );
				}
				elseif( themify_check( 'setting-default_layout' ) ) {
					$sidebar_layout = themify_get( 'setting-default_layout' );
				}
			} else {
				$sidebar_layout = $sidebar_in_page;
			}

			// Content Width
			$woo_content_width = get_post_meta( get_option( 'woocommerce_shop_page_id' ) , 'content_width', true );
			if ( $woo_content_width == 'full_width' ) {
				$classes[] = 'full_width';
			} else {
				$classes[] = 'default_width';
			}
		}
		elseif(is_product_category() || is_product_tag()){
			$sidebar_layout = themify_check('setting-shop_archive_layout')?themify_get('setting-shop_archive_layout'):themify_get('setting-default_layout');
		}
		if ( '' != $sidebar_layout ) {
			$key = 0;
			foreach ( $classes as $class ) {
				if ( false !== stripos( $class, 'sidebar' ) ) {
					unset( $classes[$key] );
				}
				$key++;
			}
			$classes[] = $sidebar_layout;
		}

		return $classes;
	}
endif;
add_filter( 'body_class', 'themify_wc_body_class', 99 );

if ( ! function_exists( 'themify_maybe_hide_shop_title' ) ) :
	/**
	 * Hide the page title if it's the shop page and user choosed to hide it.
	 *
	 * @since 2.3.4
	 *
	 * @param bool $show_title
	 * @return bool
	 */
	function themify_maybe_hide_shop_title( $show_title ) {
		if ( is_shop() && 'yes' == get_post_meta( get_option( 'woocommerce_shop_page_id' ) , 'hide_page_title', true ) ) {
			return false;
		}
		if ( 'yes' == themify_get( 'setting-hide_page_title' ) ) {
			return false;
		}
		return $show_title;
	}
endif;
add_filter( 'woocommerce_show_page_title', 'themify_maybe_hide_shop_title' );

if( ! function_exists( 'woocommerce_result_count' ) && themify_is_woocommerce_active() ) {

	/*
	 * Hide number of showed products when using Infinite Scroll
	 */
	function woocommerce_result_count() {
		return 'infinite' == themify_get( 'setting-more_posts' )?false:wc_get_template( 'loop/result-count.php' );
	}
}

/**
 * Support for Sensei plugin
 *
 * @since 2.2.5
 */
function themify_sensei_support() {
	if( function_exists( 'Sensei' ) ) {
		global $woothemes_sensei;

		add_theme_support( 'sensei' );
		remove_action( 'sensei_before_main_content', array( $woothemes_sensei->frontend, 'sensei_output_content_wrapper' ), 10 );
		remove_action( 'sensei_after_main_content', array( $woothemes_sensei->frontend, 'sensei_output_content_wrapper_end' ), 10 );
		add_action( 'sensei_before_main_content', 'themify_sensei_wrapper_start', 10 );
		add_action( 'sensei_after_main_content', 'themify_sensei_wrapper_end', 10 );
	}
}
add_action( 'after_setup_theme', 'themify_sensei_support' );

/**
 * Display wrapper start for Sensei pages
 *
 * @since 2.2.5
 */
function themify_sensei_wrapper_start() {
	echo '
	<div id="layout" class="pagewidth clearfix">
		<div id="content" class="clearfix">';
}

/**
 * Display wrapper end for Sensei pages
 *
 * @since 2.2.5
 */
function themify_sensei_wrapper_end() {
	echo '</div><!-- #content -->';
	get_sidebar();
	echo '</div><!-- #layout -->';
}