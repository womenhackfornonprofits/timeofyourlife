<?php
/**
 * Page Meta Box Options
 * @param array $args
 * @return array
 * @since 1.0.7
 */
function themify_theme_page_meta_box( $args = array() ){
	extract( $args );
	return array(
		// Page Layout
		array(
			'name' 		=> 'page_layout',
			'title'		=> __('Sidebar Option', 'themify'),
			'description'	=> '',
			'type'		=> 'layout',
			'show_title' => true,
			'meta'		=> array(
				array('value' => 'default', 'img' => 'images/layout-icons/default.png', 'selected' => true, 'title' => __('Default', 'themify')),
				array('value' => 'sidebar1', 'img' => 'images/layout-icons/sidebar1.png', 'title' => __('Sidebar Right', 'themify')),
				array('value' => 'sidebar1 sidebar-left', 'img' => 'images/layout-icons/sidebar1-left.png', 'title' => __('Sidebar Left', 'themify')),
				array('value' => 'sidebar-none', 'img' => 'images/layout-icons/sidebar-none.png', 'title' => __('No Sidebar ', 'themify'))
			)
		),
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
		// Hide page title
		array(
			'name' 		=> 'hide_page_title',
			'title'		=> __('Hide Page Title', 'themify'),
			'description'	=> '',
			'type' 		=> 'dropdown',
			'meta'		=> array(
				array('value' => 'default', 'name' => '', 'selected' => true),
				array('value' => 'yes', 'name' => __('Yes', 'themify')),
				array('value' => 'no',	'name' => __('No', 'themify'))
			)
		),
		// Custom menu for page
		array(
			'name' 		=> 'custom_menu',
			'title'		=> __('Custom Menu', 'themify'),
			'description'	=> '',
			'type'		=> 'dropdown',
			'meta'		=> $nav_menus, // extracted from $args
		),
	);
}

/**
 * Query Posts Options
 * @param array $args
 * @return array
 * @since 1.0.7
 */
function themify_theme_query_post_meta_box($args = array()) {
	extract( $args );
	return array(
		// Notice
		array(
			'name' => '_query_posts_notice',
			'title' => '',
			'description' => '',
			'type' => 'separator',
			'meta' => array(
				'html' => '<div class="themify-info-link">' . sprintf( __( '<a href="%s">Query Posts</a> allows you to query WordPress posts from any category on the page. To use it, select a Query Category.', 'themify' ), 'http://themify.me/docs/query-posts' ) . '</div>'
			),
		),
		// Query Category
		array(
			'name' 		=> 'query_category',
			'title'		=> __('Query Category', 'themify'),
			'description'	=> __('Select a category or enter multiple category IDs (eg. 2,5,6). Enter 0 to display all category.', 'themify'),
			'type'		=> 'query_category',
			'meta'		=> array()
		),
		// Descending or Ascending Order for Posts
		array(
			'name' 		=> 'order',
			'title'		=> __('Order', 'themify'),
			'description'	=> '',
			'type'		=> 'dropdown',
			'meta'		=> array(
				array('name' => __('Descending', 'themify'), 'value' => 'desc', 'selected' => true),
				array('name' => __('Ascending', 'themify'), 'value' => 'asc')
			)
		),
		// Criteria to Order By
		array(
			'name' 		=> 'orderby',
			'title'		=> __('Order By', 'themify'),
			'description'	=> '',
			'type'		=> 'dropdown',
			'meta'		=> array(
				array('name' => __('Date', 'themify'), 'value' => 'date', 'selected' => true),
				array('name' => __('Random', 'themify'), 'value' => 'rand'),
				array('name' => __('Author', 'themify'), 'value' => 'author'),
				array('name' => __('Post Title', 'themify'), 'value' => 'title'),
				array('name' => __('Comments Number', 'themify'), 'value' => 'comment_count'),
				array('name' => __('Modified Date', 'themify'), 'value' => 'modified'),
				array('name' => __('Post Slug', 'themify'), 'value' => 'name'),
				array('name' => __('Post ID', 'themify'), 'value' => 'ID')
			)
		),
		// Post Layout
		array(
			'name' 		=> 'layout',
			'title'		=> __('Query Post Layout', 'themify'),
			'description'	=> '',
			'type'		=> 'layout',
			'show_title' => true,
			'meta'		=> array(
				array('value' => 'list-post', 'img' => 'images/layout-icons/list-post.png', 'selected' => true, 'title' => __('List Post', 'themify')),
				array('value' => 'grid4', 'img' => 'images/layout-icons/grid4.png', 'title' => __('Grid 4', 'themify')),
				array('value' => 'grid3', 'img' => 'images/layout-icons/grid3.png', 'title' => __('Grid 3', 'themify')),
				array('value' => 'grid2', 'img' => 'images/layout-icons/grid2.png', 'title' => __('Grid 2', 'themify')),
				array('value' => 'list-large-image', 'img' => 'images/layout-icons/list-large-image.png', 'title' => __('List Large Image', 'themify')),
				array('value' => 'list-thumb-image', 'img' => 'images/layout-icons/list-thumb-image.png', 'title' => __('List Thumb Image', 'themify')),
				array('value' => 'grid2-thumb', 'img' => 'images/layout-icons/grid2-thumb.png', 'title' => __('Grid 2 Thumb', 'themify'))
			)
		),
		// Posts Per Page
		array(
			'name' 		=> 'posts_per_page',
			'title'		=> __('Posts Per Page', 'themify'),
			'description'	=> '',
			'type'		=> 'textbox',
			'meta'		=> array('size' => 'small')
		),
		// Display Content
		array(
			'name' 		=> 'display_content',
			'title'		=> __('Display Content', 'themify'),
			'description'	=> '',
			'type'		=> 'dropdown',
			'meta'		=> array(
				array('name' => __('Full Content', 'themify'),'value'=>'content','selected'=>true),
				array('name' => __('Excerpt', 'themify'),'value'=>'excerpt'),
				array('name' => __('None', 'themify'),'value'=>'none')
			)
		),
		// Featured Image Size
		array(
			'name'	=>	'feature_size_page',
			'title'	=>	__('Image Size', 'themify'),
			'description' => sprintf(__('Image sizes can be set at <a href="%s">Media Settings</a> and <a href="%s" target="_blank">Regenerated</a>', 'themify'), 'options-media.php', 'https://wordpress.org/plugins/regenerate-thumbnails/'),
			'type'		 =>	'featimgdropdown',
			'display_callback' => 'themify_is_image_script_disabled'
		),
		// Multi field: Image Dimension
		themify_image_dimensions_field(),
		// Hide Title
		array(
			'name' 		=> 'hide_title',
			'title'		=> __('Hide Post Title', 'themify'),
			'description'	=> '',
			'type' 		=> 'dropdown',
			'meta'		=> array(
				array('value' => 'default', 'name' => '', 'selected' => true),
				array('value' => 'yes', 'name' => __('Yes', 'themify')),
				array('value' => 'no',	'name' => __('No', 'themify'))
			)
		),
		// Unlink Post Title
		array(
			'name' 		=> 'unlink_title',
			'title' 		=> __('Unlink Post Title', 'themify'),
			'description' => __('Unlink post title (it will display the post title without link)', 'themify'),
			'type' 		=> 'dropdown',
			'meta'		=> array(
				array('value' => 'default', 'name' => '', 'selected' => true),
				array('value' => 'yes', 'name' => __('Yes', 'themify')),
				array('value' => 'no',	'name' => __('No', 'themify'))
			)
		),
		// Hide Post Date
		array(
			'name' 		=> 'hide_date',
			'title'		=> __('Hide Post Date', 'themify'),
			'description'	=> '',
			'type' 		=> 'dropdown',
			'meta'		=> array(
				array('value' => 'default', 'name' => '', 'selected' => true),
				array('value' => 'yes', 'name' => __('Yes', 'themify')),
				array('value' => 'no',	'name' => __('No', 'themify'))
			)
		),
		// Hide Post Meta
		themify_multi_meta_field(),
		// Hide Post Image
		array(
			'name' 		=> 'hide_image',
			'title' 		=> __('Hide Featured Image', 'themify'),
			'description' => '',
			'type' 		=> 'dropdown',
			'meta'		=> array(
				array('value' => 'default', 'name' => '', 'selected' => true),
				array('value' => 'yes', 'name' => __('Yes', 'themify')),
				array('value' => 'no',	'name' => __('No', 'themify'))
			)
		),
		// Unlink Post Image
		array(
			'name' 		=> 'unlink_image',
			'title' 		=> __('Unlink Featured Image', 'themify'),
			'description' => __('Display the Featured Image without link', 'themify'),
			'type' 		=> 'dropdown',
			'meta'		=> array(
				array('value' => 'default', 'name' => '', 'selected' => true),
				array('value' => 'yes', 'name' => __('Yes', 'themify')),
				array('value' => 'no',	'name' => __('No', 'themify'))
			)
		),
		// Page Navigation Visibility
		array(
			'name' 		=> 'hide_navigation',
			'title'		=> __('Hide Page Navigation', 'themify'),
			'description'	=> '',
			'type' 		=> 'dropdown',
			'meta'		=> array(
				array('value' => 'default', 'name' => '', 'selected' => true),
				array('value' => 'yes', 'name' => __('Yes', 'themify')),
				array('value' => 'no',	'name' => __('No', 'themify'))
			)
		)
	);
}

/**
 * Query Sections Meta Box Options
 * @param array $args
 * @return array
 * @since 1.0.7
 */
function themify_theme_query_section_meta_box($args = array()) {
	extract( $args );
	return array(
		// Query Category
		array(
			'name' 		=> 'section_query_category',
			'title'		=> __('Section Category', 'themify'),
			'description'	=> __('Select a section category or enter multiple section category IDs (eg. 2,5,6). Enter 0 to display all section categories.', 'themify'),
			'type'		=> 'query_category',
			'meta'		=> array('taxonomy' => 'section-category')
		),
		// Descending or Ascending Order for Sections
		array(
			'name' 		=> 'section_order',
			'title'		=> __('Order', 'themify'),
			'description'	=> '',
			'type'		=> 'dropdown',
			'meta'		=> array(
				array('name' => __('Descending', 'themify'), 'value' => 'desc', 'selected' => true),
				array('name' => __('Ascending', 'themify'), 'value' => 'asc')
			)
		),
		// Criteria to Order By
		array(
			'name' 		=> 'section_orderby',
			'title'		=> __('Order By', 'themify'),
			'description'	=> '',
			'type'		=> 'dropdown',
			'meta'		=> array(
				array('name' => __('Date', 'themify'), 'value' => 'date', 'selected' => true),
				array('name' => __('Random', 'themify'), 'value' => 'rand'),
				array('name' => __('Author', 'themify'), 'value' => 'author'),
				array('name' => __('Post Title', 'themify'), 'value' => 'title'),
				array('name' => __('Comments Number', 'themify'), 'value' => 'comment_count'),
				array('name' => __('Modified Date', 'themify'), 'value' => 'modified'),
				array('name' => __('Post Slug', 'themify'), 'value' => 'name'),
				array('name' => __('Post ID', 'themify'), 'value' => 'ID')
			)
		),
		// Posts Per Page
		array(
			  'name' 		=> 'section_posts_per_page',
			  'title'		=> __('Sections Per Page', 'themify'),
			  'description'	=> '',
			  'type'		=> 'textbox',
			  'meta'		=> array('size' => 'small')
			),
		// Featured Image Size
		array(
			'name'	=>	'section_feature_size_page',
			'title'	=>	__('Image Size', 'themify'),
			'description' => __('Image sizes can be set at <a href="options-media.php">Media Settings</a> and <a href="https://wordpress.org/plugins/regenerate-thumbnails/" target="_blank">Regenerated</a>', 'themify'),
			'type'		 =>	'featimgdropdown',
			'display_callback' => 'themify_is_image_script_disabled'
			),
		// Hide Title
		array(
			  'name' 		=> 'section_hide_title',
			  'title'		=> __('Hide Section Title', 'themify'),
			  'description'	=> '',
			  'type' 		=> 'dropdown',
			  'meta'		=> array(
					array('value' => 'default', 'name' => '', 'selected' => true),
					array('value' => 'yes', 'name' => __('Yes', 'themify')),
					array('value' => 'no',	'name' => __('No', 'themify'))
				)
			)
	);
}

/**
 * Portfolio Meta Box Options
 * @param array $args
 * @return array
 * @since 1.0.7
 */
function themify_theme_query_portfolio_meta_box($args = array()){
	extract( $args );
	return array(
		// Query Category
		array(
			'name' 		=> 'portfolio_query_category',
			'title'		=> __('Portfolio Category', 'themify'),
			'description'	=> __('Select a portfolio category or enter multiple portfolio category IDs (eg. 2,5,6). Enter 0 to display all portfolio categories.', 'themify'),
			'type'		=> 'query_category',
			'meta'		=> array('taxonomy' => 'portfolio-category')
		),
		// Descending or Ascending Order for Portfolios
		array(
			'name' 		=> 'portfolio_order',
			'title'		=> __('Order', 'themify'),
			'description'	=> '',
			'type'		=> 'dropdown',
			'meta'		=> array(
				array('name' => __('Descending', 'themify'), 'value' => 'desc', 'selected' => true),
				array('name' => __('Ascending', 'themify'), 'value' => 'asc')
			)
		),
		// Criteria to Order By
		array(
			'name' 		=> 'portfolio_orderby',
			'title'		=> __('Order By', 'themify'),
			'description'	=> '',
			'type'		=> 'dropdown',
			'meta'		=> array(
				array('name' => __('Date', 'themify'), 'value' => 'date', 'selected' => true),
				array('name' => __('Random', 'themify'), 'value' => 'rand'),
				array('name' => __('Author', 'themify'), 'value' => 'author'),
				array('name' => __('Post Title', 'themify'), 'value' => 'title'),
				array('name' => __('Comments Number', 'themify'), 'value' => 'comment_count'),
				array('name' => __('Modified Date', 'themify'), 'value' => 'modified'),
				array('name' => __('Post Slug', 'themify'), 'value' => 'name'),
				array('name' => __('Post ID', 'themify'), 'value' => 'ID')
			)
		),
		// Post Layout
		array(
			  'name' 		=> 'portfolio_layout',
			  'title'		=> __('Portfolio Layout', 'themify'),
			  'description'	=> '',
			  'type'		=> 'layout',
			  'show_title' => true,
			  'meta'		=> array(
					array('value' => 'list-post', 'img' => 'images/layout-icons/list-post.png', 'selected' => true),
					array('value' => 'grid4', 'img' => 'images/layout-icons/grid4.png', 'title' => __('Grid 4', 'themify')),
					array('value' => 'grid3', 'img' => 'images/layout-icons/grid3.png', 'title' => __('Grid 3', 'themify')),
					array('value' => 'grid2', 'img' => 'images/layout-icons/grid2.png', 'title' => __('Grid 2', 'themify'))
				)
			),
		// Posts Per Page
		array(
			  'name' 		=> 'portfolio_posts_per_page',
			  'title'		=> __('Portfolios Per Page', 'themify'),
			  'description'	=> '',
			  'type'		=> 'textbox',
			  'meta'		=> array('size' => 'small')
			),

		// Display Content
		array(
			  'name' 		=> 'portfolio_display_content',
			  'title'		=> __('Display Content', 'themify'),
			  'description'	=> '',
			  'type'		=> 'dropdown',
			  'meta'		=> array(
									array('name' => __('Full Content', 'themify'),'value'=>'content','selected'=>true),
									array('name' => __('Excerpt', 'themify'),'value'=>'excerpt'),
									array('name' => __('None', 'themify'),'value'=>'none')
								)
			),
		// Featured Image Size
		array(
			'name'	=>	'portfolio_feature_size_page',
			'title'	=>	__('Image Size', 'themify'),
			'description' => __('Image sizes can be set at <a href="options-media.php">Media Settings</a> and <a href="https://wordpress.org/plugins/regenerate-thumbnails/" target="_blank">Regenerated</a>', 'themify'),
			'type'		 =>	'featimgdropdown',
			'display_callback' => 'themify_is_image_script_disabled'
			),

		// Multi field: Image Dimension
		array(
			'type' => 'multi',
			'name' => '_portfolio_image_dimensions',
			'title' => __('Image Dimensions', 'themify'),
			'meta' => array(
				'fields' => array(
					// Image Width
					array(
					  'name' 		=> 'portfolio_image_width',
					  'label' => __('width', 'themify'),
					  'description' => '',
					  'type' 		=> 'textbox',
					  'meta'		=> array('size'=>'small')
					),
					// Image Height
					array(
					  'name' 		=> 'portfolio_image_height',
					  'label' => __('height', 'themify'),
					  'description' => '',
					  'type' 		=> 'textbox',
					  'meta'		=> array('size'=>'small')
					),
				),
				'description' => __('Enter height = 0 to disable vertical cropping with img.php enabled', 'themify'),
				'before' => '',
				'after' => '',
				'separator' => ''
			)
		),
		// Hide Title
		array(
			  'name' 		=> 'portfolio_hide_title',
			  'title'		=> __('Hide Portfolio Title', 'themify'),
			  'description'	=> '',
			  'type' 		=> 'dropdown',
			  'meta'		=> array(
									array('value' => 'default', 'name' => '', 'selected' => true),
									array('value' => 'yes', 'name' => __('Yes', 'themify')),
									array('value' => 'no',	'name' => __('No', 'themify'))
								)
			),
		// Unlink Post Title
		array(
			  'name' 		=> 'portfolio_unlink_title',
			  'title' 		=> __('Unlink Portfolio Title', 'themify'),
			  'description' => __('Unlink portfolio title (it will display the post title without link)', 'themify'),
			  'type' 		=> 'dropdown',
			  'meta'		=> array(
									array('value' => 'default', 'name' => '', 'selected' => true),
									array('value' => 'yes', 'name' => __('Yes', 'themify')),
									array('value' => 'no',	'name' => __('No', 'themify'))
								)
			),
		// Hide Post Date
		array(
			  'name' 		=> 'portfolio_hide_date',
			  'title'		=> __('Hide Portfolio Date', 'themify'),
			  'description'	=> '',
			  'type' 		=> 'dropdown',
			  'meta'		=> array(
									array('value' => 'default', 'name' => '', 'selected' => true),
									array('value' => 'yes', 'name' => __('Yes', 'themify')),
									array('value' => 'no',	'name' => __('No', 'themify'))
								)
			),
		// Hide Post Meta
		array(
			'name' 		=> 'portfolio_hide_meta_all',
			'title' 	=> __('Hide Portfolio Meta', 'themify'),
			'description' => '',
			'type' 		=> 'dropdown',
			'meta'		=> array(
				array('value' => 'default', 'name' => '', 'selected' => true),
				array('value' => 'yes', 'name' => __('Yes', 'themify')),
				array('value' => 'no',	'name' => __('No', 'themify'))
			)
		),
		// Hide Post Image
		array(
			  'name' 		=> 'portfolio_hide_image',
			  'title' 		=> __('Hide Featured Image', 'themify'),
			  'description' => '',
			  'type' 		=> 'dropdown',
			  'meta'		=> array(
				array('value' => 'default', 'name' => '', 'selected' => true),
				array('value' => 'yes', 'name' => __('Yes', 'themify')),
				array('value' => 'no',	'name' => __('No', 'themify'))
			)
		),
		// Unlink Post Image
		array(
			  'name' 		=> 'portfolio_unlink_image',
			  'title' 		=> __('Unlink Featured Image', 'themify'),
			  'description' => __('Display the Featured Image Without Link', 'themify'),
			  'type' 		=> 'dropdown',
			  'meta'		=> array(
				array('value' => 'default', 'name' => '', 'selected' => true),
				array('value' => 'yes', 'name' => __('Yes', 'themify')),
				array('value' => 'no',	'name' => __('No', 'themify'))
			)
		),
		// Page Navigation Visibility
		array(
			  'name' 		=> 'portfolio_hide_navigation',
			  'title'		=> __('Hide Page Navigation', 'themify'),
			  'description'	=> '',
			  'type' 		=> 'dropdown',
			  'meta'		=> array(
				array('value' => 'default', 'name' => '', 'selected' => true),
				array('value' => 'yes', 'name' => __('Yes', 'themify')),
				array('value' => 'no',	'name' => __('No', 'themify'))
			)
		)
	);
}

/**
 * Default Page Layout Module
 * @param array $data Theme settings data
 * @return string Markup for module.
 * @since 1.0.0
 */
function themify_default_page_layout($data = array()){
	$data = themify_get_data();

	/**
	 * Theme Settings Option Key Prefix
	 * @var string
	 */
	$prefix = 'setting-default_page_';

	/**
	 * Sidebar placement options
	 * @var array
	 */
	$sidebar_location_options = array(
		array('value' => 'sidebar1', 'img' => 'images/layout-icons/sidebar1.png', 'selected' => true, 'title' => __('Sidebar Right', 'themify')),
		array('value' => 'sidebar1 sidebar-left', 'img' => 'images/layout-icons/sidebar1-left.png', 'title' => __('Sidebar Left', 'themify')),
		array('value' => 'sidebar-none', 'img' => 'images/layout-icons/sidebar-none.png', 'title' => __('No Sidebar', 'themify'))
	);

	/**
	 * Tertiary options <blank>|yes|no
	 * @var array
	 */
	$default_options = array(
		array('name' => '', 'value' => ''),
		array('name' => __('Yes', 'themify'), 'value' => 'yes'),
		array('name' => __('No', 'themify'), 'value' => 'no')
	);

	/**
	 * Module markup
	 * @var string
	 */
	$output = '';

	/**
	 * Page sidebar placement
	 */
	$output .= '<p>
					<span class="label">' . __('Page Sidebar Option', 'themify') . '</span>';
	$val = isset( $data[$prefix.'layout'] ) ? $data[$prefix.'layout'] : '';
	foreach ( $sidebar_location_options as $option ) {
		if ( ( '' == $val || ! $val || ! isset( $val ) ) && ( isset( $option['selected'] ) && $option['selected'] ) ) {
			$val = $option['value'];
		}
		if ( $val == $option['value'] ) {
			$class = "selected";
		} else {
			$class = "";
		}
		$output .= '<a href="#" class="preview-icon '.$class.'" title="'.$option['title'].'"><img src="'.THEME_URI.'/'.$option['img'].'" alt="'.$option['value'].'"  /></a>';
	}
	$output .= '<input type="hidden" name="'.$prefix.'layout" class="val" value="'.$val.'" /></p>';

	/**
	 * Hide Title in All Pages
	 */
	$output .= '<p>
					<span class="label">' . __('Hide Title in All Pages', 'themify') . '</span>
					<select name="setting-hide_page_title">'.
						themify_options_module($default_options, 'setting-hide_page_title') . '
					</select>
				</p>';

    /**
     * Hide Feauted images in All Pages
     */
    $output .= '<p>
                    <span class="label">' . __('Hide Featured Image', 'themify') . '</span>
                    <select name="setting-hide_page_image">' .
                        themify_options_module($default_options, 'setting-hide_page_image') . '
                    </select>
                </p>';
	/**
	 * Page Comments
	 */
	$pre = 'setting-comments_pages';
	$output .= '<p><span class="label">' . __('Page Comments', 'themify') . '</span><label for="'.$pre.'"><input type="checkbox" id="'.$pre.'" name="'.$pre.'" ' . checked( themify_get( $pre ), 'on', false ) . ' /> ' . __('Disable comments in all Pages', 'themify') . '</label></p>';

	return $output;
}