<?php
if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly
/**
 * Builder Main Meta Box HTML
 */
?>

<div class="themify_builder themify_builder_admin clearfix">

	<div class="themify_builder_module_panel clearfix">
		
		<?php foreach( Themify_Builder_Model::$modules as $module ): ?>
		<?php $class = "themify_builder_module module-type-{$module->slug}"; ?>

		<div class="<?php echo esc_attr($class); ?>" data-module-slug="<?php echo esc_attr( $module->slug ); ?>" data-module-name="<?php echo esc_attr( $module->name ); ?>">
			<strong class="module_name"><?php echo esc_html( $module->name ); ?></strong>
			<a href="#" class="add_module" data-module-name="<?php echo esc_attr( $module->slug ); ?>"><?php _e('Add', 'themify') ?></a>
		</div>
		<!-- /module -->
		<?php endforeach; ?>
	</div>
	<div id="themify_builder_module_tmp"></div>
	<!-- /themify_builder_module_panel -->

	<div class="themify_builder_row_panel clearfix">

		<div id="themify_builder_row_wrapper" class="themify_builder_row_js_wrapper themify_builder_editor_wrapper"></div> <!-- /#themify_builder_row_wrapper - Load by js later -->
		
		<?php if($post->post_status!='auto-draft'):?>
			<div class="themify_builder_save">
				<ul class="themify_builder_backend_options_menu left">
					<li>
						<div class="ti ti-menu"></div>
						<ul>
							<li><a href="#" id="themify_builder_duplicate"><?php _e('Duplicate this page', 'themify') ?></a></li>
							<li class="has-children">
								<a href="#"><?php esc_html_e( 'Import From', 'themify' );?></a>
								<ul>
									<li><a href="#" class="themify_builder_import_page"><?php esc_html_e( 'Existing Pages', 'themify' );?></a></li>
									<li><a href="#" class="themify_builder_import_post"><?php esc_html_e( 'Existing Posts', 'themify' );?></a></li>
								</ul>
							</li>
							<li class="has-children">
								<a href="#"><?php esc_html_e( 'Import / Export', 'themify' );?></a>
								<ul>
									<li><a href="#" class="themify_builder_import_file"><?php esc_html_e( 'Import', 'themify' );?></a></li>
									<li><a href="<?php echo wp_nonce_url('?themify_builder_export_file=true&postid=' . $post->ID, 'themify_builder_export_nonce') ?>"><?php esc_html_e( 'Export', 'themify' );?></a></li>
								</ul>
							</li>
							<?php $is_premium = Themify_Builder_Model::is_premium();?>
							<li class="has-children<?php if(!$is_premium):?> themify_builder_lite<?php endif;?>">
								<a href="javascript:void(0);"><?php esc_html_e( 'Layouts', 'themify' );?></a>
								<ul>
									<li><a href="javascript:void(0);" class="themify_builder_load_layout"><?php esc_html_e( 'Load Layout', 'themify' );?></a></li>
									<li><a href="javascript:void(0);" class="themify_builder_save_layout"><?php esc_html_e( 'Save as Layout', 'themify' );?></a></li>
								</ul>
							</li>
							<li class="has-children<?php if(!$is_premium):?> themify_builder_lite<?php endif;?>">
								<a href="javascript:void(0);"><?php esc_html_e( 'Revisions', 'themify' );?></a>
								<ul>
									<li><a href="javascript:void(0);" class="themify_builder_load_revision"><?php esc_html_e( 'Load Revision', 'themify' );?></a></li>
									<li><a href="javascript:void(0);" class="themify_builder_save_revision"><?php esc_html_e( 'Save as Revision', 'themify' );?></a></li>
								</ul>
							</li>
						</ul>
					</li>
					<li class="separator"></li>
					<li>
						<span class="themify_builder_undo_tools">
							<a class="themify-builder-undo-btn js-themify-builder-undo-btn" rel="themify-tooltip-top" data-title="<?php esc_html_e( 'Undo', 'themify' );?>"><i class="ti-back-left"></i></a>
							<a class="themify-builder-redo-btn js-themify-builder-redo-btn" rel="themify-tooltip-top" data-title="<?php esc_html_e( 'Redo', 'themify' );?>"><i class="ti-back-right"></i></a>
						</span>
					</li>
				</ul>
				
				<?php if ( isset( $pagenow ) && $pagenow !== 'post-new.php' ): ?>
					<a href="#" id="themify_builder_switch_frontend" class="themify_builder_switch_frontend"><?php _e('Switch to frontend', 'themify') ?></a>
					<a href="#" id="themify_builder_main_save" class="builder_button"><?php _e('Save', 'themify') ?></a>
				<?php endif; ?>

			</div>
			<!-- /themify_builder_save -->
		<?php endif;?>

	</div>
	<!-- /themify_builder_row_panel -->

	<div style="display: none;">
		<?php
			wp_editor( ' ', 'tfb_lb_hidden_editor' );
		?>
	</div>

</div>
<!-- /themify_builder -->