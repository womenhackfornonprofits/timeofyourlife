<?php
/**
 * Load demo importer classname and it's dependencies.
 *
 * @since 1.7.6
 */
function themify_import_sample_content_setup() {

	define( 'WP_LOAD_IMPORTERS', true );

	require_once ABSPATH . 'wp-admin/includes/taxonomy.php';
	require_once ABSPATH . 'wp-admin/includes/post.php';
	require_once ABSPATH . 'wp-admin/includes/image.php';
	include THEMIFY_DIR . '/demo-import/demo-importer.php';

	class Themify_Import extends WP_Import {

		var $placeholder_image = null;

		/**
		 * Replace attachments with the placeholder image provided by the theme.
		 *
		 * @return int $post_id
		 * @since 1.7.6
		 */
		public function process_attachment( $post, $url ) {
			if ( ! $this->fetch_attachments )
			return new WP_Error( 'attachment_processing_error',
				__( 'Fetching attachments is not enabled', 'themify' ) );

			if( $this->placeholder_image == null ) {
				if ( ! function_exists( 'WP_Filesystem' ) ) {
					require_once ABSPATH . 'wp-admin/includes/file.php';
				}
				WP_Filesystem();
				global $wp_filesystem;
				$upload = wp_upload_bits( $post['post_name'] . '.jpg', null, $wp_filesystem->get_contents( THEMIFY_DIR . '/img/image-placeholder.jpg' ) );

				if ( $info = wp_check_filetype( $upload['file'] ) )
					$post['post_mime_type'] = $info['type'];
				else
					return new WP_Error( 'attachment_processing_error', __( 'Invalid file type', 'themify' ) );

				$post['guid'] = $upload['url'];
				$post_id = wp_insert_attachment( $post, $upload['file'] );
				wp_update_attachment_metadata( $post_id, wp_generate_attachment_metadata( $post_id, $upload['file'] ) );

				$this->placeholder_image = $post_id;
			}

			return $this->placeholder_image;
		}

		function process_menu_item( $item ) {
			// skip draft, orphaned menu items
			if ( 'draft' == $item['status'] )
				return;

			$menu_slug = false;
			if ( isset($item['terms']) ) {
				// loop through terms, assume first nav_menu term is correct menu
				foreach ( $item['terms'] as $term ) {
					if ( 'nav_menu' == $term['domain'] ) {
						$menu_slug = $term['slug'];
						break;
					}
				}
			}

			// no nav_menu term associated with this menu item
			if ( ! $menu_slug ) {
				_e( 'Menu item skipped due to missing menu slug', 'themify' );
				echo '<br />';
				return;
			}

			$menu_id = term_exists( $menu_slug, 'nav_menu' );
			if ( ! $menu_id ) {
				printf( __( 'Menu item skipped due to invalid menu slug: %s', 'themify' ), esc_html( $menu_slug ) );
				echo '<br />';
				return;
			} else {
				$menu_id = is_array( $menu_id ) ? $menu_id['term_id'] : $menu_id;
			}

			foreach ( $item['postmeta'] as $meta )
				$$meta['key'] = $meta['value'];

			if ( 'taxonomy' == $_menu_item_type && isset( $this->processed_terms[intval($_menu_item_object_id)] ) ) {
				$_menu_item_object_id = $this->processed_terms[intval($_menu_item_object_id)];
			} else if ( 'post_type' == $_menu_item_type && isset( $this->processed_posts[intval($_menu_item_object_id)] ) ) {
				$_menu_item_object_id = $this->processed_posts[intval($_menu_item_object_id)];
			} else if ( 'custom' != $_menu_item_type ) {
				// associated object is missing or not imported yet, we'll retry later
				$this->missing_menu_items[] = $item;
				return;
			}

			if ( isset( $this->processed_menu_items[intval($_menu_item_menu_item_parent)] ) ) {
				$_menu_item_menu_item_parent = $this->processed_menu_items[intval($_menu_item_menu_item_parent)];
			} else if ( $_menu_item_menu_item_parent ) {
				$this->menu_item_orphans[intval($item['post_id'])] = (int) $_menu_item_menu_item_parent;
				$_menu_item_menu_item_parent = 0;
			}

			// wp_update_nav_menu_item expects CSS classes as a space separated string
			$_menu_item_classes = maybe_unserialize( $_menu_item_classes );
			if ( is_array( $_menu_item_classes ) )
				$_menu_item_classes = implode( ' ', $_menu_item_classes );

			$args = array(
				'menu-item-object-id' => $_menu_item_object_id,
				'menu-item-object' => $_menu_item_object,
				'menu-item-parent-id' => $_menu_item_menu_item_parent,
				'menu-item-position' => intval( $item['menu_order'] ),
				'menu-item-type' => $_menu_item_type,
				'menu-item-title' => $item['post_title'],
				'menu-item-url' => $_menu_item_url,
				'menu-item-description' => $item['post_content'],
				'menu-item-attr-title' => $item['post_excerpt'],
				'menu-item-target' => $_menu_item_target,
				'menu-item-classes' => $_menu_item_classes,
				'menu-item-xfn' => $_menu_item_xfn,
				'menu-item-status' => $item['status']
			);

			$id = wp_update_nav_menu_item( $menu_id, 0, $args );
			if ( $id && ! is_wp_error( $id ) )
				$this->processed_menu_items[intval($item['post_id'])] = (int) $id;

			/**
			 * Menu custom fields, used by various themes */
			if( isset( $_menu_item_icon ) ) {
				update_post_meta( $id, '_menu_item_icon', $_menu_item_icon );
			}
			if( isset( $_themify_mega_menu_item ) ) {
				update_post_meta( $id, '_themify_mega_menu_item', $_themify_mega_menu_item );
			}
			if( isset( $_themify_mega_menu_column ) ) {
				update_post_meta( $id, '_themify_mega_menu_column', $_themify_mega_menu_column );
			}
			if( isset( $_themify_mega_menu_column_sub_item ) ) {
				update_post_meta( $id, '_themify_mega_menu_column_sub_item', $_themify_mega_menu_column_sub_item );
			}
			if( isset( $_themify_mega_menu_dual ) ) {
				update_post_meta( $id, '_themify_mega_menu_dual', $_themify_mega_menu_dual );
			}
			if( isset( $_themify_menu_widget ) ) {
				update_post_meta( $id, '_themify_menu_widget', $_themify_menu_widget );
			}
		}
	}
}

/**
 * Get the path to the sample content file
 *
 * @return string
 * @since 2.3.7
 */
function themify_get_sample_content_file() {
	if( isset( $_POST['skin'] ) ) {
		// importing demo content for an skin
		$resource_file = THEME_DIR . '/skins/' . $_POST['skin'] . '/sample-content.zip';
	} else {
		// regular old demo import
		$resource_file = THEME_DIR . '/sample/sample-content.zip';
	}
	$cache_dir = themify_get_cache_dir();
	$extract_file = $cache_dir['path'] . 'sample-content.xml';

	if( ! file_exists( $resource_file ) ) {
		// keep for backward compatibility
		$resource_file = get_template_directory().'/sample/sample-content.gz';
		themify_uncompress_gzip( $resource_file, $extract_file );
	} else {
		WP_Filesystem();
		if( 1 == unzip_file( $resource_file, $extract_file ) ) {
			$extract_file = $cache_dir['path'] . 'sample-content.xml/sample-content.xml';
		}

	}

	$parse_file = file_exists( $extract_file ) ? $extract_file : $resource_file;
	return $parse_file;
}

/**
 * Performs importing the sample contents to replicate the theme's demo site
 *
 * @since 1.7.6
 */
function themify_do_import_sample_contents() {
	do_action( 'themify_before_demo_import' );

	themify_import_sample_content_setup();

	$import = new Themify_Import();
	$import->fetch_attachments = true;
	$import->import( themify_get_sample_content_file() );

	$demo_settings = THEME_DIR . '/sample/demo-settings.php';
	if( isset( $_POST['skin'] ) ) {
		$demo_settings = THEME_DIR . '/skins/' . $_POST['skin'] . '/demo-settings.php';
	}
	if( file_exists( $demo_settings ) ) {
		require_once( $demo_settings );
	}

	do_action( 'themify_after_demo_import' );
}

/**
 * Undo demo setup and reverts back to state before importing the sample contents.
 * Does not remove post/pages that have been modified by the user.
 *
 * @since 1.7.6
 */
function themify_undo_import_sample_content() {
	do_action( 'themify_before_demo_erase' );

	themify_import_sample_content_setup();
	$import = new Themify_Import();

	$data = $import->parse( themify_get_sample_content_file() );

	foreach( $data['categories'] as $cat ) {
		$term_id = term_exists( $cat['category_nicename'], 'category' );
		if( $term_id ) {
			if ( is_array($term_id) ) $term_id = $term_id['term_id'];
			if ( isset($cat['term_id']) ) {
				wp_delete_category( $term_id );
			}
		}
	}

	foreach( $data['tags'] as $tag ) {
		$term_id = term_exists( $tag['tag_slug'], 'post_tag' );
		if( $term_id ) {
			if ( is_array($term_id) ) $term_id = $term_id['term_id'];
			if ( isset($tag['term_id']) ) {
				wp_delete_term( $term_id, 'post_tag' );
			}
		}
	}

	foreach( $data['terms'] as $term ) {
		$term_id = term_exists( $term['slug'], $term['term_taxonomy'] );
		if ( $term_id ) {
			if ( is_array($term_id) ) $term_id = $term_id['term_id'];
			if ( isset($term['term_id']) ) {
				wp_delete_term( $term_id, $term['term_taxonomy'] );
			}
		}
	}

	foreach( $data['posts'] as $post ) {
		$post_exists = post_exists( $post['post_title'], '', $post['post_date'] );
		if( $post_exists && get_post_type( $post_exists ) == $post['post_type'] ) {
			/* check if the post has not been modified since it was created */
			if( $post['post_date'] == get_post_field( 'post_modified', $post_exists ) ) {
				wp_delete_post( $post_exists, true ); // true: bypass trash
			}
		}
	}

	do_action( 'themify_after_demo_erase' );
}
