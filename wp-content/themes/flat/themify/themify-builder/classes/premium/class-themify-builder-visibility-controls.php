<?php
	
	/**
	 * The Builder Visibility Controls class.
	 * This is used to show the visibility controls on all rows and modules.
	 *
	 * @package	Themify_Builder
	 * @subpackage Themify_Builder/classes
	 */
	class Themify_Builder_Visibility_Controls {

		/**
		 * Constructor.
		 * 
		 * @param object Themify_Builder $builder 
		 */
		public function __construct() {
			add_filter( 'themify_builder_module_lightbox_form_settings', array( $this, 'register_module_visibility_controls' ), 10, 2 );
			add_filter( 'themify_builder_row_lightbox_form_settings', array( $this, 'register_row_visibility_controls' ), 10 );
                        if(Themify_Builder_Model::is_premium()){
                            add_filter( 'themify_builder_row_classes', array( $this, 'row_classes' ), 10, 3 );
                            add_filter( 'themify_builder_module_classes', array( $this, 'module_classes' ), 10, 4 );
                        }
		}

		/**
		 * Register visibility tab control on module settings.
		 * 
		 * @param array $settings 
		 * @param array $module 
		 * @return array
		 */
		public function register_module_visibility_controls( $settings, $module ) {
			$settings['visibility'] = array(
				'name' => esc_html__( 'Visibility', 'themify' ),
				'options' => apply_filters('themify_builder_visibility_settings_fields', $this->add_module_visibility_controls(), $module)
			);
			return $settings;
		}

		/**
		 * Register visibility tab control on row settings.
		 * 
		 * @param array $settings 
		 * @return array
		 */
		public function register_row_visibility_controls( $settings ) {
			$settings['visibility'] = array(
				'name' => esc_html__( 'Visibility', 'themify' ),
				'options' => apply_filters('themify_builder_row_fields_visibility', $this->add_row_visibility_controls())
			);
			return $settings;
		}

		/**
		 * Append visibility controls to rows.
		 * 
		 * @access 	public
		 * @return 	array 
		 */
		public function add_row_visibility_controls() {
                        $disable = Themify_Builder_Model::is_premium();
			$visibility_controls =	array(
				array(
					'id' => 'separator_visibility',
					'title' => '',
					'description' => '',
					'type' => 'separator',
					'meta' => array('html' => '<h4>' . __('Visibility', 'themify') . '</h4>'),
				),
				array(
					'id' => 'visibility_desktop',
					'label' => __('Desktop', 'themify'),
					'type' => 'radio',
					'meta' => array(
						array('value' => 'show', 'name' => __('Show', 'themify'), 'selected' => true),
						array('value' => 'hide', 'name' => __('Hide', 'themify'),'disable'=>!$disable),
					),
                                        'wrap_with_class' => !$disable?'themify_builder_lite':''
				),
				array(
					'id' => 'visibility_tablet',
					'label' => __('Tablet', 'themify'),
					'type' => 'radio',
					'meta' => array(
						array('value' => 'show', 'name' => __('Show', 'themify'), 'selected' => true),
						array('value' => 'hide', 'name' => __('Hide', 'themify'),'disable'=>!$disable),
					),
                                        'wrap_with_class' => !$disable?'themify_builder_lite':''
				),
				array(
					'id' => 'visibility_mobile',
					'label' => __('Mobile', 'themify'),
					'type' => 'radio',
					'meta' => array(
						array('value' => 'show', 'name' => __('Show', 'themify'), 'selected' => true),
						array('value' => 'hide', 'name' => __('Hide', 'themify'),'disable'=>!$disable),
					),
                                        'wrap_with_class' => !$disable?'themify_builder_lite':''
				)
			);

			return $visibility_controls;
		}

		/**
		 * Append visibility controls to modules.
		 * 
		 * @access 	public
		 * @return 	array
		 */
		public function add_module_visibility_controls() {		
                        $disable = Themify_Builder_Model::is_premium();
			$visibility_controls =	array(
				array(
					'id' => 'separator_visibility',
					'title' => '',
					'description' => '',
					'type' => 'separator',
					'meta' => array('html' => '<h4>' . __('Visibility', 'themify') . '</h4>'),
				),
				array(
					'id' => 'visibility_desktop',
					'label' => __('Desktop', 'themify'),
					'type' => 'radio',
					'meta' => array(
						array('value' => 'show', 'name' => __('Show', 'themify'), 'selected' => true),
						array('value' => 'hide', 'name' => __('Hide', 'themify'),'disable'=>!$disable),
					),
                                        'wrap_with_class' => !$disable?'themify_builder_lite':''
				),
				array(
					'id' => 'visibility_tablet',
					'label' => __('Tablet', 'themify'),
					'type' => 'radio',
					'meta' => array(
						array('value' => 'show', 'name' => __('Show', 'themify'), 'selected' => true),
						array('value' => 'hide', 'name' => __('Hide', 'themify'),'disable'=>!$disable),
					),
                                        'wrap_with_class' => !$disable?'themify_builder_lite':''
				),
				array(
					'id' => 'visibility_mobile',
					'label' => __('Mobile', 'themify'),
					'type' => 'radio',
					'meta' => array(
						array('value' => 'show', 'name' => __('Show', 'themify'), 'selected' => true),
						array('value' => 'hide', 'name' => __('Hide', 'themify'),'disable'=>!$disable),
					),
                                        'wrap_with_class' => !$disable?'themify_builder_lite':''
				)
			);
			return $visibility_controls;
		}

		/**
		 * Append visibility controls CSS classes to modules.
		 * 
		 * @param	array $classes
		 * @param	string $mod_name
		 * @param	string $module_ID
		 * @param	array $args
		 * @access 	public
		 * @return 	array
		 */
		public function module_classes( $classes, $mod_name = null, $module_ID = null, $args = array() ) {
			if ( isset( $args['visibility_desktop'] ) && $args['visibility_desktop'] == 'hide' ) {
				$classes[] = 'hide-desktop';
			}

			if ( isset( $args['visibility_tablet'] ) && $args['visibility_tablet'] == 'hide' ) {
				$classes[] = 'hide-tablet';
			}

			if ( isset( $args['visibility_mobile'] ) && $args['visibility_mobile'] == 'hide' ) {
				$classes[] = 'hide-mobile';
			}

			return $classes;
		}

		/**
		 * Append visibility controls CSS classes to rows.
		 * 
		 * @param	array $classes
		 * @param	array $row
		 * @param	string $builder_id
		 * @access 	public
		 * @return 	array
		 */
		public function row_classes( $classes, $row, $builder_id ) {
			if ( isset( $row['styling']['visibility_desktop'] ) && $row['styling']['visibility_desktop'] == 'hide' ) {
				$classes[] = 'hide-desktop';
			}
			
			if ( isset( $row['styling']['visibility_tablet'] ) && $row['styling']['visibility_tablet'] == 'hide' ) {
				$classes[] = 'hide-tablet';
			}
			
			if ( isset( $row['styling']['visibility_mobile'] ) && $row['styling']['visibility_mobile'] == 'hide' ) {
				$classes[] = 'hide-mobile';
			}

			return $classes;
		}

		/**
		 * Test if is preview mode.
		 * 
		 * @access 	public
		 * @return 	bool
		 */
		public function is_preview() {
			return class_exists( 'Themify_Builder_Model' ) && Themify_Builder_Model::is_frontend_editor_page();
		}
	}