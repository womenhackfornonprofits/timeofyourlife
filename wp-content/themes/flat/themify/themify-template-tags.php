<?php
/**
 * Custom template tags used in template files
 *
 * @package Themify
 */

if( ! function_exists( 'themify_logo_image' ) ) :
/**
 * Returns logo image.
 * Available filters:
 * 'themify_'.$location.'_logo_tag': filter the HTML tag used to wrap the text or image.
 * 'themify_logo_home_url': filter the home URL linked.
 * 'themify_'.$location.'_logo_html': filter the final HTML output to page.
 * @param string $location Logo location used as key to get theme setting values
 * @param string $cssid ID attribute for the logo tag.
 * @return string logo markup
 */
function themify_logo_image( $location = 'site_logo', $cssid = 'site-logo' ) {
	global $themify_customizer;

	$logo_tag = apply_filters( 'themify_' . $location . '_logo_tag', 'div' );
	$logo_mod = get_theme_mod( $cssid . '_image' );
	$logo_is_image = themify_get( 'setting-' . $location ) == 'image' && themify_check( 'setting-' . $location . '_image_value' );

	$html = '<' . $logo_tag . ' id="' . esc_attr( $cssid ) . '">';

	if ( $logo_is_image && empty( $logo_mod ) ) {
		$html .= '<a href="' . esc_url( apply_filters( 'themify_logo_home_url', home_url() ) ) . '" title="' . esc_attr( get_bloginfo( 'name' ) ) . '">';
		$type = $logo_is_image ? 'image' : 'text';
		$site_name = get_bloginfo( 'name' );
		if ( 'image' == $type ) {
			$html .= themify_get_image( 'ignore=true&src=' . themify_get( 'setting-' . $location . '_image_value' ) . '&w=' . themify_get( 'setting-' . $location . '_width' ) . '&h=' . themify_get( 'setting-' . $location . '_height' ) . '&alt=' . urlencode( get_bloginfo( 'name' ) ) );
			$html .= isset( $themify_customizer ) ? '<span style="display: none;">' . esc_html( $site_name ) . '</span>' : '';
		} else {
			$html .= isset( $themify_customizer ) ? '<span>' . esc_html( $site_name ) . '</span>' : esc_html( $site_name );
		}
		$html .= '</a>';
	} else {
		$type = 'customizer';
		$html .= $themify_customizer->site_logo( $cssid );
	}

	$html .= '</' . $logo_tag . '>';

	return apply_filters( 'themify_' . $location . '_logo_html', $html, $location, $logo_tag, $type );
}
endif;

if( ! function_exists( 'themify_site_description' ) ) :
/**
 * Returns site description markup.
 *
 * @since 1.3.2
 *
 * @return string
 */
function themify_site_description() {

	if ( $description = get_bloginfo( 'description' ) ) {
		global $themify_customizer;
		$html = '<div id="site-description" class="site-description">';
			$html .= $themify_customizer->site_description( $description );
		$html .=  '</div>';
	} else {
		$html = '';
	}

	/**
	 * Filters description markup before it's returned.
	 *
	 * @param string $html
	 */
	return apply_filters( 'themify_site_description', $html );
}
endif;

if ( ! function_exists( 'themify_custom_menu_nav' ) ) :
/**
 * Sets custom menu selected in page custom panel as navigation, otherwise sets the default.
 *
 * @since 1.9.5
 *
 * @param array $args Settings to configure navigation menu
 */
function themify_custom_menu_nav( $args = array() ) {
	// Get page ID reliably
	$queried_object = get_queried_object();
	$page_id = isset( $queried_object->ID ) ? $queried_object->ID : 0;

	// Compile menu arguments
	$args = wp_parse_args( $args, array(
		'theme_location' => 'main-nav',
		'fallback_cb' => 'themify_default_main_nav',
		'container'   => '',
		'menu_id'     => 'main-nav',
		'menu_class'  => 'main-nav'
	));

	// See if the page has a menu assigned
	$custom_menu = get_post_meta( $page_id, 'custom_menu', true );
	if ( ! empty( $custom_menu ) ) {
		$args['menu'] = $custom_menu;
	}

	// Render the menu
	wp_nav_menu( $args );
}
endif;

if ( ! function_exists( 'themify_zoom_icon' ) ) :
/**
 * Returns zoom icon markup for lightboxed featured image
 *
 * @param bool $echo
 *
 * @return mixed|void
 */
function themify_zoom_icon( $echo = true ) {
	if ( $echo ) {
		echo apply_filters( 'themify_zoom_icon', themify_check( 'lightbox_icon' ) ? '<span class="zoom"></span>' : '' );
	}
	return apply_filters( 'themify_zoom_icon', themify_check( 'lightbox_icon' ) ? '<span class="zoom"></span>' : '' );
}
endif;

if( ! function_exists( 'themify_register_grouped_widgets' ) ) :
/**
 * Registers footer sidebars.
 *
 * @param array  $columns Sets of sidebars that can be created.
 * @param array  $widget_attr General markup for widgets.
 * @param string $widgets_key
 * @param string $default_set
 */
function themify_register_grouped_widgets( $columns = array(), $widget_attr = array(), $widgets_key = 'setting-footer_widgets', $default_set = 'footerwidget-3col' ) {
	$data = themify_get_data();
	if(empty($columns)){
		$columns = array(
			'footerwidget-4col' => 4,
			'footerwidget-3col'	=> 3,
			'footerwidget-2col' => 2,
			'footerwidget-1col' => 1,
			'none'			 	=> 0
		);
	}
	$option = (!isset($data[$widgets_key]) || '' == $data[$widgets_key])? $default_set: $data[$widgets_key];
	if(empty($widget_attr)){
		$widget_attr = array(
			'sidebar_name' => __('Footer Widget', 'themify'),
			'sidebar_id' => 'footer-widget',
			'before_widget' => '<div id="%1$s" class="widget %2$s">',
			'after_widget' => '</div>',
			'before_title' => '<h4 class="widgettitle">',
			'after_title' => '</h4>',
		);
	}
	if ( ! isset( $columns[$option] ) ) {
		$columns[$option] = 0;
	}
	for($x = 1; $x <= $columns[$option]; $x++){
		register_sidebar(array(
			'name' => $widget_attr['sidebar_name'] . ' ' .$x,
			'id' => $widget_attr['sidebar_id'].'-'.$x,
			'before_widget' => $widget_attr['before_widget'],
			'after_widget' => $widget_attr['after_widget'],
			'before_title' => $widget_attr['before_title'],
			'after_title' => $widget_attr['after_title'],
		));
	}
}
endif;

if( ! function_exists( 'themify_the_footer_text' ) ) :
/**
 * Outputs footer text
 *
 * @param string $area Footer text area
 * @param bool   $wrap Class to add to block
 * @param string $block The block of text this is
 * @param string $date_fmt Date format for year shown
 * @param bool   $echo Whether to echo or return the markup
 *
 * @return mixed|string|void
 * @internal param string $key The footer text to show. Default: left
 */
function themify_the_footer_text( $area = 'left', $wrap = true, $block = '', $date_fmt = 'Y', $echo = true ) {
	// Prepare variables
	if('' == $block){
		if('left' == $area){
			$block = 'one';
		} elseif('right' == $area){
			$block = 'two';
		}
	}
	$text_block = '';
	if('one' == $block) {
		$text_block = '&copy; <a href="' . esc_url( home_url() ) . '">' . esc_html( get_bloginfo( 'name' ) ) . '</a> ' . date( $date_fmt );
	} elseif('two' == $block) {
		$text_block = __( 'Powered by <a href="http://wordpress.org">WordPress</a> &bull; <a href="https://themify.me">Themify WordPress Themes</a>', 'themify' );
	}
	$key = 'setting-footer_text_'.$area;

	// Get definitive text to display, parse through WPML if available
	if ( '' != themify_get($key) ) {
		$data = themify_get_data();
		if ( function_exists( 'icl_t' ) ) {
			$text = icl_t('Themify', $key, $data[$key]);
		} else {
			$text = $data[$key];
		}
	} else {
		$text = $text_block;
	}
	// Start markup
	$html = apply_filters('themify_footer_text'.$block, $text);
	if ( true === is_bool( $wrap ) && true == $wrap ) {
		$html = '<div class="' . esc_attr( $block ) . '">' . $html . '</div>';
	} elseif( ! is_bool( $wrap ) ) {
		$html = '<div class="' . esc_attr( $wrap ) . '">' . $html . '</div>';
	}
	$html = apply_filters('themify_the_footer_text_'.$area, $html);
	if ( $echo ) echo $html;
	return $html;
}
endif;

if ( ! function_exists( 'themify_get_author_link' ) ) :
/**
 * Builds the markup for the entry author with microdata information.
 * @return string
 * @since 1.7.4
 */
function themify_get_author_link() {
	$output = '<span class="author vcard"><a class="url fn n" href="' . esc_url( get_author_posts_url( get_the_author_meta( 'ID' ) ) ) . '" rel="author">' . get_the_author() . '</a></span>';
	return $output;
}
endif;

if( ! function_exists( 'themify_pagenav' ) ) :
/**
 * Echoes page navigation
 *
 * @param string $before
 * @param string $after
 * @param bool   $query
 */
function themify_pagenav( $before = '', $after = '', $query = false ) {
	echo themify_get_pagenav($before, $after, $query);
}
endif;

if( ! function_exists( 'themify_get_pagenav' ) ) :
/**
 * Returns page navigation
 * @param string $before Markup to show before pagination links
 * @param string $after Markup to show after pagination links
 * @param object $query WordPress query object to use
 * @return string
 * @since 1.2.4
 */
function themify_get_pagenav( $before = '', $after = '', $query = false ) {
	global $wp_query;

	if( false == $query ){
		$query = $wp_query;
	}
	$request = $query->request;
	$posts_per_page = intval(get_query_var('posts_per_page'));
	$paged = intval(get_query_var('paged'));
	$numposts = $query->found_posts;
	$max_page = $query->max_num_pages;

	if(empty($paged) || $paged == 0) {
		$paged = 1;
	}
	$pages_to_show = apply_filters('themify_filter_pages_to_show', 5);
	$pages_to_show_minus_1 = $pages_to_show-1;
	$half_page_start = floor($pages_to_show_minus_1/2);
	$half_page_end = ceil($pages_to_show_minus_1/2);
	$start_page = $paged - $half_page_start;
	if($start_page <= 0) {
		$start_page = 1;
	}
	$end_page = $paged + $half_page_end;
	if(($end_page - $start_page) != $pages_to_show_minus_1) {
		$end_page = $start_page + $pages_to_show_minus_1;
	}
	if($end_page > $max_page) {
		$start_page = $max_page - $pages_to_show_minus_1;
		$end_page = $max_page;
	}
	if($start_page <= 0) {
		$start_page = 1;
	}
	$out = '';
	if ($max_page > 1) {
		$out .=  $before.'<div class="pagenav clearfix">';
		if ($start_page >= 2 && $pages_to_show < $max_page) {
			$first_page_text = '&laquo;';
			$out .=  '<a href="'.get_pagenum_link().'" title="'.$first_page_text.'" class="number">'.$first_page_text.'</a>';
		}
		if($pages_to_show < $max_page)
			$out .= get_previous_posts_link('&lt;');
		for($i = $start_page; $i  <= $end_page; $i++) {
			if($i == $paged) {
				$out .=  ' <span class="number current">'.$i.'</span> ';
			} else {
				$out .=  ' <a href="'.get_pagenum_link($i).'" class="number">'.$i.'</a> ';
			}
		}
		if($pages_to_show < $max_page)
			$out .= get_next_posts_link('&gt;');
		if ($end_page < $max_page) {
			$last_page_text = '&raquo;';
			$out .=  '<a href="'.get_pagenum_link($max_page).'" title="'.$last_page_text.'" class="number">'.$last_page_text.'</a>';
		}
		$out .=  '</div>'.$after;
	}
	return $out;
}
endif;

if( ! function_exists( 'themify_get_content' ) ) :
/**
 * Return post content with the proper filters applied
 * @param string $more_link_text Text to use for (more...)
 * @param int $stripteaser Optional. Strip teaser content before the more text
 * @param string $more_file
 * @return string Post content
 */
function themify_get_content( $more_link_text = '(more...)', $stripteaser = 0, $more_file = '' ) {
	$content = get_the_content($more_link_text, $stripteaser, $more_file);
	$content = apply_filters('the_content', $content);
	$content = str_replace(']]>', ']]&gt;', $content);
	return $content;
}
endif;

if( ! function_exists( 'themify_excerpt' ) ) :
/**
 * Themify Excerpt
 *
 * @param $limit
 *
 * @return array|mixed|string
 */
function themify_excerpt( $limit ) {
	$excerpt = explode(' ', get_the_excerpt(), $limit);
	if (count($excerpt)>=$limit) {
		array_pop($excerpt);
		$excerpt = implode(" ",$excerpt).'...';
	} else {
		$excerpt = implode(" ",$excerpt);
	}
		$excerpt = preg_replace('`[[^]]*]`','',$excerpt);
	return $excerpt;
}
endif;

if( ! function_exists( 'themify_has_post_video' ) ) :
/**
 * Check if current post has featured video
 * Must be used inside the loop
 *
 * @since 2.7.3
 */
function themify_has_post_video() {
	return themify_get( 'video_url' ) != '';
}
endif;

if( ! function_exists( 'themify_post_video' ) ) :
/**
 * Display the post video
 * Must be used inside the loop
 *
 * @since 2.7.3
 */
function themify_post_video() {
	global $wp_embed;
	return do_shortcode( /* re-run shortcode to embed self-hosted video using [video] */
		$wp_embed->run_shortcode('[embed]' . themify_get('video_url') . '[/embed]')
	);
}
endif;

if( ! function_exists( 'themify_area_design' ) ) :
/**
 * Checks the area design setting and returns 'none' or a design option.
 *
 * @since 2.1.3
 *
 * @param string $key Main prefix for setting and field.
 * @param array $args
 *
 * @return mixed
 */
function themify_area_design( $key = 'header', $args = array() ) {
	$args = wp_parse_args( $args, array(
		'setting' => 'setting-' . $key . '_design',
		'field'   => $key . '_design',
		'default' => $key . '-horizontal',
		'values'  => array( 'header-horizontal', 'header-block', 'none' )
	) );

	$is_shop = themify_is_woocommerce_active() && is_shop() ? true : false;

	if ( is_singular() || $is_shop ) {
		global $post;
		if ( $is_shop && is_object( $post ) ) {
			$temp_post = $post;
			$post = get_post( get_option( 'woocommerce_shop_page_id' ) );
		}
		$single = themify_get( $args['field'] );
		if ( $is_shop && is_object( $post ) ) {
			$post = $temp_post;
		}
		if ( in_array( $single, $args['values'] ) ) {
			$design = $single;
		}
	}

	if ( empty( $design ) || 'default' == $design ) {
		$design = themify_check( $args['setting'] ) ? themify_get( $args['setting'] ) : $args['default'];
	}

	return $design;
}
endif;

if ( ! function_exists( 'themify_get_term_description' ) ) :
/**
 * Returns term description
 * @param string $taxonomy The taxonomy for the term that will be described.
 * @return string
 * @since 1.5.6
 */
function themify_get_term_description( $taxonomy = 'category' ) {
	$term_description = term_description( 0, $taxonomy );
	if ( ! empty( $term_description ) ) {
		$output = '<div class="category-description">' . $term_description . '</div>';
	} else {
		$output = '';
	}
	return apply_filters( 'themify_get_term_description', $output );
}
endif;

if ( ! function_exists( 'themify_get_featured_image_link' ) ) :
/**
 * Returns escaped URL for featured image link
 * @return string
 * @since 1.3.5
 */
function themify_get_featured_image_link( $args = array() ) {
	$defaults = array (
		'no_permalink' => false // if there is no lightbox link, don't return a link
	);
	$args = wp_parse_args( $args, $defaults );
	extract( $args, EXTR_SKIP );

	if ( themify_get('external_link') != '') {
		$link = esc_url(themify_get('external_link'));
	} elseif ( themify_get('lightbox_link') != '') {
		$link = esc_url(themify_get('lightbox_link'));
		if(themify_check('iframe_url')) {
			$link = themify_get_lightbox_iframe_link( $link );
		}
		$link = $link . '" class="themify_lightbox';
	} elseif(themify_check('link_url')) {
		$link = themify_get('link_url');
	} elseif($args['no_permalink']) {
		$link = '';
	} else {
		$link = get_permalink();
		if(current_theme_supports('themify-post-in-lightbox')){
			if( !is_single() && '' != themify_get('setting-open_inline') ){
				$link = add_query_arg( array( 'post_in_lightbox' => 1 ), get_permalink() ) . '" class="themify_lightbox';
			}
			if( themify_is_query_page() ){
				if( 'no' == themify_get('post_in_lightbox') ){
					$link = get_permalink();
				} else {
					$link = add_query_arg( array( 'post_in_lightbox' => 1 ), get_permalink() ) . '" class="themify_lightbox';
				}
			}
		}
	}
	return apply_filters('themify_get_featured_image_link', $link);
}
endif;

if ( ! function_exists('themify_theme_feed_link') ) :
/**
 * Returns the feed link, usually RSS
 * @param string $setting
 * @param bool $echo
 * @return mixed|void
 * @since 1.5.2
 */
function themify_theme_feed_link( $setting = 'setting-custom_feed_url', $echo = true ) {
	$out = '';
	if(themify_get( $setting ) != ''){
		$out .= themify_get( $setting );
	} else {
		$out .= get_bloginfo('rss2_url');
	}
	$out = apply_filters('themify_theme_feed_link', $out);
	if( $echo ) {
		echo esc_url( $out );
	}
	return esc_url( $out );
}
endif;

if( ! function_exists( 'themify_is_query_page' ) ) :
/**
 * Checks if current page is a query category page
 * @return bool
 * @since 1.3.8
 */
function themify_is_query_page(){
	global $themify;
	if( isset( $themify->query_category ) && '' != $themify->query_category ) {
		return true;
	} else {
		return false;
	}
}
endif;

if( ! function_exists( 'themify_post_title' ) ) :
/**
 * Display post title
 *
 * @since 2.7.7
 */
function themify_post_title( $args = array() ) {
	global $themify;

	if( $themify->hide_title != 'yes' ) {
		themify_before_post_title();

		extract( themify_parse_args( $args, array(
			'tag' => themify_post_title_tag(),
			'class' => 'post-title entry-title',
			'use_permalink' => false,
		), 'post_title' ) );

		if( $themify->unlink_title == 'yes' ) { ?>
			<<?php echo $tag; ?> class="<?php echo $class; ?>"><?php the_title(); ?></<?php echo $tag; ?>>
		<?php } else { ?>
			<<?php echo $tag; ?> class="<?php echo $class; ?>"><a href="<?php echo $use_permalink ? get_permalink() : themify_get_featured_image_link(); ?>" title="<?php the_title_attribute(); ?>"><?php the_title(); ?></a></<?php echo $tag; ?>>
		<?php }

		themify_after_post_title();
	}
}
endif;

if( ! function_exists( 'themify_post_title_tag' ) ) :
/**
 * Get the HTML tag to be used for post titles
 *
 * @since 2.7.7
 * @return string
 */
function themify_post_title_tag() {
	global $themify;

	$tag = 'h2';
	if( is_single()
		// if loop is rendering inside a shortcode, use default
		&& ( ! isset( $themify->is_shortcode ) || ( isset( $themify->is_shortcode ) && $themify->is_shortcode != true ) )
	) {
		$tag = 'h1';
	}

	return apply_filters( 'themify_post_title_tag', $tag );
}
endif;

if( ! function_exists( 'themify_post_media' ) ) :
/**
 * Display post video or the featured image
 *
 * @since 2.7.7
 */
function themify_post_media( $args = array() ) {
	global $themify;

	extract( themify_parse_args( $args, array(
		'class' => 'post-image ' . $themify->image_align,
		'use_permalink' => false,
	), 'post_title' ) );

	//check if there is a video url in the custom field
	if( themify_has_post_video() ){

		themify_before_post_image(); // Hook

		echo themify_post_video();

		themify_after_post_image(); // Hook

	} elseif( $post_image = themify_get_image($themify->auto_featured_image . $themify->image_setting . "w=".$themify->width."&h=".$themify->height ) ){
		if( $themify->hide_image != 'yes' ) : ?>

			<?php themify_before_post_image(); // Hook ?>

			<figure class="<?php echo $class; ?>">
				<?php if( 'yes' == $themify->unlink_image ): ?>
					<?php echo $post_image; ?>
				<?php else: ?>
					<a href="<?php echo $use_permalink ? get_permalink() : themify_get_featured_image_link(); ?>"><?php echo $post_image; ?><?php themify_zoom_icon(); ?></a>
				<?php endif; ?>
			</figure>

			<?php themify_after_post_image(); // Hook ?>

		<?php endif; //post image
	}
}
endif;