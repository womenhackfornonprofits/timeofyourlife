<?php
if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly
/**
 * Module Name: Divider
 * Description: Display Divider
 */
class TB_Divider_Module extends Themify_Builder_Module {
	function __construct() {
		parent::__construct(array(
			'name' => __('Divider', 'themify'),
			'slug' => 'divider'
		));
	}

	public function get_options() {
		$options = array(
			array(
				'id' => 'mod_title_divider',
				'type' => 'text',
				'label' => __('Module Title', 'themify'),
				'class' => 'large'
			),
			array(
				'id' => 'style_divider',
				'type' => 'layout',
				'label' => __('Divider Style', 'themify'),
				'options' => array(
					array('img' => 'solid.png', 'value' => 'solid', 'label' => __('Solid', 'themify')),
					array('img' => 'dotted.png', 'value' => 'dotted', 'label' => __('Dotted', 'themify')),
					array('img' => 'dashed.png', 'value' => 'dashed', 'label' => __('Dashed', 'themify')),
					array('img' => 'double.png', 'value' => 'double', 'label' => __('Double', 'themify'))
				)
			),
			array(
				'id' => 'stroke_w_divider',
				'type' => 'text',
				'label' => __('Stroke Thickness', 'themify'),
				'class' => 'xsmall',
				'help' => 'px',
                                'value'=>1
			),
			array(
				'id' => 'color_divider',
				'type' => 'text',
				'label' => __('Divider Color', 'themify'),
				'class' => 'small',
				'colorpicker' => true,
                                'value'=>'000'
			),
			array(
				'id' => 'top_margin_divider',
				'type' => 'text',
				'label' => __('Top Margin', 'themify'),
				'class' => 'xsmall',
				'help' => 'px'
			),
			array(
				'id' => 'bottom_margin_divider',
				'type' => 'text',
				'label' => __('Bottom Margin', 'themify'),
				'class' => 'xsmall',
				'help' => 'px'
			),
			array(
				'id' => 'divider_type',
				'type' => 'radio',
				'label' => __('Divider Width', 'themify'),
				'options' => array(
					'fullwidth' => __('Fullwidth ', 'themify'),
					'custom' => __('Custom', 'themify'),
				),
				'default' => 'fullwidth',
				'option_js' => true,
			),
			array(
				'id' => 'divider_width',
				'type' => 'text',
				'label' => __('Width', 'themify'),
				'class' => 'xsmall',
				'help' => 'px',
				'value' => '200',
				'wrap_with_class' => 'tf-group-element tf-group-element-custom'
			),
			array(
				'id' => 'divider_align',
				'type' => 'select',
				'label' =>__('Alignment', 'themify'),
				'options' => array(
					'left' => __('Left ', 'themify'),
					'center' => __('Center', 'themify'),
					'right' => __('Right', 'themify'),
				),
				'default' => 'left',
				'wrap_with_class' => 'tf-group-element tf-group-element-custom'
			),
			// Additional CSS
            array(
				'type' => 'separator',
				'meta' => array( 'html' => '<hr/>')
			),
			array(
				'id' => 'css_divider',
				'type' => 'text',
				'label' => __('Additional CSS Class', 'themify'),
				'class' => 'large exclude-from-reset-field',
				'help' => sprintf( '<br/><small>%s</small>', __('Add additional CSS class(es) for custom styling', 'themify') )
			)
		);
		return $options;
	}
        
        public function get_animation() {
		$animation = array(
			array(
				'type' => 'separator',
				'meta' => array( 'html' => '<h4>' . esc_html__( 'Appearance Animation', 'themify' ) . '</h4>')
			),
			array(
				'id' => 'multi_Animation Effect',
				'type' => 'multi',
				'label' => __('Effect', 'themify'),
				'fields' => array(
					array(
						'id' => 'animation_effect',
						'type' => 'animation_select',
						'label' => __( 'Effect', 'themify' )
					),
					array(
						'id' => 'animation_effect_delay',
						'type' => 'text',
						'label' => __( 'Delay', 'themify' ),
						'class' => 'xsmall',
						'description' => __( 'Delay (s)', 'themify' ),
					),
					array(
						'id' => 'animation_effect_repeat',
						'type' => 'text',
						'label' => __( 'Repeat', 'themify' ),
						'class' => 'xsmall',
						'description' => __( 'Repeat (x)', 'themify' ),
					),
				)
			)
		);

		return $animation;
	}

	public function get_styling() {
		return array();
	}
}

///////////////////////////////////////
// Module Options
///////////////////////////////////////
Themify_Builder_Model::register_module( 'TB_Divider_Module' );
