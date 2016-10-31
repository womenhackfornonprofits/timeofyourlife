<script type="text/html" id="tmpl-builder_module_item">
	<div class="module_menu">
		<div class="menu_icon">
		</div>
		<ul class="themify_builder_dropdown" style="display:none;">
			<li><a href="#" class="themify_module_options" data-module-name="{{ data.slug }}"><?php _e('Edit', 'themify') ?></a></li>
			<li><a href="#" class="themify_module_duplicate"><?php _e('Duplicate', 'themify') ?></a></li>
			<li><a href="#" class="themify_module_delete"><?php _e('Delete', 'themify') ?></a></li>
			<li><a href="#" class="themify_builder_export_component" data-component="module"><?php _e('Export', 'themify') ?></a></li>
			<li><a href="#" class="themify_builder_import_component" data-component="module"><?php _e('Import', 'themify') ?></a></li>
			<li><a href="#" class="themify_builder_copy_component" data-component="module"><?php _e('Copy', 'themify') ?></a></li>
			<li><a href="#" class="themify_builder_paste_component" data-component="module"><?php _e('Paste', 'themify') ?></a></li>
		</ul>
	</div>
	<div class="module_label">
		<strong class="module_name">{{ data.name }}</strong>
		<em class="module_excerpt">{{ data.excerpt }}</em>
	</div>
	<div class="themify_module_settings">
		<# print("<sc" + "ript type='text/json'>"); #>
		<# print("</sc"+"ript>"); #>
	</div>
</script>

<script type="text/html" id="tmpl-builder_column_item">
	<div class="themify_grid_drag themify_drag_right"></div>
	<div class="themify_grid_drag themify_drag_left"></div>
	<ul class="themify_builder_column_action">
		<li><a href="#" class="themify_builder_option_column" data-title="<?php esc_html_e( 'Styling', 'themify' );?>" rel="themify-tooltip-bottom"><span class="ti-brush"></span></a></li>
		<li class="separator"></li>
		<li><a href="#" class="themify_builder_export_component" data-title="<?php esc_html_e( 'Export', 'themify' );?>" rel="themify-tooltip-bottom" data-component="{{ data.component_name }}"><span class="ti-export"></span></a></li>
		<li><a href="#" class="themify_builder_import_component" data-title="<?php esc_html_e( 'Import', 'themify' );?>" rel="themify-tooltip-bottom" data-component="{{ data.component_name }}"><span class="ti-import"></span></a></li>
		<li class="separator"></li>
		<li><a href="#" class="themify_builder_copy_component" data-title="<?php esc_html_e( 'Copy', 'themify' );?>" rel="themify-tooltip-bottom" data-component="{{ data.component_name }}"><span class="ti-files"></span></a></li>
		<li><a href="#" class="themify_builder_paste_component" data-title="<?php esc_html_e( 'Paste', 'themify' );?>" rel="themify-tooltip-bottom" data-component="{{ data.component_name }}"><span class="ti-clipboard"></span></a></li>
		<li class="separator last-sep"></li>
		<li class="themify_builder_column_dragger_li"><a href="#" class="themify_builder_column_dragger"><span class="ti-arrows-horizontal"></span></a></li>
	</ul>
	<div class="themify_module_holder">
                <div class="empty_holder_text"><?php _e('drop module here', 'themify') ?></div>
	</div>
	<div class="column-data-styling" data-styling=""></div>
</script>

<script type="text/html" id="tmpl-builder_sub_row_item">
	<div class="themify_builder_sub_row_top">
		<?php themify_builder_grid_lists('sub_row'); ?>
		<ul class="sub_row_action">
			<li><a href="#" class="themify_builder_export_component" data-title="<?php esc_html_e( 'Export', 'themify' );?>" rel="themify-tooltip-bottom" data-component="sub-row"><span class="ti-export"></span></a></li>
			<li><a href="#" class="themify_builder_import_component" data-title="<?php esc_html_e( 'Import', 'themify' );?>" rel="themify-tooltip-bottom" data-component="sub-row"><span class="ti-import"></span></a></li>
			<li class="separator"></li>
			<li><a href="#" class="themify_builder_copy_component" data-title="<?php esc_html_e( 'Copy', 'themify' );?>" rel="themify-tooltip-bottom" data-component="sub-row"><span class="ti-files"></span></a></li>
			<li><a href="#" class="themify_builder_paste_component" data-title="<?php esc_html_e( 'Paste', 'themify' );?>" rel="themify-tooltip-bottom" data-component="sub-row"><span class="ti-clipboard"></span></a></li>
			<li class="separator"></li>
			<li><a href="#" class="sub_row_duplicate" data-title="<?php esc_html_e( 'Duplicate', 'themify' );?>" rel="themify-tooltip-bottom"><span class="ti-layers"></span></a></li>
			<li><a href="#" class="sub_row_delete" data-title="<?php esc_html_e( 'Delete', 'themify' );?>" rel="themify-tooltip-bottom"><span class="ti-close"></span></a></li>
		</ul>
	</div>

	<div class="themify_builder_sub_row_content"></div>
</script>

<script type="text/html" id="tmpl-builder_row_item">
	<div class="row_inner_wrapper">
		<div class="row_inner">

			<div class="themify_builder_row_top">
				<?php themify_builder_grid_lists(); ?>
				<ul class="row_action">
					<li><a href="#" data-title="<?php _e('Export', 'themify') ?>" class="themify_builder_export_component" data-component="row" rel="themify-tooltip-bottom"><span class="ti-export"></span></a></li>
					<li><a href="#" data-title="<?php _e('Import', 'themify') ?>" class="themify_builder_import_component" data-component="row" rel="themify-tooltip-bottom"><span class="ti-import"></span></a></li>
					<li class="separator"></li>
					<li><a href="#" data-title="<?php _e('Copy', 'themify') ?>" class="themify_builder_copy_component" data-component="row" rel="themify-tooltip-bottom"><span class="ti-files"></span></a></li>
					<li><a href="#" data-title="<?php _e('Paste', 'themify') ?>" class="themify_builder_paste_component" data-component="row" rel="themify-tooltip-bottom"><span class="ti-clipboard"></span></a></li>
					<li class="separator"></li>
					<li><a href="#" data-title="<?php _e('Options', 'themify') ?>" class="themify_builder_option_row" rel="themify-tooltip-bottom"><span class="ti-pencil"></span></a></li>
					<li><a href="#" data-title="<?php _e('Styling', 'themify') ?>" class="themify_builder_style_row" rel="themify-tooltip-bottom"><span class="ti-brush"></span></a></li>
					<li><a href="#" data-title="<?php _e('Duplicate', 'themify') ?>" class="themify_builder_duplicate_row" rel="themify-tooltip-bottom"><span class="ti-layers"></span></a></li>
					<li><a href="#" data-title="<?php _e('Delete', 'themify') ?>" class="themify_builder_delete_row" rel="themify-tooltip-bottom"><span class="ti-close"></span></a></li>
					<li class="separator"></li>
					<li><a href="#" data-title="<?php _e('Toggle Row', 'themify') ?>" class="toggle_row"></a></li>
				</ul>
			</div>

			<div class="themify_builder_row_content"></div>
			<div class="row-data-styling" data-styling=""></div>
		</div>
	</div>
</script>