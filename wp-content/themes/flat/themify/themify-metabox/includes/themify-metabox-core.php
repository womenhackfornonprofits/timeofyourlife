<?php

if( ! class_exists( 'Themify_Metabox' ) ) :
class Themify_Metabox {

	private static $instance = null;

	public static function get_instance() {
		return null == self::$instance ? self::$instance = new self : self::$instance;
	}

	private function __construct() {
		add_action( 'init', array( $this, 'includes' ) );
		add_action( 'admin_menu', array( $this, 'create_meta_boxes' ) );
		add_action( 'pre_post_update', array( $this, 'save_postdata' ), 101 );
		add_action( 'save_post', array( $this, 'save_postdata' ), 101 );
		add_action( 'admin_enqueue_scripts', array( $this, 'admin_enqueue_scripts' ), 1 );
		add_filter( 'is_protected_meta', array( $this, 'protected_meta' ), 10, 3 );
	}

	function includes() {
		require_once( THEMIFY_METABOX_DIR . 'includes/themify-field-types.php' );
		require_once( THEMIFY_METABOX_DIR . 'includes/themify-metabox-utils.php' );
		require_once( THEMIFY_METABOX_DIR . 'includes/themify-user-fields.php' );
	}

	function create_meta_boxes() {
		global $themify_write_panels, $themify_metaboxes;

		if( ! isset( $themify_write_panels ) )
			$themify_write_panels = array();

		$themify_write_panels = apply_filters( 'themify_do_metaboxes', $themify_write_panels );
		$themify_metaboxes = apply_filters( 'themify_metaboxes', array(
			'themify-meta-boxes' => array(
				'id' => 'themify-meta-boxes',
				'title' => __( 'Themify Custom Panel', 'themify' ),
				'context' => 'normal',
				'priority' => 'high',
			),
		) );
		if( function_exists( 'add_meta_box' ) && is_array( $themify_write_panels ) ) {
			foreach( $themify_write_panels as $args ) {
				if( $args['pages'] != '' ) {
					$themify_meta_page = $args['pages'];
				} else {
					$themify_meta_page = 'post';
				}
				$metabox = isset( $args['metabox'] ) ? $args['metabox'] : 'themify-meta-boxes';
				$pages = explode( ",", $themify_meta_page );
				foreach( $pages as $page ) {
					add_meta_box( $themify_metaboxes[$metabox]['id'], $themify_metaboxes[$metabox]['title'], array( $this, 'render' ), trim( $page ), $themify_metaboxes[$metabox]['context'], $themify_metaboxes[$metabox]['priority'] );
				}
			}
		}
	}

	/**
	 * Save Custom Write Panel Data
	 * @param number
	 * @return mixed
	 */
	function save_postdata( $post_id ) {
		global $post, $themify_write_panels;

		if( function_exists( 'icl_object_id' ) && current_filter() === 'save_post' ) {
			wp_cache_delete( $post_id, 'post_meta' );
		}

		if( ! isset( $_POST['post_type'] ) ) {
			return $post_id;
		}

		if ( 'page' == $_POST['post_type'] ) {
			if ( ! current_user_can( 'edit_page', $post_id ) )
				return $post_id;
		} else {
			if ( ! current_user_can( 'edit_post', $post_id ) )
				return $post_id;
		}

		if( isset( $_POST['themify_proper_save'] ) && $_POST['themify_proper_save'] != '' ) {
			foreach( $themify_write_panels as $write_panel ) {

				$context = isset( $write_panel['pages'] ) ? is_array( $write_panel['pages'] ) ? $write_panel['pages'] : explode( ",", $write_panel['pages'] ) : array( 'post' );
				if( ! in_array( $_POST['post_type'], $context ) ) {
					continue;
				}

				foreach ( $write_panel['options'] as $meta_box ) {

					if('multi' == $meta_box['type']){
						// Grouped fields
						foreach ( $meta_box['meta']['fields'] as $field ) {
							$new_meta = isset( $field['name'] ) && isset( $_POST[$field['name']] ) ? $_POST[$field['name']] : '';
							$old_meta = get_post_meta( $post_id, $field['name'], true );

							// when a default value is set for the field and it's the same as $new_meta, do not bother with saving the field
							if( isset( $field['default'] ) && $new_meta == $field['default'] ) {
								$new_meta = '';
							}

							if( $new_meta != '' && '' == $old_meta )
								add_post_meta( $post_id, $field['name'], $new_meta, true );
							elseif( $new_meta != '' && $new_meta != $old_meta )
								update_post_meta( $post_id, $field['name'], $new_meta );
							elseif( '' == $new_meta && $old_meta )
								delete_post_meta( $post_id, $field['name'] );
						}
					} else {
						// Single field
						$new_meta = isset( $_POST[$meta_box['name']] ) ? $_POST[$meta_box['name']] : '';
						$old_meta = get_post_meta( $post_id, $meta_box['name'], true );

						// when a default value is set for the field and it's the same as $new_meta, do not bother with saving the field
						if( isset( $meta_box['default'] ) && $new_meta == $meta_box['default'] ) {
							$new_meta = '';
						}

						if( isset( $meta_box['force_save'] ) ) { // check if the post meta MUST be saved, regardless of it's value
							update_post_meta( $post_id, $meta_box['name'], $new_meta );
						} elseif( $new_meta != '' && '' == $old_meta )
							add_post_meta( $post_id, $meta_box['name'], $new_meta, true );
						elseif( $new_meta != '' && $new_meta != $old_meta )
							update_post_meta( $post_id, $meta_box['name'], $new_meta );
						elseif( '' == $new_meta && $old_meta )
							delete_post_meta( $post_id, $meta_box['name'] );
					}
				}
			}
		} else {
			if ( isset( $post ) && isset( $post->ID ) ) {
				return $post->ID;
			}
		}
		return false;
	}

	function render( $post, $metabox ) {
		global $post, $themify_write_panels, $typenow, $themify_metaboxes;

		$post_id = $post->ID;
		echo '<div class="themify-meta-box-tabs" id="' . $metabox['id'] . '-meta-box">';
			echo '<ul class="ilc-htabs themify-tabs-heading">';
			foreach( $themify_write_panels as $write_panel ) {

				$_metabox = isset( $write_panel['metabox'] ) ? $write_panel['metabox'] : 'themify-meta-boxes';
				if( $metabox['id'] != $themify_metaboxes[$_metabox]['id'] )
					continue;

				if( trim( $write_panel['pages'] ) == $typenow ) {
					$panel_id = isset( $write_panel['id'] )? $write_panel['id']: sanitize_title( $write_panel['name'] );
					echo '<li><span><a id="' . esc_attr( $panel_id . 't' ) . '" href="' . esc_attr( '#' . $panel_id ) . '">' . esc_html( $write_panel['name'] ) . '</a></span></li>';
				}
			}
			echo '</ul>';
			echo '<div class="ilc-btabs themify-tabs-body">';
			foreach( $themify_write_panels as $write_panel ) {

				$_metabox = isset( $write_panel['metabox'] ) ? $write_panel['metabox'] : 'themify-meta-boxes';
				if( $metabox['id'] != $themify_metaboxes[$_metabox]['id'] )
					continue;

				$pages = explode(",", $write_panel['pages']);
				$check = false;

				foreach( $pages as $page ) {
					if( get_post_type($post) ) {
						if(get_post_type($post) == $page){
							$check = true;
						}
					} else {
						if( (trim($page) == 'post' && $_GET['post_type'] == '') || $_GET['post_type'] == trim($page) ) {
							$check = true;
						}
					}
				}

				if($check){
					$panel_id = isset( $write_panel['id'] )? $write_panel['id']: sanitize_title( $write_panel['name'] );
				?>
				<div id="<?php echo esc_attr( $panel_id ); ?>" class="ilc-tab themify_write_panel">

				<div class="inside">

					<input type="hidden" name="themify_proper_save" value="true" />

					<?php $themify_custom_panel_nonce = wp_create_nonce("themify-custom-panel"); ?>

					<!-- alerts -->
					<div class="alert"></div>
					<!-- /alerts -->

					<?php
					foreach( $write_panel['options'] as $meta_box ) :
						$toggle_class = '';
						if( isset( $meta_box['display_callback'] ) && is_callable( $meta_box['display_callback'] ) ) {
							$show = (bool) call_user_func( $meta_box['display_callback'], $meta_box );
							if( ! $show ) { // if display_callback returns "false",
								continue;  // do not output the field
							}
						}

						$meta_value = isset($meta_box['name']) ? get_post_meta( $post_id, $meta_box['name'], true ) : '';
						$ext_attr = '';
						if( isset($meta_box['toggle']) ){
							$toggle_class .= 'themify-toggle ';
							$toggle_class .= (is_array($meta_box['toggle'])) ? implode(' ', $meta_box['toggle']) : $meta_box['toggle'];
							if ( is_array( $meta_box['toggle'] ) && in_array( '0-toggle', $meta_box['toggle'] ) ) {
								$toggle_class .= ' default-toggle';
							}
						}
						if ( isset( $meta_box['class'] ) ) {
							$toggle_class .= ' ';
							$toggle_class .= is_array( $meta_box['class'] ) ? implode( ' ', $meta_box['class'] ) : $meta_box['class'];
						}
						$data_hide = '';
						if ( isset( $meta_box['hide'] ) ) {
							$data_hide = is_array( $meta_box['hide'] ) ? implode( ' ', $meta_box['hide'] ) : $meta_box['hide'];
						}
						if( isset($meta_box['default_toggle']) && $meta_box['default_toggle'] == 'hidden' ){
							$ext_attr = 'style="display:none;"';
						}
						if( isset($meta_box['enable_toggle']) && $meta_box['enable_toggle'] == true ) {
							$toggle_class .= ' enable_toggle';
						}

						echo $this->before_meta_field( compact( 'meta_box', 'toggle_class', 'ext_attr', 'data_hide' ) );

						do_action( "themify_metabox/field/{$meta_box['type']}", compact( 'meta_box', 'meta_value', 'toggle_class', 'data_hide', 'ext_attr', 'post_id', 'themify_custom_panel_nonce' ) );

						echo $this->after_meta_field();

						// backward compatibility: allow custom function calls in the fields array
						if( isset( $meta_box['function'] ) && is_callable( $meta_box['function'] ) ) {
							call_user_func( $meta_box['function'], $meta_box );
						}

					endforeach; ?>
				</div>
				</div>
				<?php
				}
			}
		echo '</div>';//end .ilc-btabs
		echo '</div>';//end #themify-meta-box-tabs
	}

	function before_meta_field( $args = array() ) {
		$meta_box = $args['meta_box'];
		$meta_box_name = isset( $meta_box['name'] ) ? $meta_box['name'] : '';
		$toggle_class = isset( $args['toggle_class'] ) ? $args['toggle_class'] : '';
		$ext_attr = isset( $args['ext_attr'] ) ? $args['ext_attr'] : '';
		$html = '
		<input type="hidden" name="' . esc_attr( $meta_box_name ) . '_noncename" id="' . esc_attr( $meta_box_name ) . '_noncename" value="' . wp_create_nonce( plugin_basename(__FILE__) ) . '" />
		<div class="themify_field_row clearfix ' . esc_attr( $toggle_class ) . '" ' . esc_attr( $ext_attr );
		if ( isset( $args['data_hide'] ) && ! empty( $args['data_hide'] ) ) {
			$html .= ' data-hide="' . esc_attr( $args['data_hide'] ) . '"';
		}
		$html .= '>';
		if ( isset( $meta_box['title'] ) ) {
			$html .= '<div class="themify_field_title">' . esc_html( $meta_box['title'] ) . '</div>';
		}
		$html .= '<div class="themify_field themify_field-' . esc_attr( $meta_box['type'] ) . '">';

		$html .= isset( $meta_box['meta']['before'] ) ? $meta_box['meta']['before'] : '';
		return $html;
	}

	function after_meta_field( $after = null ) {
		$html = isset( $after ) ? $after : '';
		$html .= '
			</div>
		</div><!--/themify_field_row -->';
		return $html;
	}

	function admin_enqueue_scripts( $page = '' ) {
		global $themify_write_panels, $typenow;

		wp_enqueue_style( 'themify-datetimepicker-css', THEMIFY_METABOX_URI . 'css/jquery-ui-timepicker.css', array() );
		wp_register_style( 'themify-colorpicker', THEMIFY_METABOX_URI . 'css/jquery.minicolors.css', array() );
		wp_register_style( 'themify-metabox', THEMIFY_METABOX_URI . 'css/styles.css', array( 'themify-colorpicker' ) );

		wp_register_script( 'meta-box-tabs', THEMIFY_METABOX_URI . 'js/meta-box-tabs.js', array( 'jquery' ), '1.0', true );
		wp_register_script( 'media-library-browse', THEMIFY_METABOX_URI . 'js/media-lib-browse.js', array( 'jquery'), '1.0', true );
		wp_register_script( 'themify-colorpicker', THEMIFY_METABOX_URI . 'js/jquery.minicolors.js', array( 'jquery' ), null, true );
		wp_enqueue_script( 'themify-datetimepicker-js', THEMIFY_METABOX_URI . 'js/jquery-ui-timepicker.js', array( 'jquery', 'jquery-ui-datepicker'/*, 'jquery-ui-slider'*/ ), false, true );
		wp_register_script( 'themify-metabox', THEMIFY_METABOX_URI . 'js/scripts.js', array( 'jquery', 'meta-box-tabs', 'media-library-browse', 'jquery-ui-tabs', 'themify-colorpicker', 'themify-datetimepicker-js' ), '1.0', true );
		wp_register_script( 'themify-plupload', THEMIFY_METABOX_URI . 'js/plupload.js', array( 'jquery', 'themify-metabox' ) );

		// Inject variable for Plupload
		$global_plupload_init = array(
			'runtimes'				=> 'html5,flash,silverlight,html4',
			'browse_button'			=> 'plupload-browse-button', // adjusted by uploader
			'container' 			=> 'plupload-upload-ui', // adjusted by uploader
			'drop_element' 			=> 'drag-drop-area', // adjusted by uploader
			'file_data_name' 		=> 'async-upload', // adjusted by uploader
			'multiple_queues' 		=> true,
			'max_file_size' 		=> wp_max_upload_size() . 'b',
			'url' 					=> admin_url( 'admin-ajax.php' ),
			'flash_swf_url' 		=> includes_url( 'js/plupload/plupload.flash.swf' ),
			'silverlight_xap_url' 	=> includes_url( 'js/plupload/plupload.silverlight.xap' ),
			'filters' 				=> array(
				array(
					'title' => __( 'Allowed Files', 'themify' ),
					'extensions' => 'jpg,jpeg,gif,png,ico,zip,txt,svg',
				),
			),
			'multipart' 			=> true,
			'urlstream_upload' 		=> true,
			'multi_selection' 		=> false, // added by uploader
			 // additional post data to send to our ajax hook
			'multipart_params' 		=> array(
				'_ajax_nonce' => '', // added by uploader
				'action' => 'themify_plupload', // the ajax action name
				'imgid' => 0 // added by uploader
			)
		);
		wp_localize_script( 'themify-metabox', 'global_plupload_init', $global_plupload_init );

		do_action( 'themify_metabox_register_assets' );

		// attempt to enqueue Metabox API assets automatically when needed
		if( ( $page == 'post.php' || $page == 'post-new.php' ) && is_array( $themify_write_panels ) ) {
			foreach( $themify_write_panels as $args ) {
				if( $typenow == $args['pages'] ) {
					$this->enqueue();
					break;
				}
			}
		}
	}

	/**
	 * Enqueues Themify Metabox assets
	 *
	 * @since 1.0
	 */
	function enqueue() {
		wp_enqueue_media();
		wp_enqueue_style( 'themify-metabox' );
		wp_enqueue_script( 'themify-metabox' );
		wp_enqueue_script( 'themify-plupload' );

		do_action( 'themify_metabox_enqueue_assets' );
	}

	/*
	 * Protect $themify_write_panels fields
	 * This will hide these fields from Custom Fields panel
	 *
	 * @since 1.8.2
	 */
	function protected_meta( $protected, $meta_key, $meta_type ) {
		global $themify_write_panels;
		static $protected = null;
		if( $protected == null ) {
			$protected = themify_metabox_get_field_names( $themify_write_panels );
		}

		if( is_array( $protected ) && in_array( $meta_key, $protected ) ) {
			$protected = true;
		}

		return $protected;
	}
}
endif;
add_action( 'init', 'Themify_Metabox::get_instance', 5 );