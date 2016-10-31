<?php
/**
 * Example of how Themify Metabox plugin can be used in themes and plugins.
 *
 * To use this file, enable the Themify Metabox plugin and then copy the contents of this file to
 * your theme's functions.php file, or "include" it.'
 *
 * @package Themify Metabox
 * @since 1.0
 */

/**
 * Add custom fields to Post post type
 *
 * @return array
 * @since 1.0
 */
function themify_metabox_example_fields_setup( $metaboxes ) {
	$first_tab_options = array(
		array(
			'name' => 'text_field',
			'title' => __( 'Text field', 'themify' ),
			'description' => __( 'Field description is displayed below the field.', 'themify' ),
			'type' => 'textbox',
		),
		array(
			'name' => 'textarea_field',
			'title' => __( 'Textarea field', 'themify' ),
			'type' => 'textarea',
			'size' => 55,
			'rows' => 4,
		),
		array(
			'name' => 'image_field',
			'title' => __( 'Image field', 'themify' ),
			'description' => '',
			'type' => 'image',
			'meta' => array()
		),
		array(
			'name' => 'dropdown_field',
			'title' => __( 'Dropdown', 'themify' ),
			'type' => 'dropdown',
			'meta' => array(
				array( 'value' => '', 'name' => '' ),
				array( 'value' => 'yes', 'name' => __( 'Yes', 'themify' ), 'selected' => true ),
				array( 'value' => 'no', 'name' => __( 'No', 'themify' ) ),
			),
			'description' => __( 'You can set which option is selected by default. Cool, eh?', 'themify' ),
		),
		array(
			'name' => 'dropdownbutton_field',
			'title' => __( 'Dropdown Button', 'themify' ),
			'type' => 'dropdownbutton',
			'states' => array(
				array( 'value' => '', 'title' => __( 'Default', 'themify' ), 'icon' => '%s/ddbtn-blank.png', 'name' => __( 'Default', 'themify' ) ),
				array( 'value' => 'yes', 'title' => __( 'Yes', 'themify' ), 'icon' => '%s/ddbtn-check.png', 'name' => __( 'Yes', 'themify' ) ),
				array( 'value' => 'no', 'title' => __( 'No', 'themify' ), 'icon' => '%s/ddbtn-cross.png', 'name' => __( 'No', 'themify' ) ),
			),
			'description' => __( 'Similar to "dropdown" field, but allows setting custom icons for each state.', 'themify' ),
		),
		array(
			'name' => 'checkbox_field',
			'title' => __( 'Checkbox', 'themify' ),
			'label' => __( 'Checkbox label', 'themify' ),
			'type' => 'checkbox',
		),
		array(
			'name'        => 'radio_field',
			'title'       => __( 'Radio field', 'themify' ),
			'description' => __( 'You can hide or show option based on how other options are configured', 'themify' ),
			'type'        => 'radio',
			'meta'        => array(
				array( 'value' => 'yes', 'name' => __( 'Yes', 'themify' ), 'selected' => true ),
				array( 'value' => 'no', 'name' => __( 'No', 'themify' ) ),
			),
			'enable_toggle' => true,
		),
		array(
			'type' => 'separator',
			//'description' => __( 'Optional text to show after the separator', 'themify'. )
		),
		array(
			'type' => 'multi',
			'name' => 'multi_field',
			'title' => __( 'Multi fields', 'themify' ),
			'meta' => array(
				'fields' => array(
					array(
						'name' => 'image_width',
						'label' => __( 'width', 'themify' ),
						'description' => '',
						'type' => 'textbox',
						'meta' => array( 'size' => 'small' )
					),
					// Image Height
					array(
						'name' => 'image_height',
						'label' => __( 'height', 'themify' ),
						'type' => 'textbox',
						'meta' => array( 'size' => 'small' )
					),
				),
				'description' => __( '"Multi" field type allows displaying multiple fields together.', 'themify'),
				'before' => '',
				'after' => '',
				'separator' => ''
			)
		),
		array(
			'name'        => 'color_field',
			'title'       => __( 'Color', 'themify' ),
			'description' => '',
			'type'        => 'color',
			'meta'        => array( 'default' => null ),
			'class'      => 'yes-toggle'
		),
		array(
			'name'        => 'post_id_info_field',
			'title'       => __( 'Post ID', 'themify' ),
			'description' => __( 'This field type shows text with the ID of the post, which is: <code>%s</code>', 'themify' ),
			'type'        => 'post_id_info',
		),
	);

	$second_tab_options = array(
		array(
			'name' 		=> 'audio_field',
			'title' 	=> __( 'Audio field', 'themify' ),
			'description' => '',
			'type' 		=> 'audio',
			'meta'		=> array(),
		),
		array(
			'name' 		=> 'video_field',
			'title' 	=> __( 'Video field', 'themify' ),
			'description' => '',
			'type' 		=> 'video',
			'meta'		=> array(),
		),
        array(
			'name' => 'gallery_shortcode_field',
			'title' => __( 'Gallery Shortcode field', 'themify' ),
			'description' => __( 'Using this field type you can add a gallery manager.', 'themify' ),
			'type' => 'gallery_shortcode',
        ),
        array(
			'name' => 'query_category_field',
			'title' => __( 'Query Category', 'themify' ),
			'description' => __( 'Using this field type you can add a gallery manager.', 'themify' ),
			'type' => 'query_category',
        ),
		array(
			'name' => 'date_field',
			'title' => __( 'Date field', 'announcement-bar' ),
			'description' => '',
			'type' => 'date',
			'meta' => array(
				'default' => '',
				'pick' => __( 'Pick Date', 'themify' ),
				'close' => __( 'Done', 'themify' ),
				'clear' => __( 'Clear Date', 'themify' ),
				'time_format' => 'HH:mm:ss',
				'date_format' => 'yy-mm-dd',
				'timeseparator' => ' ',
			)
		),
	);

	$metaboxes[] = array(
		'name' => __( 'First Tab', 'themify' ), // Name displayed in box
		'id' => 'first-tab',
		'options' => $first_tab_options,
		'pages'	=> 'post'
	);
	$metaboxes[] = array(
		'name' => __( 'Second Tab', 'themify' ), // Name displayed in box
		'id' => 'second-tab',
		'options' => $second_tab_options,
		'pages'	=> 'post'
	);

	return $metaboxes;
}
add_filter( 'themify_do_metaboxes', 'themify_metabox_example_fields_setup' );