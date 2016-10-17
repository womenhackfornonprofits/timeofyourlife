<?php
/**
 * @package    Themify_Builder
 * @subpackage Themify_Builder/classes
 */

class Themify_Builder_Include {

        
	public static $inview_selectors;
	public static $new_selectors;
        
        /**
	 * Selectors for CSS transition animations.
	 * @var string
	 */
	private $transition_selectors = '';

	/**
	 * Constructor.
	 * 
	 * @param object Themify_Builder $builder 
	 */
	public function __construct( Themify_Builder $builder ) {
           
            //Only For premium version
            if(Themify_Builder_Model::is_premium()){
                if(file_exists(THEMIFY_BUILDER_CLASSES_DIR . '/premium/class-themify-builder-revisions.php')){
                    include_once THEMIFY_BUILDER_CLASSES_DIR . '/premium/class-themify-builder-revisions.php';
                    // Themify Builder Revisions
                    new Themify_Builder_Revisions($builder);
                }
                if(file_exists(THEMIFY_BUILDER_CLASSES_DIR . '/premium/class-themify-builder-visibility-controls.php')){
                    require_once( THEMIFY_BUILDER_CLASSES_DIR . '/premium/class-themify-builder-visibility-controls.php' );

                    // Visibility controls
                    new Themify_Builder_Visibility_Controls();
                }
                
                if (Themify_Builder_Model::is_animation_active()) {
                    add_filter('themify_builder_animation_inview_selectors', array($this, 'add_inview_selectors'));
                }
                add_action('wp_head', array($this, 'add_builder_inline_css'), 0);
                add_filter( 'themify_builder_module_container_props', array( $this, 'parallax_elements_props' ), 10, 4 );
                add_filter( 'themify_builder_row_attributes', array( $this, 'parallax_elements_row_props' ), 10, 2 );
                add_action( 'wp_ajax_tfb_load_layout', array( $this, 'load_layout_ajaxify' ), 10 );
                add_action( 'wp_ajax_tfb_set_layout', array( $this, 'set_layout_ajaxify' ), 10 );
                add_action( 'wp_ajax_tfb_append_layout', array( $this, 'append_layout_ajaxify' ), 10 );
                add_action('themify_builder_background_styling',array($this,'background_styling'),10,3);
            
            }
            else{
                add_filter('themify_builder_animation_settings_fields',array($this,'animation_fields'),10,2);
            }
            // Parallax Element Scrolling - Module
            add_filter( 'themify_builder_animation_settings_fields', array( $this, 'parallax_elements_fields' ), 10 );

            // Parallax Element Scrolling - Row
            add_filter( 'themify_builder_row_fields_animation', array( $this, 'parallax_elements_fields' ), 10 );
            
            add_filter('themify_builder_row_fields_styling',array($this,'row_styling_fields'),10,1);
            add_filter('themify_builder_row_lightbox_form_settings',array($this,'row_animation'),10,1);
            add_filter('themify_builder_column_fields',array($this,'column_styling_fields'),10,1);
            add_filter('themify_builder_admin_bar_menu_single_page',array($this,'admin_bar_menu'),10,1);
            
          
            
	}
        
        
	/**
	 * Add module parallax scrolling fields to Styling Tab module settings.
	 * 
	 * @access public
	 * @param array $fields 
	 * @return array
	 */
	public function parallax_elements_fields( $fields ) {
                $is_premium = Themify_Builder_Model::is_premium();
		$new_fields = array(
			array(
				'id' => 'separator_parallax',
				'type' => 'separator',
				'meta' => array('html'=>'<hr><h4>'.__('Parallax Scrolling', 'themify').'</h4>'),
			),
			array(
				'id' => 'custom_parallax_scroll_speed',
				'type' => 'select',
				'label' => __( 'Scroll Speed', 'themify' ),
				'meta'  => array(
					array('value' => '',   'name' => '', 'selected' => true),
					array('value' => 1,   'name' => 1),
					array('value' => 2, 'name' => 2),
					array('value' => 3,  'name' => 3),
					array('value' => 4,  'name' => 4),
					array('value' => 5,   'name' => 5),
					array('value' => 6, 'name' => 6),
					array('value' => 7,  'name' => 7),
					array('value' => 8,  'name' => 8),
					array('value' => 9,  'name' => 9),
					array('value' => 10,  'name' => 10)
				),
				'description' => sprintf( '<small>%s <br>%s</small>', esc_html__( '1 = slow, 10 = very fast', 'themify' ), esc_html__( 'Produce parallax scrolling effect by selecting different scroll speed', 'themify' ) ),
				'binding' => array(
					'empty' => array(
						'hide' => array('custom_parallax_scroll_reverse', 'custom_parallax_scroll_fade', 'custom_parallax_scroll_zindex')
					),
					'not_empty' => array(
						'show' => array('custom_parallax_scroll_reverse', 'custom_parallax_scroll_fade', 'custom_parallax_scroll_zindex')
					)
				),
				'wrap_with_class' => !$is_premium?'themify_builder_lite':''
			),
			array(
				'id' => 'custom_parallax_scroll_reverse',
				'type' => 'checkbox',
				'label' => '',
				'options' => array(
					array( 'name' => 'reverse', 'value' => __('Reverse scrolling', 'themify')),
				),
				'wrap_with_class' => !$is_premium?'themify_builder_lite':''
			),
			array(
				'id' => 'custom_parallax_scroll_fade',
				'type' => 'checkbox',
				'label' => '',
				'options' => array(
					array( 'name' => 'fade', 'value' => __('Fade off as it scrolls', 'themify')),
				),
				'wrap_with_class' => !$is_premium?'themify_builder_lite':''
			),
			array(
				'id' => 'custom_parallax_scroll_zindex',
				'type' => 'text',
				'label' => __( 'Z-Index', 'themify' ),
				'class' => 'xsmall',
				'description' => sprintf( '%s <br>%s', esc_html__( 'Stack Order', 'themify' ), esc_html__( 'Module with greater stack order is always in front of an module with a lower stack order', 'themify' ) ),
                                'wrap_with_class' => !$is_premium?'themify_builder_lite':''
			),
                        
		);
		return array_merge( $fields, $new_fields );
	}

	/**
	 * Add custom attributes html5 data to module container div to show parallax options.
	 * 
	 * @access public
	 * @param array $props 
	 * @param array $fields_args 
	 * @param string $mod_name 
	 * @param string $module_ID 
	 * @return array
	 */
	public function parallax_elements_props( $props, $fields_args, $mod_name, $module_ID ) {
		if ( isset( $fields_args['custom_parallax_scroll_speed'] ) && '' != $fields_args['custom_parallax_scroll_speed'] ) 
			$props['data-parallax-element-speed'] = $fields_args['custom_parallax_scroll_speed'];

		if ( isset( $fields_args['custom_parallax_scroll_reverse'] ) && '' != str_replace( '|', '', $fields_args['custom_parallax_scroll_reverse'] ) ) 
			$props['data-parallax-element-reverse'] = 1;

		if ( isset( $fields_args['custom_parallax_scroll_fade'] ) && '' != str_replace( '|', '', $fields_args['custom_parallax_scroll_fade'] ) ) 
			$props[ 'data-prallax-fade' ] = 1;

		if ( isset( $fields_args['custom_parallax_scroll_zindex'] ) && '' != $fields_args['custom_parallax_scroll_zindex'] ) {
			$props['style'] = isset( $props['style'] ) ? $props['style'] . 'z-index:'. $fields_args['custom_parallax_scroll_zindex'].';' : 'z-index:'.$fields_args['custom_parallax_scroll_zindex'].';';
		}

		return $props;
	}

	/**
	 * Add custom attributes html5 data to row container div to show parallax options.
	 * 
	 * @param array $props 
	 * @param array $fields_args 
	 * @return array
	 */
	public function parallax_elements_row_props( $props, $fields_args ) {
		if ( isset( $fields_args['custom_parallax_scroll_speed'] ) && '' != $fields_args['custom_parallax_scroll_speed'] ) 
			$props['data-parallax-element-speed'] = $fields_args['custom_parallax_scroll_speed'];

		if ( isset( $fields_args['custom_parallax_scroll_reverse'] ) && '' != str_replace( '|', '', $fields_args['custom_parallax_scroll_reverse'] ) ) 
			$props['data-parallax-element-reverse'] = 1;

		if ( isset( $fields_args['custom_parallax_scroll_reverse'] ) && '' != str_replace( '|', '', $fields_args['custom_parallax_scroll_reverse'] ) ) 
			$props['data-parallax-element-reverse'] = 1;

		if ( isset( $fields_args['custom_parallax_scroll_zindex'] ) && '' != $fields_args['custom_parallax_scroll_zindex'] ) {
			$props['style'] = isset( $props['style'] ) ? $props['style'] . 'z-index:'. $fields_args['custom_parallax_scroll_zindex'].';' : 'z-index:'.$fields_args['custom_parallax_scroll_zindex'].';';
		}

		return $props;
	}
        
        /**
	 * Computes and returns the HTML a color overlay.
	 *
	 * @since 2.3.3
	 *
	 * @param array $styling The row's or column's styling array.
	 *
	 * @return bool Returns false if $styling doesn't have a color overlay. Otherwise outputs the HTML;
	 */
	private function do_color_overlay($styling) {
                $type = ! isset( $styling['cover_color-type'] ) ||  $styling['cover_color-type'] == 'color'?'color':'gradient';
                $hover_type = ! isset( $styling['cover_color_hover-type'] ) ||  $styling['cover_color_hover-type'] == 'hover_color'?'color':'gradient';
                $is_empty = $type==='color'?empty($styling['cover_color']):empty($styling['cover_gradient-css']);
                $is_empty = $is_empty && ($hover_type==='color'?empty($styling['cover_color_hover']):empty($styling['cover_gradient_hover-css']));
		if($is_empty){
                    return false;
                }
			 
		$atts = array('data-type'=>'color','data-hover-type'=>'color');
		if($type==='color'){
			if(!empty($styling['cover_color'])){
				$rgba = Themify_Builder::get_rgba_color($styling['cover_color']);
						$atts['style'] = 'background: ' . $rgba . ';';
						$atts['data-color'] = $rgba;
			}
							
		} elseif(!empty($styling['cover_gradient-css'])) {
			// using gradient
			$atts['data-type']='gradient';
		}
		if($hover_type==='color'){
			if(!empty($styling['cover_color_hover'])){
				$atts['data-hover-color'] = Themify_Builder::get_rgba_color($styling['cover_color_hover']);
			}
		}
		elseif(!empty($styling['cover_gradient_hover-css'])){
			$atts['data-hover-type']='gradient';
		}   
		if(isset( $styling['cover_color-type'] )){
			$atts['data-updated'] = 1;
		}
		?>		
		<div class="builder_row_cover" <?php echo Themify_Builder::get_element_attributes( $atts ); ?>></div>

		<?php
	}
        
        /**
	 * Computes and returns the HTML for a background slider.
	 *
	 * @since 2.3.3
	 *
	 * @param array  $row_or_col   Row or column definition.
	 * @param string $order        Order of row/column (e.g. 0 or 0-1-0-1 for sub columns)
	 * @param string $size         The size of images(thumbails,medium,large and etc.)
	 * @param string $builder_type Accepts 'row', 'col', 'sub-col'
	 *
	 * @return bool Returns false if $row_or_col doesn't have a bg slider. Otherwise outputs the HTML for the slider.
	 */
	private function do_slider_background($row_or_col, $order, $size = false, $builder_type = 'row') {
		if (!isset($row_or_col['styling']['background_slider']) ||
				empty($row_or_col['styling']['background_slider']) ||
				'slider' != $row_or_col['styling']['background_type']) {

			return false;
		}
                global  $ThemifyBuilder;
		if ($images = $ThemifyBuilder->get_images_from_gallery_shortcode($row_or_col['styling']['background_slider'])) :
			$bgmode = isset($row_or_col['styling']['background_slider_mode']) &&
					!empty($row_or_col['styling']['background_slider_mode']) ?
					$row_or_col['styling']['background_slider_mode'] : 'fullcover';
			if (!$size) {
                            $size = $ThemifyBuilder->get_gallery_param_option($row_or_col['styling']['background_slider'], 'size');
			}
			if (!$size) {
                            $size = 'large';
			}
			?>

				<div id="<?php echo $builder_type; ?>-slider-<?php echo esc_attr($order); ?>" class="<?php echo $builder_type; ?>-slider"
					 data-bgmode="<?php echo esc_attr($bgmode); ?>">
					<ul class="row-slider-slides clearfix">
			<?php
			$dot_i = 0;
			foreach ($images as $image) :
				$img_data = wp_get_attachment_image_src($image->ID, $size);
				?>
                                    <li data-bg="<?php echo esc_url(themify_https_esc($img_data[0])); ?>">
                                                    <a class="row-slider-dot" data-index="<?php echo esc_attr($dot_i); ?>"></a>
                                    </li>
				<?php
				$dot_i++;
			endforeach;
			?>
					</ul>
					<div class="row-slider-nav">
						<a class="row-slider-arrow row-slider-prev">&lsaquo;</a>
						<a class="row-slider-arrow row-slider-next">&rsaquo;</a>
					</div>
				</div>
				<!-- /.row-bgs -->
			<?php
		endif; // images
	}
        
        public function background_styling($row,$order,$type){
           
            // Background cover color
            $this->do_color_overlay($row['styling']);
            $size = isset($row['styling']['background_slider_size']) ? $row['styling']['background_slider_size'] : false;
            // Background Slider
            $this->do_slider_background($row,$order, $size, $type);
          
        }
        
        /**
	 * Computes and returns data for Builder row or column video background.
	 *
	 * @since 2.3.3
	 *
	 * @param array $styling The row's or column's styling array.
	 *
	 * @return bool|string Return video data if row/col has a background video, else return false.
	 */
	public static function get_video_background($styling) {
		$is_type_video = isset($styling['background_type']) && 'video' == $styling['background_type'];
		$has_video = isset($styling['background_video']) && !empty($styling['background_video']);

		if (!$is_type_video || !$has_video) {
			return false;
		}


		$video_data = 'data-fullwidthvideo="' . esc_url(themify_https_esc($styling['background_video'])) . '"';

		// Will only be written if they exist, for backwards compatibility with global JS variable tbLocalScript.backgroundVideoLoop
		if (isset($styling['background_video_options'])) {
			if (is_array($styling['background_video_options'])) {
				$video_data .= in_array('mute', $styling['background_video_options']) ? ' data-mutevideo="mute"' : ' data-mutevideo="unmute"';
				$video_data .= in_array('unloop', $styling['background_video_options']) ? ' data-unloopvideo="unloop"' : ' data-unloopvideo="loop"';
			} else {
				$video_data .= ( false !== stripos('mute', $styling['background_video_options']) ) ? ' data-mutevideo="mute"' : ' data-mutevideo="unmute"';
				$video_data .= ( false !== stripos('unloop', $styling['background_video_options']) ) ? ' data-unloopvideo="unloop"' : ' data-unloopvideo="loop"';
			}
		}

		return apply_filters('themify_builder_row_video_background', $video_data, $styling);
	}
        
        
	/**
	 * Defines selectors for CSS animations and transitions.
	 *
	 * @param $selectors
	 *
	 * @return array
	 */
	public function add_inview_selectors($selectors) {
		$extends = array(
			'.module.wow',
			'.themify_builder_content .themify_builder_row.wow',
			'.module_row.wow',
			'.builder-posts-wrap > .post.wow',
			'.fly-in > .post', '.fly-in .row_inner > .tb-column',
			'.fade-in > .post', '.fade-in .row_inner > .tb-column',
			'.slide-up > .post', '.slide-up .row_inner > .tb-column'
		);
		return array_merge($selectors, $extends);
	}
        
        /**
	 * Add inline CSS styles for animations
	 * @since 2.2.7
	 */
	public function add_builder_inline_css() {
          
            // Setup Animation
            self::$inview_selectors = apply_filters('themify_builder_animation_inview_selectors', array());
            self::$new_selectors = apply_filters('themify_builder_create_animation_selectors', array());

            $global_selectors = isset(self::$new_selectors['selectors']) ? self::$new_selectors['selectors'] : array();
            $specific_selectors = isset(self::$new_selectors['specificSelectors']) ? array_keys(self::$new_selectors['specificSelectors']) : array();
            $instyle_selectors = array_merge(self::$inview_selectors, $global_selectors, $specific_selectors);

            if (count($instyle_selectors) > 0) {

                    $this->transition_selectors = '.js.csstransitions ' . join(', .js.csstransitions ', $instyle_selectors);
                    $inline_style = $this->transition_selectors . ' { visibility:hidden; }';
                    printf('<style type="text/css">%s</style>', $inline_style);
                    add_action('wp_footer', array($this, 'write_transition_selectors'), 77);
            }
           
	}
        
        public function row_styling_fields($fields){
            
            // Image size
            $image_size = themify_get_image_sizes_list( true );
            unset( $image_size[ key( $image_size ) ] );
            $is_premium = Themify_Builder_Model::is_premium();
            
            $props = array(
                    // Background
                    array(
                            'id' => 'separator_image_background',
                            'title' => '',
                            'description' => '',
                            'type' => 'separator',
                            'meta' => array('html' => '<h4>' . __('Background', 'themify') . '</h4>'),
                    ),
                    array(
                            'id' => 'background_type',
                            'label' => __('Background Type', 'themify'),
                            'type' => 'radio',
                            'meta' => array(
                                    array('value' => 'image', 'name' => __('Image', 'themify')),
                                    array('value' => 'gradient', 'name' => __('Gradient', 'themify'),'disable'=>!$is_premium),
                                    array('value' => 'video', 'name' => __('Video', 'themify'),'disable'=>!$is_premium),
                                    array('value' => 'slider', 'name' => __('Slider', 'themify'),'disable'=>!$is_premium),
                            ),
                            'option_js' => true,
                            'wrap_with_class' => 'responsive-na'.(!$is_premium?' themify_builder_lite hide_opacity':'')
                    ),
                    // Background Slider
                    array(
                            'id' => 'background_slider',
                            'type' => 'textarea',
                            'label' => __('Background Slider', 'themify'),
                            'class' => 'tf-hide tf-shortcode-input',
                            'wrap_with_class' => 'tf-group-element tf-group-element-slider responsive-na',
                            'description' => sprintf('<a href="#" class="builder_button tf-gallery-btn">%s</a>', __('Insert Gallery', 'themify'))
                    ),
                     // Background Slider Image Size
                    array(
                            'id' => 'background_slider_size',
                            'label' => __('Image Size', 'themify'),
                            'type' => 'select',
                            'default' => '',
                            'meta' => $image_size,
                            'wrap_with_class' => 'tf-group-element tf-group-element-slider responsive-na',
                    ),
                    // Background Slider Mode
                    array(
                            'id' => 'background_slider_mode',
                            'label' => __('Background Slider Mode', 'themify'),
                            'type' => 'select',
                            'default' => '',
                            'meta' => array(
                                    array('value' => 'best-fit', 'name' => __('Best Fit', 'themify')),
                                    array('value' => 'fullcover', 'name' => __('Fullcover', 'themify')),
                            ),
                            'wrap_with_class' => 'tf-group-element tf-group-element-slider responsive-na',
                    ),
                    // Video Background
                    array(
                            'id' => 'background_video',
                            'type' => 'video',
                            'label' => __('Background Video', 'themify'),
                            'description' => __('Insert video URL (mp4, YouTube, or Vimeo). Note: video background does not work on mobile, background image will be used as fallback.', 'themify'),
                            'class' => 'xlarge',
                            'wrap_with_class' => 'tf-group-element tf-group-element-video responsive-na'
                    ),
                    array(
                            'id' => 'background_video_options',
                            'type' => 'checkbox',
                            'label' => '',
                            'default' => array(),
                            'options' => array(
                                    array('name' => 'unloop', 'value' => __('Disable looping <small>(mp4 only)</small>', 'themify')),
                                    array('name' => 'mute', 'value' => __('Disable audio <small>(mp4 only)</small>', 'themify')),
                            ),
                            'wrap_with_class' => 'tf-group-element tf-group-element-video responsive-na',
                    ),
                    // Background Image
                    array(
                            'id' => 'background_image',
                            'type' => 'image',
                            'label' => __('Background Image', 'themify'),
                            'class' => 'xlarge',
                            'wrap_with_class' => 'tf-group-element tf-group-element-image tf-group-element-slider tf-group-element-video',
                    ),
                    array(
                            'id' => 'background_gradient',
                            'type' => 'gradient',
                            'label' => __('Background Gradient', 'themify'),
                            'class' => 'xlarge',
                            'wrap_with_class' => 'tf-group-element tf-group-element-gradient'
                    ),
                    // Background repeat
                    array(
                            'id' => 'background_repeat',
                            'label' =>'',
                            'type' => 'select',
                            'default' => '',
                            'description'=>__('Background Mode', 'themify'),
                            'meta' => array(
                                    array('value' => 'repeat', 'name' => __('Repeat All', 'themify')),
                                    array('value' => 'repeat-x', 'name' => __('Repeat Horizontally', 'themify')),
                                    array('value' => 'repeat-y', 'name' => __('Repeat Vertically', 'themify')),
                                    array('value' => 'repeat-none', 'name' => __('Do not repeat', 'themify')),
                                    array('value' => 'fullcover', 'name' => __('Fullcover', 'themify')),
                                    array('value' => 'best-fit-image', 'name' => __('Best Fit', 'themify')),
                                    array('value' => 'builder-parallax-scrolling', 'name' => __('Parallax Scrolling', 'themify'))
                            ),
                            'wrap_with_class' => 'tf-group-element tf-group-element-image responsive-na',
                    ),
                    // Background Zoom
                    array(
                            'id' => 'background_zoom',
                            'label' => '',
                            'type' => 'checkbox',
                            'default' => '',
                            'options' => array(
                                    array('value' => __('Zoom background image on hover', 'themify'), 'name' => 'zoom')
                            ),
                            'wrap_with_class' => 'tf-group-element tf-group-element-image responsive-na',
                    ),
                    // Background position
                    array(
                            'id' => 'background_position',
                            'label' => '',
                            'type' => 'select',
                            'default' => '',
                            'description'=>__('Background Position', 'themify'),
                            'meta' => array(
                                    array('value' => 'left-top', 'name' => __('Left Top', 'themify')),
                                    array('value' => 'left-center', 'name' => __('Left Center', 'themify')),
                                    array('value' => 'left-bottom', 'name' => __('Left Bottom', 'themify')),
                                    array('value' => 'right-top', 'name' => __('Right top', 'themify')),
                                    array('value' => 'right-center', 'name' => __('Right Center', 'themify')),
                                    array('value' => 'right-bottom', 'name' => __('Right Bottom', 'themify')),
                                    array('value' => 'center-top', 'name' => __('Center Top', 'themify')),
                                    array('value' => 'center-center', 'name' => __('Center Center', 'themify')),
                                    array('value' => 'center-bottom', 'name' => __('Center Bottom', 'themify'))
                            ),
                            'wrap_with_class' => 'tf-group-element tf-group-element-image responsive-na',
                    ),
                    // Background Color
                    array(
                            'id' => 'background_color',
                            'type' => 'color',
                            'label' => __('Background Color', 'themify'),
                            'class' => 'small',
                            'wrap_with_class' => 'tf-group-element tf-group-element-image tf-group-element-video tf-group-element-slider',
                    ),
                    // Overlay Color
                    array(
                            'id' => 'separator_cover',
                            'title' => '',
                            'description' => '',
                            'type' => 'separator',
                            'meta' => array('html' => '<h4 class="responsive-na">' . __('Row Overlay', 'themify') . '</h4>'),
                    ),
                    array(
                            'id' => 'cover_color-type',
                            'label' =>__('Overlay','themify'),
                            'type' => 'radio',
                            'meta' => array(
                                    array('value' => 'color', 'name' => __('Color', 'themify')),
                                    array('value' => 'cover_gradient', 'name' => __('Gradient', 'themify'))
                            ),
                            'default'=>'color',
                            'option_js' => true,
                            'wrap_with_class' => 'responsive-na tf-overlay-element'.(!$is_premium?' themify_builder_lite':'')
                    ),
                    array(
                            'id' => 'cover_color',
                            'type' => 'color',
                            'label' =>'',
                            'class' => 'small',
                            'wrap_with_class' => 'responsive-na tf-group-element tf-group-element-color'.(!$is_premium?' themify_builder_lite':'')
                    ),
                    array(
                            'id' => 'cover_gradient',
                            'type' => 'gradient',
                            'label' =>'',
                            'wrap_with_class' => 'responsive-na tf-group-element tf-group-element-cover_gradient'.(!$is_premium?' themify_builder_lite':'')
                    ),
                    array(
                            'id' => 'cover_color_hover-type',
                            'label' =>__('Overlay Hover', 'themify'),
                            'type' => 'radio',
                            'meta' => array(
                                    array('value' => 'hover_color', 'name' => __('Color', 'themify')),
                                    array('value' => 'hover_gradient', 'name' => __('Gradient', 'themify'))
                            ),
                            'default'=>'hover_color',
                            'option_js' => true,
                            'wrap_with_class' => 'responsive-na tf-overlay-element'.(!$is_premium?' themify_builder_lite':'')
                    ),
                    array(
                            'id' => 'cover_color_hover',
                            'type' => 'color',
                            'label' => '',
                            'class' => 'small',
                            'wrap_with_class' => 'responsive-na tf-group-element tf-group-element-hover_color'.(!$is_premium?' themify_builder_lite':'')
                    ),
                    array(
                            'id' => 'cover_gradient_hover',
                            'type' => 'gradient',
                            'label' =>'',
                            'wrap_with_class' => 'responsive-na tf-group-element tf-group-element-hover_gradient'.(!$is_premium?' themify_builder_lite':'')
                    ),
                    array(
                            'type' => 'separator',
                            'meta' => array('html' => '<hr />')
                    ),
            );
            $props = array_reverse($props);
            foreach($props as $p){
                array_unshift($fields, $p);
            }
            
            return $fields;
        }
        
        public function row_animation($settings){
            $row_fields_animation = apply_filters('themify_builder_row_fields_animation', array(
                    array(
                            'type' => 'separator',
                            'meta' => array( 'html' => '<h4>' . esc_html__( 'Appearance Animation', 'themify' ) . '</h4>')
                    ),
                    // Animation
                    array(
                            'id' => 'multi_Animation Effect',
                            'type' => 'multi',
                            'label' => __('Effect', 'themify'),
                            'fields' => array(
                                    array(
                                            'id' => 'animation_effect',
                                            'type' => 'animation_select',
                                            'label' => __('Effect', 'themify')
                                    ),
                                    array(
                                            'id' => 'animation_effect_delay',
                                            'type' => 'text',
                                            'label' => __('Delay', 'themify'),
                                            'class' => 'xsmall',
                                            'description' => __('Delay (s)', 'themify'),
                                    ),
                                    array(
                                            'id' => 'animation_effect_repeat',
                                            'type' => 'text',
                                            'label' => __('Repeat', 'themify'),
                                            'class' => 'xsmall',
                                            'description' => __('Repeat (x)', 'themify'),
                                    ),
                            ),
                            'wrap_with_class' => !Themify_Builder_Model::is_premium()?'themify_builder_lite':''
                    )
            ));
            $settings['animation'] = array(
                    'name' => esc_html__( 'Animation', 'themify' ),
                    'options' => $row_fields_animation
            );
            return $settings;
        }
        
        public function column_styling_fields($fields){
            $is_premium = Themify_Builder_Model::is_premium();
            // Image size
            $image_size = themify_get_image_sizes_list( true );
            unset( $image_size[ key( $image_size ) ] );

            $props = array(
                // Background
                array(
                        'id' => 'separator_image_background',
                        'title' => '',
                        'description' => '',
                        'type' => 'separator',
                        'meta' => array('html' => '<h4>' . __('Background', 'themify') . '</h4>'),
                ),
                array(
                        'id' => 'background_type',
                        'label' => __('Background Type', 'themify'),
                        'type' => 'radio',
                        'meta' => array(
                                array('value' => 'image', 'name' => __('Image', 'themify')),
                                array('value' => 'gradient', 'name' => __('Gradient', 'themify'),'disable'=>!$is_premium),
                                array('value' => 'video', 'name' => __('Video', 'themify'),'disable'=>!$is_premium),
                                array('value' => 'slider', 'name' => __('Slider', 'themify'),'disable'=>!$is_premium),
                        ),
                        'option_js' => true,
                        'wrap_with_class' => 'responsive-na'.(!$is_premium?' themify_builder_lite hide_opacity':'')
                ),
                // Background Slider
                array(
                        'id' => 'background_slider',
                        'type' => 'textarea',
                        'label' => __('Background Slider', 'themify'),
                        'class' => 'tf-hide tf-shortcode-input',
                        'wrap_with_class' => 'tf-group-element tf-group-element-slider responsive-na',
                        'description' => sprintf('<a href="#" class="builder_button tf-gallery-btn">%s</a>', __('Insert Gallery', 'themify'))
                ),
                // Background Slider Image Size
                array(
                        'id' => 'background_slider_size',
                        'label' => __('Image Size', 'themify'),
                        'type' => 'select',
                        'default' => '',
                        'meta' => $image_size,
                        'wrap_with_class' => 'tf-group-element tf-group-element-slider responsive-na',
                ),
                // Background Slider Mode
                array(
                        'id' => 'background_slider_mode',
                        'label' => __('Background Slider Mode', 'themify'),
                        'type' => 'select',
                        'default' => '',
                        'meta' => array(
                                array('value' => 'best-fit', 'name' => __('Best Fit', 'themify')),
                                array('value' => 'fullcover', 'name' => __('Fullcover', 'themify')),
                        ),
                        'wrap_with_class' => 'tf-group-element tf-group-element-slider responsive-na',
                ),
                // Video Background
                array(
                        'id' => 'background_video',
                        'type' => 'video',
                        'label' => __('Background Video', 'themify'),
                        'description' => __('Video format: mp4. Note: video background does not play on mobile, background image will be used as fallback.', 'themify'),
                        'class' => 'xlarge',
                        'wrap_with_class' => 'tf-group-element tf-group-element-video responsive-na'
                ),
                array(
                        'id' => 'background_video_options',
                        'type' => 'checkbox',
                        'label' => '',
                        'default' => array(),
                        'options' => array(
                                array('name' => 'unloop', 'value' => __('Disable looping', 'themify')),
                                array('name' => 'mute', 'value' => __('Disable audio', 'themify')),
                        ),
                        'wrap_with_class' => 'tf-group-element tf-group-element-video responsive-na',
                ),
                // Background Image
                array(
                        'id' => 'background_image',
                        'type' => 'image',
                        'label' => __('Background Image', 'themify'),
                        'class' => 'xlarge',
                        'wrap_with_class' => 'tf-group-element tf-group-element-image tf-group-element-video',
                ),
                array(
                        'id' => 'background_gradient',
                        'type' => 'gradient',
                        'label' => __('Background Gradient', 'themify'),
                        'class' => 'xlarge',
                        'wrap_with_class' => 'tf-group-element tf-group-element-gradient'
                ),
                // Background repeat
                array(
                        'id' => 'background_repeat',
                        'label' => '',
                        'type' => 'select',
                        'default' => '',
                        'description'=>__('Background Mode', 'themify'),
                        'meta' => array(
                                array('value' => 'repeat', 'name' => __('Repeat All', 'themify')),
                                array('value' => 'repeat-x', 'name' => __('Repeat Horizontally', 'themify')),
                                array('value' => 'repeat-y', 'name' => __('Repeat Vertically', 'themify')),
                                array('value' => 'repeat-none', 'name' => __('Do not repeat', 'themify')),
                                array('value' => 'fullcover', 'name' => __('Fullcover', 'themify')),
                                array('value' => 'builder-parallax-scrolling', 'name' => __('Parallax Scrolling', 'themify'))
                        ),
                        'wrap_with_class' => 'tf-group-element tf-group-element-image responsive-na',
                ),
                // Background Zoom
                array(
                        'id' => 'background_zoom',
                        'label' => '',
                        'type' => 'checkbox',
                        'default' => '',
                        'options' => array(
                                array('value' => __('Zoom background image on hover', 'themify'), 'name' => 'zoom')
                        ),
                        'wrap_with_class' => 'tf-group-element tf-group-element-image responsive-na',
                ),
                // Background position
                array(
                        'id' => 'background_position',
                        'label' => '',
                        'type' => 'select',
                        'default' => '',
                         'description'=>__('Background Position', 'themify'),
                        'meta' => array(
                                array('value' => 'left-top', 'name' => __('Left Top', 'themify')),
                                array('value' => 'left-center', 'name' => __('Left Center', 'themify')),
                                array('value' => 'left-bottom', 'name' => __('Left Bottom', 'themify')),
                                array('value' => 'right-top', 'name' => __('Right top', 'themify')),
                                array('value' => 'right-center', 'name' => __('Right Center', 'themify')),
                                array('value' => 'right-bottom', 'name' => __('Right Bottom', 'themify')),
                                array('value' => 'center-top', 'name' => __('Center Top', 'themify')),
                                array('value' => 'center-center', 'name' => __('Center Center', 'themify')),
                                array('value' => 'center-bottom', 'name' => __('Center Bottom', 'themify'))
                        ),
                        'wrap_with_class' => 'tf-group-element tf-group-element-image responsive-na',
                ),
                // Background Color
                array(
                        'id' => 'background_color',
                        'type' => 'color',
                        'label' => __('Background Color', 'themify'),
                        'class' => 'small',
                        'wrap_with_class' => 'tf-group-element tf-group-element-image tf-group-element-slider tf-group-element-video',
                ),
                // Overlay Color
                array(
                        'id' => 'separator_cover',
                        'title' => '',
                        'description' => '',
                        'type' => 'separator',
                        'meta' => array('html' => '<h4 class="responsive-na">' . __('Column Overlay', 'themify') . '</h4>'),
                ),
                array(
                        'id' => 'cover_color-type',
                        'label' => __('Overlay', 'themify'),
                        'type' => 'radio',
                        'meta' => array(
                                array('value' => 'color', 'name' => __('Color', 'themify')),
                                array('value' => 'cover_gradient', 'name' => __('Gradient', 'themify'))
                        ),
                        'default'=>'color',
                        'option_js' => true,
                        'wrap_with_class' => 'responsive-na tf-overlay-element'.(!$is_premium?' themify_builder_lite':'')
                ),
                array(
                        'id' => 'cover_color',
                        'type' => 'color',
                        'label' => '',
                        'class' => 'small',
                        'wrap_with_class' => 'responsive-na tf-group-element tf-group-element-color'.(!$is_premium?' themify_builder_lite':'')
                ),
                array(
                        'id' => 'cover_gradient',
                        'type' => 'gradient',
                        'label' =>'',
                        'wrap_with_class' => 'responsive-na tf-group-element tf-group-element-cover_gradient'.(!$is_premium?' themify_builder_lite':'')
                ),
                array(
                        'id' => 'cover_color_hover-type',
                        'label' => __('Overlay Hover', 'themify'),
                        'type' => 'radio',
                        'meta' => array(
                                array('value' => 'hover_color', 'name' => __('Color', 'themify')),
                                array('value' => 'hover_gradient', 'name' => __('Gradient', 'themify'))
                        ),
                        'default'=>'hover_color',
                        'option_js' => true,
                        'wrap_with_class' => 'responsive-na tf-overlay-element'.(!$is_premium?' themify_builder_lite':'')
                ),
                array(
                        'id' => 'cover_color_hover',
                        'type' => 'color',
                        'label' => '',
                        'class' => 'small',
                        'wrap_with_class' => 'responsive-na tf-group-element tf-group-element-hover_color'.(!$is_premium?' themify_builder_lite':'')
                ),
                array(
                        'id' => 'cover_gradient_hover',
                        'type' => 'gradient',
                        'label' =>'',
                        'wrap_with_class' => 'responsive-na tf-group-element tf-group-element-hover_gradient'.(!$is_premium?' themify_builder_lite':'')
                ),
                array(
                        'type' => 'separator',
                        'meta' => array('html' => '<hr />')
                ),
            );
            $props = array_reverse($props);
            foreach($props as $p){
                array_unshift($fields, $p);
            }
            
            return $fields;
        }
        
        public function admin_bar_menu($menu){
            $is_premium = Themify_Builder_Model::is_premium();
            $layouts = array( 
                        array(
                                'id' => 'layout_themify_builder',
                                'parent' => 'themify_builder',
                                'title' => __('Layouts', 'themify'),
                                'href' => '#',
                                'meta' => array('class' => !$is_premium?'themify_builder_lite':'')
                        ),
                        // Sub Menu
                        array(
                                'id' => 'load_layout_themify_builder',
                                'parent' => 'layout_themify_builder',
                                'title' => __('Load Layout', 'themify'),
                                'href' => '#',
                                'meta' => array('class' => !$is_premium?'themify_builder_load_layout themify_builder_lite':'themify_builder_load_layout')
                        ),
                        array(
                                'id' => 'save_layout_themify_builder',
                                'parent' => 'layout_themify_builder',
                                'title' => __('Save as Layout', 'themify'),
                                'href' => '#',
                                'meta' => array('class' => !$is_premium?'themify_builder_save_layout themify_builder_lite':'themify_builder_save_layout')
                        ),
                );
            
            return array_merge($menu, $layouts);
        }
        
        
	/**
	 * Load list of available Templates
	 * 
	 * @access public
	 */
	public function load_layout_ajaxify() {
		global $post;

		check_ajax_referer( 'tfb_load_nonce', 'nonce' );

		$layouts = array(
			'core' => array(),
			'parallax' => array(),
			'custom' => array(),
			'theme' => array(),
		);

		// user-created layouts
		$posts = new WP_Query( array(
			'post_type' => $this->layout->post_type_name,
			'posts_per_page' => -1,
			'orderby' => 'title',
			'order' => 'ASC',
		));
		if( $posts->have_posts() ) : while( $posts->have_posts() ) : $posts->the_post();
			$layouts['custom'][] = array(
				'title' => get_the_title(),
				'slug' => $post->post_name,
				'thumbnail' => has_post_thumbnail() ? get_the_post_thumbnail(null, 'thumbnail', array( 150, 150 ) ) : sprintf( '<img src="%s">', 'http://placehold.it/150x150' ),
			);
		endwhile; endif;
		wp_reset_postdata();

		// builtin layouts
		$data = include( THEMIFY_BUILDER_INCLUDES_DIR . '/data/layouts.php' );
		if( ! empty ( $data ) ) {
			foreach( $data as $layout ) {
				$group = isset( $layout['group'] ) ? $layout['group'] : 'core';
				$layouts[$group][] = array(
					'title' => $layout['title'],
					'slug' => $layout['data'],
					'thumbnail' => sprintf( '<img src="%s">', sprintf( $layout['thumb'], THEMIFY_BUILDER_URI . '/includes/data' ) ),
				);
			}
		}

		if( is_file( get_template_directory() . '/builder-layouts/layouts.php' ) ) {
			$theme_layouts = include( get_template_directory() . '/builder-layouts/layouts.php' );
			foreach( $theme_layouts as $layout ) {
				$group = isset( $layout['group'] ) ? $layout['group'] : 'theme';
				$layouts[$group][] = array(
					'title' => $layout['title'],
					'slug' => $layout['data'],
					'thumbnail' => sprintf( '<img src="%s">', sprintf( $layout['thumb'], get_template_directory_uri() . '/builder-layouts' ) ),
				);
			}
		}

		include_once THEMIFY_BUILDER_INCLUDES_DIR . '/themify-builder-layout-lists.php';
		die();
	}
        
        

	/**
	 * Set template to current active builder.
	 * 
	 * @access public
	 */
	public function set_layout_ajaxify() {
		global $ThemifyBuilder;
		check_ajax_referer( 'tfb_load_nonce', 'nonce' );
		$template_slug = $_POST['layout_slug'];
		$current_builder_id = (int) $_POST['current_builder_id'];
		$layout_group = $_POST['layout_group'];
		$builder_data = '';
		$response = array();

		if( $layout_group == 'core' || $layout_group == 'theme' ) {
			if( $layout_group == 'core' ) {
				$file = THEMIFY_BUILDER_INCLUDES_DIR . '/data/' . $template_slug;
			} elseif( $layout_group == 'theme' ) {
				$file = get_template_directory() . '/builder-layouts/' . $template_slug;
			}
			if( is_file( $file ) ) {
				$cache_dir = themify_get_cache_dir();
				$extract_file = $cache_dir['path'] . basename( $template_slug );
				WP_Filesystem();
				$extract_action = unzip_file( $file, $extract_file );
				/* extract the file */
				if( is_wp_error( $extract_action ) ) {
					$response['msg'] = $extract_action->get_error_message();
				} else {
					$extract_file = $cache_dir['path'] . basename( $template_slug ) . '/builder_data_export.txt';
					/* use include to read the file, seems safer than wp_filesystem */
					ob_start();
					include $extract_file;
					$builder_data = ob_get_clean();
				}
			} else {
				$response['msg'] = __( 'Layout does not exist.', 'themify' );
			}
		} else {
			$args = array(
				'name' => $template_slug,
				'post_type' => $this->layout->post_type_name,
				'post_status' => 'publish',
				'numberposts' => 1
			);
			$template = get_posts( $args );
			if ( $template ) {
				$builder_data = $ThemifyBuilder->get_builder_data( $template[0]->ID );
				$builder_data = json_encode( $builder_data );
			} else {
				$response['msg'] = __('Requested layout not found.', 'themify');
			}
		}

		if ( ! empty( $builder_data ) ) {
			$GLOBALS['ThemifyBuilder_Data_Manager']->save_data( $builder_data, $current_builder_id );
			$response['status'] = 'success';
			$response['msg'] = '';
		} else {
			$response['status'] = 'failed';
			if( ! isset( $response['msg'] ) ) {
				$response['msg'] = __('Something went wrong', 'themify');
			}
		}

		wp_send_json( $response );
		die();
	}

	/**
	 * Append template to current active builder.
	 * 
	 * @access public
	 */
	public function append_layout_ajaxify() {
		global $ThemifyBuilder;
		check_ajax_referer( 'tfb_load_nonce', 'nonce' );
		$template_slug = $_POST['layout_slug'];
		$current_builder_id = (int) $_POST['current_builder_id'];
		$layout_group = $_POST['layout_group'];
		$builder_data = '';
		$response = array();

		if( $layout_group == 'core' || $layout_group == 'theme' ) {
			if( $layout_group == 'core' ) {
				$file = THEMIFY_BUILDER_INCLUDES_DIR . '/data/' . $template_slug;
			} elseif( $layout_group == 'theme' ) {
				$file = get_template_directory() . '/builder-layouts/' . $template_slug;
			}
			if( is_file( $file ) ) {
				$cache_dir = themify_get_cache_dir();
				$extract_file = $cache_dir['path'] . basename( $template_slug );
				WP_Filesystem();
				$extract_action = unzip_file( $file, $extract_file );
				/* extract the file */
				if( is_wp_error( $extract_action ) ) {
					$response['msg'] = $extract_action->get_error_message();
				} else {
					$extract_file = $cache_dir['path'] . basename( $template_slug ) . '/builder_data_export.txt';
					/* use include to read the file, seems safer than wp_filesystem */
					ob_start();
					include $extract_file;
					$builder_data = ob_get_clean();
				}
			} else {
				$response['msg'] = __( 'Layout does not exist.', 'themify' );
			}
		} else {
			$args = array(
				'name' => $template_slug,
				'post_type' => $this->layout->post_type_name,
				'post_status' => 'publish',
				'numberposts' => 1
			);
			$template = get_posts( $args );
			if ( $template ) {
				$builder_data = $ThemifyBuilder->get_builder_data( $template[0]->ID );
			} else {
				$response['msg'] = __('Requested layout not found.', 'themify');
			}
		}

		if ( ! empty( $builder_data ) ) {
			$oldPostData = $GLOBALS['ThemifyBuilder_Data_Manager']->get_data( $current_builder_id );
			$newBuilderData = $oldPostData;
			$count = count( $newBuilderData );
			$json_data = json_decode($builder_data,true);
			if($json_data){
				$builder_data = stripslashes_deep($json_data);
			}
			foreach ($builder_data as $data ) {
				$data['row_order'] = $count;
				$newBuilderData[] = $data;
				$count++;
			}
			$builder_data = json_encode( $newBuilderData );
			$GLOBALS['ThemifyBuilder_Data_Manager']->save_data( $builder_data, $current_builder_id );
			$response['status'] = 'success';
			$response['msg'] = '';
		} else {
			$response['status'] = 'failed';
			if( ! isset( $response['msg'] ) ) {
				$response['msg'] = __('Something went wrong', 'themify');
			}
		}

		wp_send_json( $response );
		die();
	}
        
        
	/**
	 * Write CSS transition selectors for manipulation inside theme.
	 *
	 * @since 2.3.2
	 */
	function write_transition_selectors() {
		?>
		<script type="text/javascript">
			if ('object' === typeof tbLocalScript) {
				tbLocalScript.transitionSelectors = <?php echo json_encode($this->transition_selectors); ?>;
			}
		</script>
		<?php
	}
        
        public  function animation_fields($animation,$module){
            foreach($animation as &$an){
                $an['wrap_with_class'] = 'themify_builder_lite';
            }
            return $animation;
        }
    }