<?php
/**
 * Section Meta Box Options
 * @param array $args
 * @return array
 * @since 1.0.7
 */
function themify_theme_section_meta_box( $args = array() ) {
	extract( $args );
	return array(
		// Separator
		array(
			'name' => 'separator_section_title_font',
			'title' => '',
			'description' => '',
			'type' => 'separator',
			'meta' => array('html'=>'<h4>'.__('Section Title Font', 'themify').'</h4><hr class="meta_fields_separator"/>'),
		),
		// Multi field: Font
		array(
			'type' => 'multi',
			'name' => '_font_title',
			'title' => __('Font', 'themify'),
			'meta' => array(
				'fields' => array(
					// Font size
					array(
						'name' => 'title_font_size',
						'label' => '',
						'description' => '',
						'type' => 'textbox',
						'meta' => array('size'=>'small'),
						'before' => '',
						'after' => ''
					),
					// Font size unit
					array(
						'name' 	=> 'title_font_size_unit',
						'label' => '',
						'type' 	=> 'dropdown',
						'meta'	=> array(
							array('value' => 'px', 'name' => __('px', 'themify'), 'selected' => true),
							array('value' => 'em', 'name' => __('em', 'themify'))
						),
						'before' => '',
						'after' => ''
					),
					// Font family
					array(
						'name' 	=> 'title_font_family',
						'label' => '',
						'type' 	=> 'dropdown',
						'meta'	=> array_merge(  themify_get_web_safe_font_list(), themify_get_google_web_fonts_list() ),
						'before' => '',
						'after' => '',
					),
				),
				'description' => '',
				'before' => '',
				'after' => '',
				'separator' => ''
			)
		),
		// Font Color
		array(
			'name' => 'title_font_color',
			'title' => __('Font Color', 'themify'),
			'description' => '',
			'type' => 'color',
			'meta' => array('default' => null),
		),
		// Separator
		array(
			'name' => 'separator_font',
			'title' => '',
			'description' => '',
			'type' => 'separator',
			'meta' => array('html'=>'<h4>'.__('Section Font', 'themify').'</h4><hr class="meta_fields_separator"/>'),
		),
		// Multi field: Font
		array(
			'type' => 'multi',
			'name' => '_font',
			'title' => __('Font', 'themify'),
			'meta' => array(
				'fields' => array(
					// Font size
					array(
						'name' => 'font_size',
						'label' => '',
						'description' => '',
						'type' => 'textbox',
						'meta' => array('size'=>'small'),
						'before' => '',
						'after' => ''
					),
					// Font size unit
					array(
						'name' 	=> 'font_size_unit',
						'label' => '',
						'type' 	=> 'dropdown',
						'meta'	=> array(
							array('value' => 'px', 'name' => __('px', 'themify'), 'selected' => true),
							array('value' => 'em', 'name' => __('em', 'themify'))
						),
						'before' => '',
						'after' => ''
					),
					// Font family
					array(
						'name' 	=> 'font_family',
						'label' => '',
						'type' 	=> 'dropdown',
						'meta'	=> array_merge(  themify_get_web_safe_font_list(), themify_get_google_web_fonts_list() ),
						'before' => '',
						'after' => '',
					),
				),
				'description' => '',
				'before' => '',
				'after' => '',
				'separator' => ''
			)
		),
		// Font Color
		array(
			'name' => 'font_color',
			'title' => __('Font Color', 'themify'),
			'description' => '',
			'type' => 'color',
			'meta' => array('default'=>null),
		),
		// Link Color
		array(
			'name' => 'link_color',
			'title' => __('Link Color', 'themify'),
			'description' => '',
			'type' => 'color',
			'meta' => array('default'=>null),
		),
		// Separator
		array(
			'name' => 'separator',
			'title' => '',
			'description' => '',
			'type' => 'separator',
			'meta' => array('html'=>'<h4>'.__('Section Background', 'themify').'</h4><hr class="meta_fields_separator"/>'),
		),
		// Background Color
		array(
			'name' => 'background_color',
			'title' => __('Background Color', 'themify'),
			'description' => '',
			'type' => 'color',
			'meta' => array('default'=>null),
		),
		// Backgroud image
		array(
			'name' 	=> 'background_image',
			'title' => '',
			'type' 	=> 'image',
			'description' => '',
			'meta'	=> array(),
			'before' => '',
			'after' => ''
		),
		// Background repeat
		array(
			'name' 		=> 'background_repeat',
			'title'		=> __('Background Repeat', 'themify'),
			'description'	=> '',
			'type' 		=> 'dropdown',
			'meta'		=> array(
				array('value' => 'default', 'name' => '', 'selected' => true),
				array('value' => 'repeat', 'name' => __('Repeat', 'themify')),
				array('value' => 'repeat-x', 'name' => __('Repeat horizontally', 'themify')),
				array('value' => 'repeat-y', 'name' => __('Repeat vertically', 'themify')),
				array('value' => 'no-repeat', 'name' => __('Do not repeat', 'themify'))
			)
		),
		// Multi field: Background Position
		array(
			'type' => 'multi',
			'name' => '_multi_bg_position',
			'title' => __('Background Position', 'themify'),
			'meta' => array(
				'fields' => array(
					// Background horizontal position
					array(
						'name'  => 'background_position_x',
						'label' => '',
						'description' => '',
						'type' 	=> 'dropdown',
						'meta'	=> array(
							array('value' => '',   'name' => '', 'selected' => true),
							array('value' => 'left',   'name' => __('Left', 'themify')),
							array('value' => 'center', 'name' => __('Center', 'themify')),
							array('value' => 'right',  'name' => __('Right', 'themify'))
						),
						'before' => '',
						'after'  => ''
					),
					// Background vertical position
					array(
						'name'  => 'background_position_y',
						'label' => '',
						'description' => '',
						'type' 	=> 'dropdown',
						'meta'	=> array(
							array('value' => '',   'name' => '', 'selected' => true),
							array('value' => 'top',   'name' => __('Top', 'themify')),
							array('value' => 'center', 'name' => __('Center', 'themify')),
							array('value' => 'bottom',  'name' => __('Bottom', 'themify'))
						),
						'before' => '',
						'after'  => ''
					),
				),
				'description' => '',
				'before' => '',
				'after' => '',
				'separator' => ''
			)
		),
	);
}

/**************************************************************************************************
 * Section Class - Shortcode
 **************************************************************************************************/

if ( ! class_exists( 'Themify_Section' ) ) {

	class Themify_Section {

		var $instance = 0;
		var $atts = array();
		var $post_type = 'section';
		var $tax = 'section-category';
		var $taxonomies;

		function __construct( $args = array() ) {
			$this->atts = array(
				'id' => '',
				'category' => 'all'
			);
			$this->register();
			add_shortcode( $this->post_type, array( $this, 'init_shortcode' ) );
			add_shortcode( 'themify_'.$this->post_type.'_posts', array( $this, 'init_shortcode' ) );
			add_action( 'admin_init', array( $this, 'manage_and_filter' ) );
			add_action( 'save_post', array( $this, 'set_default_term'), 100, 2 );
			add_action( 'admin_init', array( $this, 'add_menu_meta_box' ) );
		}

		/**
		 * Register post type and taxonomy
		 */
		function register() {
			$cpt = array(
				'plural' => __('Sections', 'themify'),
				'singular' => __('Section', 'themify'),
				'supports' => array('title', 'editor', 'author', 'custom-fields')
			);
			register_post_type( $this->post_type, array(
				'labels' => array(
					'name' => $cpt['plural'],
					'singular_name' => $cpt['singular']
				),
				'supports' => isset($cpt['supports'])? $cpt['supports'] : array('title', 'editor', 'thumbnail', 'custom-fields', 'excerpt'),
				'hierarchical' => false,
				'public' => true,
				'exclude_from_search' => true,
				'show_in_nav_menus' => false,
				'query_var' => true,
				'can_export' => true,
				'capability_type' => 'post'
			));
			register_taxonomy( $this->tax, array( $this->post_type ), array(
				'labels' => array(
					'name' => sprintf(__( '%s Categories', 'themify' ), $cpt['singular']),
					'singular_name' => sprintf(__( '%s Category', 'themify' ), $cpt['singular'])
				),
				'public' => true,
				'show_in_nav_menus' => false,
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
			add_action( 'load-edit.php', array( $this, 'filter_load' ) );
			add_filter( 'post_row_actions', array( $this, 'remove_quick_edit' ), 10, 1 );
			add_filter( 'get_sample_permalink_html', array($this, 'hide_view_post'), '', 4 );
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
		 * Hides View Section/Team/Highlight/Testimonial/Timeline button in edit screen
		 * @param string $return
		 * @param string $id
		 * @param string $new_title
		 * @param string $new_slug
		 * @return string Markup without the button
		 */
		function hide_view_post($return, $id, $new_title, $new_slug){
			if( get_post_type( $id ) == $this->post_type ) {
				return preg_replace('/<span id=\'view-post-btn\'>.*<\/span>/i', '', $return);
			} else {
				return $return;
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
		 * Main shortcode rendering
		 * @param array $atts
		 * @param $post_type
		 * @return string|void
		 */
		function shortcode($atts = array(), $post_type) {
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

			// Single post type or many single post types
			if( '' != $id ) {
				if(strpos($id, ',')) {
					$ids = explode(',', str_replace(' ', '', $id));
					foreach ($ids as $string_id) {
						$int_ids[] = intval($string_id);
					}
					$args['post__in'] = $int_ids;
					$args['orderby'] = 'post__in';
				} else {
					$args['p'] = intval($id);
					$cpt_layout_class = $this->post_type.'-single';
				}
			}

			// Get posts according to parameters
			$posts = get_posts( apply_filters('themify_'.$post_type.'_shortcode_args', $args) );

			// Collect markup to be returned
			$out = '';

			if ($posts) {
				global $themify;
				$themify_save = clone $themify; // save a copy

				// override $themify object
				$themify->hide_title = $title;
				$themify->display_content = $display;
				$themify->more_link = $more_link;
				$themify->more_text = $more_text;
				$themify->post_layout = $style;

				$out .= '<div class="loops-wrapper shortcode ' . $post_type  . ' ' . $style . ' '. $cpt_layout_class .'">';
					$out .= themify_get_shortcode_template($posts, 'includes/loop-section', 'index');
					$out .= $this->section_link($more_link, $more_text, $post_type);
				$out .= '</div>';

				$themify = clone $themify_save; // revert to original $themify state
			}
                        wp_reset_postdata();
			return $out;
		}

		/**************************************************************************************************
		 * Section meta box for Menus screen
		 **************************************************************************************************/

		/**
 		 * Add section ID to menu. Useful for query section pages pointing to IDs in the page.
		 */
		function add_menu_meta_box() {
			add_meta_box( $this->post_type . '-menu', __( 'Sections', 'themify' ), array( $this, 'meta_box' ), 'nav-menus', 'side', 'high' );
		}

		/**
 		 * Meta box for section post type in menus screen.
		 */
		function meta_box() {
			global $_nav_menu_placeholder, $nav_menu_selected_id;

			$sections = get_posts( array( 'post_type' => 'section', 'posts_per_page' => -1 ) );
			?><div id="posttype-section" class="posttypediv">
				<div id="tabs-panel-posttype-section-most-recent" class="tabs-panel tabs-panel-active">
					<ul id="sectionchecklist-most-recent" class="categorychecklist form-no-clear">
					<?php if( ! empty( $sections ) ) : foreach( $sections as $section ) : ?>
						<li><label class="menu-item-title"><input type="checkbox" class="menu-item-checkbox" name="menu-item[-<?php echo esc_attr( $section->ID ); ?>][menu-item-object-id]" value="<?php echo esc_attr( $section->ID ); ?>"> <?php echo esc_attr( $section->post_title ); ?></label><input type="hidden" class="menu-item-db-id" name="menu-item[-<?php echo esc_attr( $section->ID ); ?>][menu-item-db-id]" value="0"><input type="hidden" class="menu-item-object" name="menu-item[-<?php echo esc_attr( $section->ID ); ?>][menu-item-object]" value="custom"><input type="hidden" class="menu-item-parent-id" name="menu-item[-<?php echo esc_attr( $section->ID ); ?>][menu-item-parent-id]" value="0"><input type="hidden" class="menu-item-type" name="menu-item[-<?php echo esc_attr( $section->ID ); ?>][menu-item-type]" value="custom"><input type="hidden" class="menu-item-title" name="menu-item[-<?php echo esc_attr( $section->ID ); ?>][menu-item-title]" value="<?php echo esc_attr( $section->post_title ); ?>"><input type="hidden" class="menu-item-url" name="menu-item[-<?php echo esc_attr( $section->ID ); ?>][menu-item-url]" value="#<?php echo esc_attr( $section->post_name ); ?>"><input type="hidden" class="menu-item-target" name="menu-item[-<?php echo esc_attr( $section->ID ); ?>][menu-item-target]" value=""><input type="hidden" class="menu-item-attr_title" name="menu-item[-<?php echo esc_attr( $section->ID ); ?>][menu-item-attr_title]" value=""><input type="hidden" class="menu-item-classes" name="menu-item[-<?php echo esc_attr( $section->ID ); ?>][menu-item-classes]" value=""><input type="hidden" class="menu-item-xfn" name="menu-item[-<?php echo esc_attr( $section->ID ); ?>][menu-item-xfn]" value=""></li>
					<?php endforeach; endif; ?>
					</ul>
				</div><!-- /.tabs-panel -->

				<p class="button-controls">
					<span class="list-controls">
						<a href="<?php echo add_query_arg( array( 'selectall' => 1 ), admin_url( 'nav-menus.php' ) ); ?>#posttype-section" class="select-all"><?php _e( 'Select All', 'themify' ) ?></a>
					</span>

					<span class="add-to-menu">
						<input type="submit" class="button-secondary submit-add-to-menu right" value="<?php _e( 'Add to Menu', 'themify' ); ?>" name="add-post-type-menu-item" id="submit-posttype-section">
						<span class="spinner"></span>
					</span>
				</p>
			</div><!-- /.posttypediv --><?php
		}
	}
}

/**************************************************************************************************
 * Initialize Type Class
 **************************************************************************************************/
new Themify_Section();