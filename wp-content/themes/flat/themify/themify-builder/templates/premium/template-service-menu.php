<?php
if (!defined('ABSPATH'))
	exit; // Exit if accessed directly
/**
 * Template Service Menu
 * 
 * Access original fields: $mod_settings
 * @author Themify
 */
if (TFCache::start_cache('service-menu', self::$post_id, array('ID' => $module_ID))):

	$fields_default = array(
		'title_service_menu' => '',
		'style_service_menu' => '',
		'description_service_menu' => '',
		'price_service_menu' => '',
		'image_service_menu' => '',
		'appearance_image_service_menu' => '',
		'image_size_service_menu' => '',
		'width_service_menu' => '',
		'height_service_menu' => '',
		'link_service_menu' => '',
		'link_options' => '',
		'image_zoom_icon' => '',
		'lightbox_width' => '',
		'lightbox_height' => '',
		'lightbox_size_unit_width' => '',
		'lightbox_size_unit_height' => '',
		'param_service_menu' => array(),
		'highlight_service_menu' => array(),
		'highlight_text_service_menu' => '',
		'highlight_color_service_menu' => '',
		'css_service_menu' => '',
		'animation_effect' => ''
	);

	if ( isset($mod_settings['appearance_image_service_menu']) )
		$mod_settings['appearance_image_service_menu'] = $this->get_checkbox_data($mod_settings['appearance_image_service_menu']);

	if (isset($mod_settings['param_service_menu']))
		$mod_settings['param_service_menu'] = explode('|', $mod_settings['param_service_menu']);

	$highlight = false;
	if (isset($mod_settings['highlight_service_menu'])) {
		$mod_settings['highlight_service_menu'] = explode('|', $mod_settings['highlight_service_menu']);
		if( in_array( 'highlight', $mod_settings['highlight_service_menu'] ) ) {
			$highlight = true;
		}
	}

	$fields_args = wp_parse_args( $mod_settings, $fields_default );
	extract( $fields_args, EXTR_SKIP );
	$animation_effect = $this->parse_animation_effect( $animation_effect, $fields_args );

	$container_class =  array( 'module', 'module-' . $mod_name, $module_ID, $appearance_image_service_menu, $style_service_menu, $css_service_menu, $animation_effect );
	if( $highlight ) {
		$container_class[] = 'has-highlight';
		$container_class[] = $highlight_color_service_menu;
	} else {
		$container_class[] = 'no-highlight';
	}
	$container_class = implode( ' ', apply_filters( 'themify_builder_module_classes', $container_class, $mod_name, $module_ID, $fields_args ) );

	$lightbox = false;
	$link_attr = '';
	if( $link_options === 'lightbox' ) {
		$lightbox = true;
		$units = array(
			'pixels' => 'px',
			'percents' => '%'
		);

		if( !empty( $lightbox_width ) || !empty( $lightbox_height ) ) {
			$lightbox_settings = array();
			$lightbox_settings[] = !empty( $lightbox_width ) 
				? $lightbox_width . (!empty( $lightbox_size_unit_width ) 
					? $units[$lightbox_size_unit_width] : 'px') : '';
			$lightbox_settings[] = !empty( $lightbox_height ) 
				? $lightbox_height . (!empty( $lightbox_size_unit_height ) 
					? $units[$lightbox_size_unit_height] : 'px') : '';

			$link_attr = sprintf( 'data-zoom-config="%s"', implode( '|', $lightbox_settings ) );
		}
	}

	$zoom = $image_zoom_icon === 'zoom';
	$newtab = $link_options === 'newtab';
	$image_alt = '' != $title_service_menu ? esc_attr( $title_service_menu ) : wp_strip_all_tags( $description_service_menu );

	if ( $this->is_img_php_disabled() ) {
		// get image preset
		$preset = $image_size_image != '' ? $image_size_image : themify_get('setting-global_feature_size');
		if (isset($_wp_additional_image_sizes[$preset]) && $image_size_image != '') {
			$width_service_menu = intval($_wp_additional_image_sizes[$preset]['width']);
			$height_service_menu = intval($_wp_additional_image_sizes[$preset]['height']);
		} else {
			$width_service_menu = $width_service_menu != '' ? $width_service_menu : get_option($preset . '_size_w');
			$height_service_menu = $height_service_menu != '' ? $height_service_menu : get_option($preset . '_size_h');
		}
		$upload_dir = wp_upload_dir();
		$base_url = $upload_dir['baseurl'];
		$attachment_id = themify_get_attachment_id_from_url( $image_service_menu, $base_url );
		if( $attachment_id ) {
			$class = 'wp-image-' . $attachment_id;
		} else {
			$class = '';
		}
		$image = '<img src="' . esc_url($image_service_menu) . '" alt="' . esc_attr($image_alt) . ( ! empty( $image_title ) ? ( ' title=' . esc_attr( $image_title ) ) : '' ) . '" width="' . esc_attr($width_service_menu) . '" height="' . esc_attr($height_service_menu) . '" class="tb_menu_image '. $class .'">';
	} else {
		$image = themify_get_image( 'src=' . esc_url($image_service_menu) . '&w=' . $width_service_menu . '&h=' . $height_service_menu . '&alt=' . $image_alt . '&ignore=true&class=tb_menu_image' );
	}
	$image = apply_filters( 'themify_image_make_responsive_image', $image );

	// check whether link is image or url
	if ( ! empty( $link_service_menu ) ) {
		$check_img = $this->is_img_link( $link_service_menu );
		if ( ! $check_img && $lightbox ) {
			$link_service_menu = themify_get_lightbox_iframe_link( $link_service_menu );
		}
	}
	
	$container_props = apply_filters( 'themify_builder_module_container_props', array(
        'id' => $module_ID,
        'class' => $container_class
    ), $fields_args, $mod_name, $module_ID );
	?>
	<!-- module service menu -->
	<div<?php echo $this->get_element_attributes( $container_props ); ?>>

		<?php do_action( 'themify_builder_before_template_content_render' ); ?>

		<?php if( $highlight && $highlight_text_service_menu != '' ) : ?>
			<div class="tb-highlight-text">
				<?php echo $highlight_text_service_menu; ?>
			</div>
		<?php endif; ?>

		<div class="tb-image-wrap">
			<?php if ( ! empty( $link_service_menu ) ) : ?>
				<a href="<?php echo esc_url( $link_service_menu ); ?>" <?php
				if ( $lightbox ) : echo 'class="lightbox-builder themify_lightbox"';
				endif;
				?> <?php
				if ( $newtab ) : echo 'target="_blank"';
				endif;
				?> <?php echo $link_attr; ?>>
					<?php if ( $zoom && $link_options !== 'regular' ) : ?>
						<?php $zoom_icon = $link_options === 'newtab' ? 'fa-external-link' : 'fa-search'; ?>
						<span class="zoom fa <?php echo $zoom_icon; ?>"></span>
					<?php endif; ?>
					<?php echo $image; ?>
				</a>
			<?php else : ?>
				<?php echo $image; ?>
			<?php endif; ?>
		</div><!-- .tb-image-wrap -->

		<div class="tb-image-content">
			<?php if( $title_service_menu != '' ) : ?>
				<h4 class="tb-menu-title"><?php echo $title_service_menu; ?></h4>
			<?php endif; ?>

			<?php if( $price_service_menu != '' ) : ?>
			<div class="tb-menu-price">
				<?php echo $price_service_menu; ?>
			</div>
			<?php endif; ?>

			<?php if( $description_service_menu != '' ) : ?>
				<div class="tb-menu-description">
					<?php echo $description_service_menu; ?>
				</div>
			<?php endif; ?>
		</div><!-- .tb-image-content -->

	<?php do_action( 'themify_builder_after_template_content_render' ); ?>
	</div>
	<!-- /module service menu -->

<?php endif; ?>
<?php TFCache::end_cache(); ?>