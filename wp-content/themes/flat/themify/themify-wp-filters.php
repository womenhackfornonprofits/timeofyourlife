<?php
/**
 * Changes to WordPress behavior and interface applied by Themify framework
 *
 * @package Themify
 */

if ( ! function_exists( 'themify_wp_video_shortcode' ) ) :
/**
 * Removes height in video to replicate this fix https://github.com/markjaquith/WordPress/commit/3d8e31fb82cc1485176c89d27b736bcd9d2444ba#diff-297bf46a572d5f80513d3fed476cd2a2R1862
 *
 * @param $out
 * @param $atts
 *
 * @return mixed
 */
function themify_wp_video_shortcode( $out, $atts ) {
	$width_rule = '';
	if ( ! empty( $atts['width'] ) ) {
		$width_rule = sprintf( 'width: %dpx; ', $atts['width'] );
	}
	return preg_replace( '/<div style="(.*?)" class="wp-video">/i', '<div style="' . esc_attr( $width_rule ) . '" class="wp-video">', $out );
}
endif;
add_filter( 'wp_video_shortcode', 'themify_wp_video_shortcode', 10, 2 );

if( ! function_exists('themify_parse_video_embed_vars') ) :
/**
 * Add wmode transparent and post-video container for responsive purpose
 * Remove webkitallowfullscreen and mozallowfullscreen for HTML validation purpose
 * @param string $html The embed markup.
 * @param string $url The URL embedded.
 * @return string The modified embed markup.
 */
function themify_parse_video_embed_vars($html, $url) {
	$services = array(
		'youtube.com',
		'youtu.be',
		'blip.tv',
		'vimeo.com',
		'dailymotion.com',
		'hulu.com',
		'viddler.com',
		'qik.com',
		'revision3.com',
		'wordpress.tv',
		'wordpress.com',
		'funnyordie.com'
	);
	$video_embed = false;
	foreach( $services as $service ) {
		if( stripos($html, $service) ) {
			$video_embed = true;
			break;
		}
	}
	if( $video_embed ) {
		if ( strpos( $html, "<iframe " ) !== false ) {
			$html = str_replace( array( ' webkitallowfullscreen', ' mozallowfullscreen' ), '', $html );
		}
		$html = '<div class="post-video">' . $html . '</div>';
		if( strpos( $html, "<embed src=" ) !== false ) {
			$html = str_replace('</param><embed', '</param><param name="wmode" value="transparent"></param><embed wmode="transparent" ', $html);
		}
		elseif( strpos( $html, 'wmode=transparent' ) === false ) {
			if( stripos($url, 'youtube') || stripos($url, 'youtu.be') ) {

				if( stripos($url, 'youtu.be') ) {
					$parsed = parse_url($url);
					$ytq = isset( $parsed['query'] )? $parsed['query']: '';
					$url = 'http://www.youtube.com/embed' . $parsed['path'] . '?wmode=transparent&fs=1' . $ytq;
				} else {
					$parsed = parse_url($url);
					parse_str($parsed['query'], $query);

					$parsed['scheme'] .= '://';

					if ( isset( $query['v'] ) && '' != $query['v'] ) {
						$parsed['path'] = '/embed/' . $query['v'];
						unset( $query['v'] );
					} else {
						$parsed['path'] = '/embed/';
					}

					$query['wmode'] = 'transparent';
					$query['fs'] = '1';

					$parsed['query'] = '?';
					foreach ( $query as $param => $value ) {
						$parsed['query'] .= $param . '=' . $value . '&';
					}
					$parsed['query'] = substr($parsed['query'], 0, -1);

					$url = implode('', $parsed);
				}
				$url = str_replace('038;','&',$url);

				$html = preg_replace('/src="(.*)" (frameborder)/i', 'src="' . esc_url( themify_https_esc( $url ) ) . '" $2', $html);
			} else {
				if ( is_ssl() && ( false !== stripos( $html, 'http:' ) ) ) {
					$html = str_replace( 'http:', 'https:', $html );
				}
				$search = array('?fs=1', '?fs=0');
				$replace = array('?fs=1&wmode=transparent', '?fs=0&wmode=transparent');
				$html = str_replace($search, $replace, $html);
				
			}
		} 
	}
	else {
		$html = '<div class="post-embed">' . $html . '</div>';
	}
	
	return str_replace('frameborder="0"','',$html);
}
endif;
add_filter( 'embed_oembed_html', 'themify_parse_video_embed_vars', 10, 2 );

/**
 * Add extra protocols like skype: to list of allowed protocols.
 *
 * @since 2.1.8
 *
 * @param array $protocols List of protocols allowed by default by WordPress.
 *
 * @return array $protocols Updated list including extra protocols added.
 */
function themify_allow_extra_protocols( $protocols ){
	$protocols[] = 'skype';
	$protocols[] = 'sms';
	$protocols[] = 'comgooglemaps';
	$protocols[] = 'comgooglemapsurl';
	$protocols[] = 'comgooglemaps-x-callback';
	return $protocols;
}
add_filter( 'kses_allowed_protocols' , 'themify_allow_extra_protocols' );

if( ! function_exists( 'themify_upload_mime_types' ) ) :
/**
 * Adds .svg and .svgz to list of mime file types supported by WordPress
 * @param array $existing_mime_types WordPress supported mime types
 * @return array Array extended with svg/svgz support
 * @since 1.3.9
 */
function themify_upload_mime_types( $existing_mime_types = array() ) {
	$existing_mime_types['svg'] = 'image/svg+xml';
	$existing_mime_types['svgz'] = 'image/svg+xml';
	return $existing_mime_types;
}
endif;
add_filter( 'upload_mimes', 'themify_upload_mime_types' );

/**
 * Display an additional column in categories list
 * @since 1.1.8
 */
function themify_custom_category_header( $cat_columns ) {
    $cat_columns['cat_id'] = __( 'ID', 'themify' );
    return $cat_columns;
}
add_filter( 'manage_edit-category_columns', 'themify_custom_category_header', 10, 2 );

/**
 * Display ID in additional column in categories list
 * @since 1.1.8
 */
function themify_custom_category( $null, $column, $termid ) {
	return $termid;
}
add_filter( 'manage_category_custom_column', 'themify_custom_category', 10, 3 );

/**
 * Set a default title for the front page
 *
 * @return string
 * @since 1.7.6
 */
function themify_filter_wp_title( $title, $sep ) {
	global $aioseop_options;

	if( empty( $title ) && ( is_home() || is_front_page() ) ) {
		if( class_exists( 'All_in_One_SEO_Pack' ) && '' != $aioseop_options['aiosp_home_title'] ) {
			return $aioseop_options['aiosp_home_title'];
		}
		return get_bloginfo( 'name' );
	}

	return str_replace( $sep , '', $title );
}
add_filter( 'wp_title', 'themify_filter_wp_title', 10, 2 );

/**
 * Filters the title. Removes the default separator.
 *
 * @since 2.0.2
 *
 * @param string $title Page title to be output.
 * @param string $sep Separator to search and replace.
 *
 * @return mixed
 */
function themify_wp_title( $title, $sep ) {
	return str_replace( $sep, '', $title );
}
add_filter( 'wp_title', 'themify_wp_title', 10, 2 );

/**
 * Hijacks themes passed for upgrade checking and remove those from Themify
 * @param Bool
 * @param Array $r List of themes
 * @param String $url URL of upgrade check
 * @return Array
 * @since 1.1.8
 */
function themify_hide_themes( $r, $url ){
	if ( false !== stripos( $url, 'api.wordpress.org/themes/update-check' ) ) {
		$themes = json_decode( $r['body']['themes'] );
		$themes_list = themify_get_theme_names();
		if ( is_array( $themes_list ) ) {
			foreach( $themes_list as $theme_name ){
				unset( $themes->themes->{$theme_name} );
			}
			$r['body']['themes'] = json_encode( $themes );
		}
	}
	return $r;
}
if( is_admin() )
	add_filter( 'http_request_args', 'themify_hide_themes', 5, 2);

/**
 * Add property attribute for HTML validation purpose
 * @since 2.7.3
 */
function themify_style_loader_tag( $link, $handle ) {
	if ( 'mediaelement' === $handle || 'wp-mediaelement' === $handle ) {
		$link = str_replace( "type='text/css'", "type='text/css' property='stylesheet'", $link );
	}
	return $link;
}
add_action( 'style_loader_tag', 'themify_style_loader_tag', 10, 2 );

/**
 * Add menu name as a classname to menus when "container" is missing
 *
 * @since 2.8.9
 * @return array
 */
function themify_wp_nav_menu_args_filter( $args ) {
	if ( ! $args['container'] ) {
		if( ! empty( $args['menu'] ) ) {
			$menu = wp_get_nav_menu_object( $args['menu'] );
		} elseif ( $args['theme_location'] && ( $locations = get_nav_menu_locations() ) && isset( $locations[ $args['theme_location'] ] ) ) {
			$menu = wp_get_nav_menu_object( $locations[ $args['theme_location'] ] );
		}

		if ( isset( $menu ) && ! is_wp_error( $menu ) ) {
			$args['menu_class'] .= ' menu-name-' . $menu->slug;
		}
	}

	return $args;
}
add_filter( 'wp_nav_menu_args', 'themify_wp_nav_menu_args_filter' );