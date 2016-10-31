<?php
/**
 * Team Meta Box Options
 * @param array $args
 * @return array
 * @since 1.0.7
 */
function themify_theme_team_meta_box( $args = array() ) {
	extract( $args );
	return array(
		// Content Width
		array(
			'name'=> 'content_width',
			'title' => __('Content Width', 'themify'),
			'description' => '',
			'type' => 'layout',
			'show_title' => true,
			'meta' => array(
				array(
					'value' => 'default_width',
					'img' => 'themify/img/default.png',
					'selected' => true,
					'title' => __( 'Default', 'themify' )
				),
				array(
					'value' => 'full_width',
					'img' => 'themify/img/fullwidth.png',
					'title' => __( 'Fullwidth', 'themify' )
				)
			)
		),
		// Feature Image
		array(
			'name' 		=> 'post_image',
			'title' 		=> __('Featured Image', 'themify'),
			'description' => '',
			'type' 		=> 'image',
			'meta'		=> array()
		),
		// Featured Image Size
		array(
			'name'	=>	'feature_size',
			'title'	=>	__('Image Size', 'themify'),
			'description' => sprintf(__('Image sizes can be set at <a href="%s">Media Settings</a> and <a href="%s" target="_blank">Regenerated</a>', 'themify'), 'options-media.php', 'https://wordpress.org/plugins/regenerate-thumbnails/'),
			'type'		 =>	'featimgdropdown',
			'display_callback' => 'themify_is_image_script_disabled'
		),
		// Multi field: Image Dimension
		themify_image_dimensions_field(),
		// Team Title
		array(
			'name' 		=> 'team_title',
			'title' 	=> __('Team Member Position', 'themify'),
			'description' => '',
			'type' 		=> 'textbox',
			'meta'		=> array()
		),
		// Skills
		array(
			'name' 		=> 'skills',
			'title' 	=> __('Skill Set', 'themify'),
			'description' => '',
			'type' 		=> 'textarea'
		),
		// Social links
		array(
			'name' 		=> 'social',
			'title' 	=> __('Social Links', 'themify'),
			'description' => '',
			'type' 		=> 'textarea'
		),
	);
}

/**************************************************************************************************
 * Team Class - Shortcode
 **************************************************************************************************/

if ( ! class_exists( 'Themify_Team' ) ) {

	class Themify_Team {

		var $instance = 0;
		var $atts = array();
		var $post_type = 'team';
		var $tax = 'team-category';
		var $taxonomies;

		function __construct( $args = array() ) {
			$this->atts = array(
				'id' => '',
				'title' => 'yes', // no
				'image' => 'yes', // no
				'unlink_title' => '',
				'unlink_image' => '',
				'image_w' => 144,
				'image_h' => 144,
				'display' => 'content', // excerpt, none
				'more_link' => false, // true goes to post type archive, and admits custom link
				'more_text' => __('More &rarr;', 'themify'),
				'limit' => 4,
				'category' => 'all', // integer category ID
				'order' => 'DESC', // ASC
				'orderby' => 'date', // title, rand
				'style' => 'list-post', // grid4, grid3, grid2
				'section_link' => false, // true goes to post type archive, and admits custom link
				'use_original_dimensions' => 'no' // yes
			);
			$this->register();
			add_shortcode( $this->post_type, array( $this, 'init_shortcode' ) );
			add_shortcode( 'themify_'.$this->post_type.'_posts', array( $this, 'init_shortcode' ) );
			add_action( 'admin_init', array( $this, 'manage_and_filter' ) );
			add_shortcode('progress_bar', array($this, 'progress_bar'));
			add_shortcode('themify_progress_bar', array($this, 'progress_bar'));
			add_shortcode($this->post_type . '-social', array($this, 'social'));
			add_shortcode( 'themify_'.$this->post_type.'-social', array( $this, 'init_shortcode' ) );
			add_action( 'save_post', array($this, 'set_default_term'), 100, 2 );
			add_filter( 'themify_post_types', array($this, 'extend_post_types' ) );
		}

		/**
		 * Register post type and taxonomy
		 */
		function register() {
			$cpt = array(
				'plural' => __('Teams', 'themify'),
				'singular' => __('Team', 'themify'),
				'rewrite' => themify_check('themify_team_slug')? themify_get('themify_team_slug') : apply_filters('themify_team_rewrite', 'team')
			);
			register_post_type( $this->post_type, array(
				'labels' => array(
					'name' => $cpt['plural'],
					'singular_name' => $cpt['singular']
				),
				'supports' => isset( $cpt['supports'] )? $cpt['supports'] : array( 'title', 'editor', 'thumbnail', 'custom-fields', 'excerpt' ),

				'hierarchical' => false,
				'public' => true,
				'rewrite' => array( 'slug' => $cpt['rewrite'] ),
				'query_var' => true,
				'can_export' => true,
				'capability_type' => 'post'
			));
			register_taxonomy( $this->tax, array( $this->post_type ), array(
				'labels' => array(
					'name' => sprintf( __( '%s Categories', 'themify' ), $cpt['singular'] ),
					'singular_name' => sprintf( __( '%s Category', 'themify' ), $cpt['singular'] )
				),
				'public' => true,
				'show_in_nav_menus' => true,
				'show_ui' => true,
				'show_tagcloud' => true,
				'hierarchical' => true,
				'rewrite' => true,
				'query_var' => true
			));
			if ( is_admin() ) {
				add_filter('manage_edit-'.$this->tax.'_columns', array(&$this, 'taxonomy_header'), 10, 2);
				add_filter('manage_'.$this->tax.'_custom_column', array(&$this, 'taxonomy_column_id'), 10, 3);
			}
		}

		/**
		 * Set default term for custom taxonomy and assign to post
		 * @param number
		 * @param object
		 */
		function set_default_term( $post_id, $post ) {
			if ( 'publish' === $post->post_status ) {
				$terms = wp_get_post_terms( $post_id, $this->tax );
				if ( empty( $terms ) ) {
					wp_set_object_terms( $post_id, __( 'Uncategorized', 'themify' ), $this->tax );
				}
			}
		}

		/**
		 * Display an additional column in categories list
		 * @since 1.0.0
		 */
		function taxonomy_header($cat_columns) {
			$cat_columns['cat_id'] = 'ID';
			return $cat_columns;
		}
		/**
		 * Display ID in additional column in categories list
		 * @since 1.0.0
		 */
		function taxonomy_column_id($null, $column, $termid) {
			return $termid;
		}

		/**
		 * Includes new post types registered in theme to array of post types managed by Themify
		 * @param array
		 * @return array
		 */
		function extend_post_types( $types ) {
			return array_merge( $types, array( $this->post_type ) );
		}

		/**
		 * Add shortcode to WP
		 * @param $atts Array shortcode attributes
		 * @return String
		 * @since 1.0.0
		 */
		function init_shortcode( $atts ) {
			$this->instance++;
			return do_shortcode( $this->shortcode( shortcode_atts( $this->atts, $atts ), $this->post_type ) );
		}

		/**
		 * Trigger at the end of __construct of this shortcode
		 */
		function manage_and_filter() {
			add_filter( "manage_edit-{$this->post_type}_columns", array( $this, 'type_column_header' ), 10, 2 );
			add_action( "manage_{$this->post_type}_posts_custom_column", array( $this, 'type_column' ), 10, 3 );
			add_action( 'load-edit.php', array( $this, 'filter_load' ) );
			add_filter( 'post_row_actions', array( $this, 'remove_quick_edit' ), 10, 1 );
		}

		/**
		 * Remove quick edit action from entries list in admin
		 * @param $actions
		 * @return mixed
		 */
		function remove_quick_edit( $actions ) {
			global $post;
			if( $post->post_type == $this->post_type )
				unset($actions['inline hide-if-no-js']);
			return $actions;
		}

		/**
		 * Display an additional column in list
		 * @param array
		 * @return array
		 */
		function type_column_header( $columns ) {
			unset( $columns['date'] );
			$columns['icon'] = __('Icon', 'themify');
			return $columns;
		}

		/**
		 * Display shortcode, type, size and color in columns in tiles list
		 * @param string $column key
		 * @param number $post_id
		 * @return string
		 */
		function type_column( $column, $post_id ) {
			switch( $column ) {
				case 'shortcode' :
					echo '<code>[' . $this->post_type . ' id="' . $post_id . '"]</code>';
					break;

				case 'icon' :
					the_post_thumbnail( array( 50, 50 ) );
					break;
			}
		}

		/**
		 * Filter request to sort
		 */
		function filter_load() {
			global $typenow;
			if ( $typenow == $this->post_type ) {
				add_action( current_filter(), array( $this, 'setup_vars' ), 20 );
				add_action( 'restrict_manage_posts', array( $this, 'get_select' ) );
				add_filter( "manage_taxonomies_for_{$this->post_type}_columns", array( $this, 'add_columns' ) );
			}
		}

		/**
		 * Add columns when filtering posts in edit.php
		 */
		public function add_columns( $taxonomies ) {
			return array_merge( $taxonomies, $this->taxonomies );
		}

		/**
		 * Parses the arguments given as category to see if they are category IDs or slugs and returns a proper tax_query
		 * @param $category
		 * @param $post_type
		 * @return array
		 */
		function parse_category_args( $category, $post_type ) {
			if ( 'all' != $category ) {
				$tax_query_terms = explode(',', $category);
				if ( preg_match( '#[a-z]#', $category ) ) {
					return array( array( 'taxonomy' => $post_type . '-category', 'field' => 'slug', 'terms' => $tax_query_terms ) );
				} else {
					return array( array( 'taxonomy' => $post_type . '-category', 'field' => 'id', 'terms' => $tax_query_terms ) );
				}
			}
		}

		/**
		 * Select form element to filter the post list
		 * @return string HTML
		 */
		public function get_select() {
			$html = '';
			foreach ($this->taxonomies as $tax) {
				$options = sprintf('<option value="">%s %s</option>', __('View All', 'themify'),
				get_taxonomy($tax)->label);
				$class = is_taxonomy_hierarchical($tax) ? ' class="level-0"' : '';
				foreach (get_terms( $tax ) as $taxon) {
					$options .= sprintf('<option %s%s value="%s">%s%s</option>', isset($_GET[$tax]) ? selected($taxon->slug, $_GET[$tax], false) : '', '0' !== $taxon->parent ? ' class="level-1"' : $class, $taxon->slug, '0' !== $taxon->parent ? str_repeat('&nbsp;', 3) : '', "{$taxon->name} ({$taxon->count})");
				}
				$html .= sprintf('<select name="%s" id="%s" class="postform">%s</select>', $tax, $tax, $options);
			}
			return print $html;
		}

		/**
		 * Setup vars when filtering posts in edit.php
		 */
		function setup_vars() {
			$this->post_type =  get_current_screen()->post_type;
			$this->taxonomies = array_diff(get_object_taxonomies($this->post_type), get_taxonomies(array('show_admin_column' => 'false')));
		}

		/**
		 * Returns link wrapped in paragraph either to the post type archive page or a custom location
		 * @param bool|string $more_link False does nothing, true goes to archive page, custom string sets custom location
		 * @param string $more_text
		 * @param string $post_type
		 * @return string
		 */
		function section_link( $more_link = false, $more_text, $post_type ) {
			if ( $more_link ) {
				if ( 'true' == $more_link ) {
					$more_link = get_post_type_archive_link( $post_type );
				}
				return '<p class="more-link-wrap"><a href="' . esc_url( $more_link ) . '" class="more-link">' . $more_text . '</a></p>';
			}
			return '';
		}

		/**
		 * Returns class to add in columns when querying multiple entries
		 * @param string $style Entries layout
		 * @return string $col_class CSS class for column
		 */
		function column_class( $style ) {
			$col_class = '';
			switch ( $style ) {
				case 'grid4':
					$col_class = 'col4-1';
					break;
				case 'grid3':
					$col_class = 'col3-1';
					break;
				case 'grid2':
					$col_class = 'col2-1';
					break;
				default:
					$col_class = '';
					break;
			}
			return $col_class;
		}

		/**
		 * Progress bar shortcode rendering
		 * @param array $atts
		 * @return string
		 */
		function progress_bar( $atts = array() ) {
			extract( shortcode_atts( array(
				'label' => '',
				'color' => '#02daaf',
				'percentage' => '100'
				), $atts ) );
			$percentage .= strrpos($percentage, '%') === false ? '%' : '';
			return sprintf(
				'<div class="progress-bar"><span class="progress-bar-bg" data-percent="%s" style="background-color:%s;width:%s;"></span> <i class="progress-bar-label">%s</i></div>',
				$percentage,
				$color,
				$percentage,
				$label
			);
		}

		/**
		 * Social shortcode rendering
		 * @param array $atts
		 * @return string
		 */
		function social( $atts = array() ) {
			extract( shortcode_atts( array(
				'link' => '',
				'image' => ''
				), $atts ) );

			return sprintf(
				'<a href="%s"><img src="%s" alt="social-link" /></a>',
				$link,
				$image
			);
		}

		/**
		 * Main shortcode rendering
		 * @param array $atts
		 * @param $post_type
		 * @return string|void
		 */
		function shortcode($atts = array(), $post_type){
			extract($atts);
			// Parameters to get posts
			$args = array(
				'post_type' => $post_type,
				'posts_per_page' => $limit,
				'order' => $order,
				'orderby' => $orderby,
				'suppress_filters' => false
			);
			$args['tax_query'] = $this->parse_category_args($category, $post_type);

			// Defines layout type
			$cpt_layout_class = $this->post_type.'-multiple clearfix type-multiple';
			$multiple = true;

			// Single post type or many single post types
			if( '' != $id ){
				if(strpos($id, ',')){
					// Multiple ////////////////////////////////////
					$ids = explode(',', str_replace(' ', '', $id));
					foreach ($ids as $string_id) {
						$int_ids[] = intval($string_id);
					}
					$args['post__in'] = $int_ids;
					$args['orderby'] = 'post__in';
				} else {
					// Single ///////////////////////////////////////
					$args['p'] = intval($id);
					$cpt_layout_class = $this->post_type.'-single';
					$multiple = false;
				}
			}

			// Get posts according to parameters
			$posts = get_posts( apply_filters('themify_'.$post_type.'_shortcode_args', $args) );

			// Collect markup to be returned
			$out = '';

			if( $posts ) {
				global $themify;
				// save a copy
				$themify_save = clone $themify;

				// override $themify object

				// set image link
				$themify->unlink_image =  ( '' == $unlink_image || 'no' == $unlink_image )? 'no' : 'yes';
				$themify->hide_image = 'yes' == $image? 'no' : 'yes';

				// set title link
				$themify->unlink_title =  ( '' == $unlink_title || 'no' == $unlink_title )? 'no' : 'yes';
				$themify->hide_title = 'yes' == $title? 'no' : 'yes';

				$themify->use_original_dimensions = 'yes' == $use_original_dimensions? 'yes': 'no';
				$themify->display_content = $display;
				$themify->more_link = $more_link;
				$themify->more_text = $more_text;
				$themify->post_layout = $style;
				$themify->col_class = $this->column_class($style);

				if ( ! $multiple ) {
					if( '' == $image_w || get_post_meta($args['p'], 'image_width', true ) ){
						$themify->width = get_post_meta($args['p'], 'image_width', true );
					}
					if( '' == $image_h || get_post_meta($args['p'], 'image_height', true ) ){
						$themify->height = get_post_meta($args['p'], 'image_height', true );
					}
				} else {
					$themify->width = $image_w;
					$themify->height = $image_h;
					$themify->skills = get_post_meta(get_the_ID(), 'skills', true );
					$themify->social = get_post_meta(get_the_ID(), 'social', true );
				}

				if ( is_singular( 'team' ) ) {
					$teampre = 'setting-default_team_single_';
					$themify->hide_image = themify_check( $teampre.'hide_image' )? themify_get( $teampre.'hide_image' ) : 'no';
					$themify->hide_title = themify_check( $teampre.'hide_title' )? themify_get( $teampre.'hide_title' ) : 'no';
					$themify->unlink_image = themify_check( $teampre.'unlink_image' )? themify_get( $teampre.'unlink_image' ) : 'no';
					$themify->unlink_title = themify_check( $teampre.'unlink_title' )? themify_get( $teampre.'unlink_title' ) : 'no';
					$themify->width = themify_check( $teampre.'image_post_width' )? themify_get( $teampre.'image_post_width' ) : 144;
					$themify->height = themify_check( $teampre.'image_post_height' )? themify_get( $teampre.'image_post_height' ) : 144;

				}


				$out .= '<div class="loops-wrapper shortcode ' . $post_type  . ' ' . $style . ' '. $cpt_layout_class .'">';
					$out .= themify_get_shortcode_template($posts, 'includes/loop-team', 'index');
					$out .= $this->section_link($more_link, $more_text, $post_type);
				$out .= '</div>';

				$themify = clone $themify_save; // revert to original $themify state
			}
                        wp_reset_postdata();
			return $out;
		}
	}
}

/**************************************************************************************************
 * Initialize Type Class
 **************************************************************************************************/
new Themify_Team();

/**************************************************************************************************
 * Themify Theme Settings Module
 **************************************************************************************************/

if ( ! function_exists( 'themify_default_team_single_layout' ) ) {
	/**
	 * Default Single Team Layout
	 * @param array $data
	 * @return string
	 */
	function themify_default_team_single_layout( $data=array() ) {
		/**
		 * Associative array containing theme settings
		 * @var array
		 */
		$data = themify_get_data();

		/**
		 * Sidebar Layout Options
		 * @var array
		 */
		$sidebar_options = array(
			array(
				'value' => 'sidebar1',
				'img' => 'images/layout-icons/sidebar1.png',
				'title' => __('Sidebar Right', 'themify')
			),
			array(
				'value' => 'sidebar1 sidebar-left',
				'img' => 'images/layout-icons/sidebar1-left.png',
				'title' => __('Sidebar Left', 'themify')
			),
			array(
				'value' => 'sidebar-none',
				'img' => 'images/layout-icons/sidebar-none.png',
				'title' => __('No Sidebar', 'themify'),
				'selected' => true
			)
		);

		/**
		 * Variable prefix key
		 * @var string
		 */
		$prefix = 'setting-default_team_single_';

		/**
		 * Sidebar Layout
		 * @var string
		 */
		$layout = isset( $data[$prefix.'layout'] ) ? $data[$prefix.'layout'] : '';

		/**
		 * Basic default options '', 'yes', 'no'
		 * @var array
		 */
		$default_options = array(
			array('name'=>'','value'=>''),
			array('name'=>__('Yes', 'themify'),'value'=>'yes'),
			array('name'=>__('No', 'themify'),'value'=>'no')
		);

		/**
		 * HTML for settings panel
		 * @var string
		 */
		$output = '';

		/**
		 * Sidebar Layout
		 */
		$output .= '<p>
						<span class="label">' . __('Team Sidebar Option', 'themify') . '</span>';
						foreach($sidebar_options as $option){
							if ( ( '' == $layout || !$layout || ! isset( $layout ) ) && ( isset( $option['selected'] ) && $option['selected'] ) ) {
								$layout = $option['value'];
							}
							if($layout == $option['value']){
								$class = 'selected';
							} else {
								$class = '';
							}
							$output .= '<a href="#" class="preview-icon '.$class.'" title="'.$option['title'].'"><img src="'.THEME_URI.'/'.$option['img'].'" alt="'.$option['value'].'"  /></a>';
						}
						$output .= '<input type="hidden" name="'.$prefix.'layout" class="val" value="'.$layout.'" />';
		$output .= '</p>';

		/**
		 * Hide Team Title
		 */
		$output .= '<p>
						<span class="label">' . __('Hide Team Title', 'themify') . '</span>
						<select name="'.$prefix.'hide_title">' .
							themify_options_module($default_options, $prefix.'hide_title') . '
						</select>
					</p>';

		/**
		 * Unlink Team Title
		 */
		$output .=	'<p>
						<span class="label">' . __('Unlink Team Title', 'themify') . '</span>
						<select name="'.$prefix.'unlink_title">' .
							themify_options_module($default_options, $prefix.'unlink_title') . '
						</select>
					</p>';
		/**
		 * Hide Featured Image
		 */
		$output .= '<p>
						<span class="label">' . __('Hide Featured Image', 'themify') . '</span>
						<select name="'.$prefix.'hide_image">' .
							themify_options_module($default_options, $prefix.'hide_image') . '
						</select>
					</p>';

		/**
		 * Unlink Featured Image
		 */
		$output .= '<p>
						<span class="label">' . __('Unlink Featured Image', 'themify') . '</span>
						<select name="'.$prefix.'unlink_image">' .
							themify_options_module($default_options, $prefix.'unlink_image') . '
						</select>
					</p>';

		/**
		 * Image Dimensions
		 */
		$output .= '
			<p>
				<span class="label">' . __('Image Size', 'themify') . '</span>
				<input type="text" class="width2" name="'.$prefix.'image_post_width" value="'.$data[$prefix.'image_post_width'].'" /> ' . __('width', 'themify') . ' <small>(px)</small>
				<input type="text" class="width2" name="'.$prefix.'image_post_height" value="'.$data[$prefix.'image_post_height'].'" /> ' . __('height', 'themify') . ' <small>(px)</small>
			</p>';

		return $output;
	}
}

if ( ! function_exists( 'themify_team_slug' ) ) {
	/**
	 * Team Slug
	 * @param array $data
	 * @return string
	 */
	function themify_team_slug( $data=array() ) {
		$data = themify_get_data();
		$team_slug = isset($data['themify_team_slug'])? $data['themify_team_slug']: apply_filters('themify_team_rewrite', 'team');
		return '
			<p>
				<span class="label">' . __('Team Base Slug', 'themify') . '</span>
				<input type="text" name="themify_team_slug" value="'.$team_slug.'" class="slug-rewrite">
				<br />
				<span class="pushlabel"><small>' . __('Use only lowercase letters, numbers, underscores and dashes.', 'themify') . '</small></span>
				<br />
				<span class="pushlabel"><small>' . sprintf(__('After changing this, go to <a href="%s">permalinks</a> and click "Save changes" to refresh them.', 'themify'), admin_url('options-permalink.php')) . '</small></span><br />
			</p>';
	}
}

/**************************************************************************************************
 * Body Classes for Portfolio index and single
 **************************************************************************************************/

if ( ! function_exists( 'themify_single_team_layout_condition' ) ) {
	/**
	 * Catches condition to filter body class when it's a singular team view
	 * @param $condition
	 * @return bool
	 */
	function themify_single_team_layout_condition( $condition ) {
		return $condition || is_singular( 'team' );
	}
	add_filter('themify_default_layout_condition', 'themify_single_team_layout_condition', 13);
}
if ( ! function_exists( 'themify_single_team_default_layout' ) ) {
	/**
	 * Filters sidebar layout body class to output the correct one when it's a singular team view
	 * @param $class
	 * @return mixed|string
	 */
	function themify_single_team_default_layout( $class ) {
		if ( is_singular( 'team' ) ) {
			$layout = 'setting-default_team_single_layout';
			$class = themify_check( $layout )? themify_get( $layout ) : 'sidebar1';
		}
		return $class;
	}
	add_filter('themify_default_layout', 'themify_single_team_default_layout', 13);
}