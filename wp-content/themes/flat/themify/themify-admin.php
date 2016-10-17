<?php
/**
 * Themify admin page
 *
 * @package Themify
 */

///////////////////////////////////////////
// Create Nav Options
///////////////////////////////////////////
function themify_admin_nav() {
	$theme = wp_get_theme();
	$do = 'menu_page';
	/**
	 * Add Themify menu entry
	 * @since 2.0.2
	 */
	call_user_func( 'add' . "_$do" , 'themify', $theme->display('Name') , 'manage_options', 'themify', 'themify_page', get_template_directory_uri().'/themify/img/favicon.png', '49.3' );
	/**
	 * Add Themify settings page
	 * @since 2.0.2
	 */
	call_user_func( 'add_sub' . $do, 'themify', $theme->display('Name'), __('Themify Settings', 'themify'), 'manage_options', 'themify', 'themify_page' );
	if ( Themify_Builder_Model::builder_check() ) {
		/**
		 * Add Themify Builder Layouts page
		 * @since 2.0.2
		 */
		call_user_func( 'add_sub' . $do, 'themify', __( 'Builder Layouts', 'themify' ), __( 'Builder Layouts', 'themify' ), 'edit_posts', 'edit.php?post_type=tbuilder_layout' );
		/**
		 * Add Themify Builder Layout Parts page
		 * @since 2.0.2
		 */
		call_user_func( 'add_sub' . $do, 'themify', __( 'Builder Layout Parts', 'themify' ), __( 'Builder Layout Parts', 'themify' ), 'edit_posts', 'edit.php?post_type=tbuilder_layout_part' );
	}
	/**
	 * Add Themify Customize submenu entry
	 * @since 2.0.2
	 */
	call_user_func( 'add_sub' . $do, 'themify', 'themify_customize', __( 'Customize', 'themify' ), 'manage_options', 'customize.php' );
	/**
	 * Add submenu entry that redirects to Themify documentation site
	 * @since 2.0.2
	 */
	call_user_func( 'add_sub' . $do, 'themify', $theme->display('Name'), __('Documentation', 'themify'), 'manage_options', 'themify_docs', 'themify_docs' );
}

/*  Pages
/***************************************************************************/

///////////////////////////////////////////
// Themify Documentation
///////////////////////////////////////////
function themify_docs() {
	$theme = wp_get_theme();
	$doc_path = str_replace( 'themify-', '', $theme->get_template() );
	?>
	<script type="text/javascript">window.location = "http://themify.me/docs/<?php echo $doc_path; ?>-documentation";</script>
	<?php
}

///////////////////////////////////////////
// Themify Page
///////////////////////////////////////////
function themify_page() {

	if ( ! current_user_can( 'manage_options' ) )
		wp_die( __( 'You do not have sufficient permissions to update this site.', 'themify' ) );

	if (isset($_GET['action'])) {
		$action = 'upgrade';
		themify_updater();
	}

	global $themify_config;

	// check theme information
	$theme = wp_get_theme();
	$check_theme_name = ( is_child_theme() ) ? $theme->parent()->Name : $theme->display('Name');
	$check_theme_version = ( is_child_theme() ) ? $theme->parent()->Version : $theme->display('Version');

	$themify_has_styling_data = themify_has_styling_data();

	/**
	 * Markup for Themify skins. It's empty if there are no skins
	 * @since 2.1.8
	 * @var string
	 */
	$themify_skins = themify_get_skins();

	/* special admin tab that shows available skins with option to import demo separately for each */
	$skins_and_demos = apply_filters( 'themify_show_skins_and_demos_admin', false );

	/** whether the theme has sample data to import */
	$sample_data = file_exists( THEME_DIR . '/sample/sample-content.zip' );
	?>
	<!-- alerts -->
	<div class="alert"></div>
	<!-- /alerts -->

	<!-- prompts -->
	<div class="prompt-box">
		<div class="show-login">
			<form id="themify_update_form" method="post" action="admin.php?page=themify&action=upgrade&type=theme&login=true&themeversion=latest">
			<p class="prompt-msg"><?php _e('Enter your Themify login info to upgrade', 'themify'); ?></p>
			<p><label><?php _e('Username', 'themify'); ?></label> <input type="text" name="username" class="username" value=""/></p>
			<p><label><?php _e('Password', 'themify'); ?></label> <input type="password" name="password" class="password" value=""/></p>
			<input type="hidden" value="theme" name="type" />
			<input type="hidden" value="true" name="login" />
			<p class="pushlabel"><input name="login" type="submit" value="Login" class="button upgrade-login" /></p>
			</form>
		</div>
		<div class="show-error">
			<p class="error-msg"><?php _e('There were some errors updating the theme', 'themify'); ?></p>
		</div>
	</div>
	<div class="overlay">&nbsp;</div>
	<!-- /prompts -->

	<!-- html -->
	<form id="themify" method="post" action="" enctype="multipart/form-data">
	<p id="theme-title"><?php echo esc_html( $check_theme_name ); ?> <em><?php echo esc_html( $check_theme_version ); ?> (<a href="<?php echo themify_https_esc( 'http://themify.me/changelogs/' ); ?><?php echo get_template(); ?>.txt" class="themify_changelogs" target="_blank" data-changelog="<?php echo themify_https_esc( 'http://themify.me/changelogs/' ); ?><?php echo get_template(); ?>.txt"><?php _e('changelogs', 'themify'); ?></a>)</em></p>
	<p class="top-save-btn">
		<a href="#" class="save-button"><?php _e('Save', 'themify'); ?></a>
	</p>
	<div id="content">

		<!-- nav -->
		<ul id="maintabnav">
			<li class="setting"><a href="#setting"><?php _e( 'Settings', 'themify' ); ?></a></li>
			<?php if ( $themify_has_styling_data ) : ?>
				<li class="styling"><a href="#styling"><?php _e( 'Styling', 'themify' ); ?></a></li>
			<?php endif; // $themify_has_styling_data ?>
			<?php if( $skins_and_demos ) : ?>
				<li class="skins"><a href="#skins"><?php _e( 'Skins & Demos', 'themify' ); ?></a></li>
			<?php endif; ?>
			<?php if ( ! empty( $themify_skins ) && ! $skins_and_demos ) : ?>
				<li class="skins"><a href="#skins"><?php _e( 'Skins', 'themify' ); ?></a></li>
			<?php endif; ?>
			<li class="transfer"><a href="#transfer"><?php _e( 'Transfer', 'themify' ); ?></a></li>
			<?php if( $sample_data && ! $skins_and_demos ) : ?>
				<li class="demo-import"><a href="#demo-import"><?php _e( 'Demo Import', 'themify' ); ?></a></li>
			<?php endif;?>
			<?php if ( themify_allow_update() ) : ?>
				<li class="update-check"><a href="#update-check"><?php _e( 'Update', 'themify' ); ?></a></li>
			<?php endif; ?>
		</ul>
		<!-- /nav -->

		<!------------------------------------------------------------------------------------>

		<!--setting tab -->
		<div id="setting" class="maintab">

			<ul class="subtabnav">
				<?php
				$x = 1;
				foreach($themify_config['panel']['settings']['tab'] as $tab){
					if($x){
						echo '<li class="selected"><a href="' . esc_attr( '#setting-' . themify_scrub_func( $tab['id'] ) ) . '">' . $tab['title'] . '</a></li>';
						$x = 0;
					} else {
						if ( isset( $tab['id'] ) ) {
	                        echo '<li><a href="' . esc_attr( '#setting-' . themify_scrub_func( $tab['id'] ) ) . '">' . $tab['title'] . '</a></li>';
						}
					}
				}
				?>
			</ul>

			<?php $themify_settings_notice = false; ?>
			 <?php foreach($themify_config['panel']['settings']['tab'] as $tab){ ?>
				<!-- subtab: setting-<?php echo themify_scrub_func($tab['id']); ?> -->
				<div id="<?php echo esc_attr( 'setting-' . themify_scrub_func( $tab['id'] ) ); ?>" class="subtab">
					<?php
					if ( ! $themify_settings_notice ) :
						?>
						<div class="themify-info-link"><?php printf( __( 'For more info about the options below, refer to the <a href="%s">General Settings</a> documentation.', 'themify' ), 'http://themify.me/docs/general-settings' ); ?></div>
						<?php
						$themify_settings_notice = true;
					endif; // themify settings notice
					?>
					<?php
					if(is_array($tab['custom-module'])){
						if(isset($tab['custom-module']['title']) && isset($tab['custom-module']['function'])){
							echo themify_fieldset( $tab['custom-module']['title'], $tab['custom-module']['function'], $tab['custom-module'] );
						} else {
							foreach($tab['custom-module'] as $module){
								echo themify_fieldset( $module['title'], $module['function'],$module );
							}
						}
					}
					?>
				</div>
				<!-- /subtab: setting-<?php echo themify_scrub_func($tab['id']); ?> -->
			<?php } ?>

		</div>
		<!--/setting tab -->

		<!------------------------------------------------------------------------------------>

		<?php if ( $themify_has_styling_data ) : ?>
			<?php if( ! isset( $themify_config['panel']['styling'] ) ) : ?>
				<div id="styling" class="maintab">
					<div id="<?php echo esc_attr( 'styling-' . themify_scrub_func( $tab['id'] ) ); ?>" class="subtab">
						<div id="styling" class="maintab">
							<div class="themify-info-link"><?php printf(__('The old Styling panel has discontinued. Please use Appearance > <a href="%s">Customize</a>','themify'),  admin_url('customize.php'))?></div>
						</div>
					</div>
				</div>
			<?php else : ?>
				<!--styling tab -->
				<div id="styling" class="maintab">
			
					<?php if ( get_option( 'themify_customize_notice', 1 ) ) : ?>
						<div class="themify-big-notice black js-customize-notice">
							<h3><?php _e( 'New Customize Panel', 'themify' ); ?></h3>
							<p><strong><?php _e( 'We have a new Customize panel which allows you to customize the theme
							with live preview on the frontend. This Themify Styling panel still works as is,
							but we recommend you to start using the new Customize panel.', 'themify' ); ?></strong></p>
							<p><?php _e( 'Because the Customize panel stores data differently,
							the data in the Themify Styling is not migrated to the Customize panel. You can either start
							fresh by resetting the Themify Styling or use both as you like.',
									'themify' ); ?></p>
							<a href="#" class="button notice-dismiss" data-notice="customize"><?php _e( 'Start Customize', 'themify' ); ?></a>
							<a href="#" class="close notice-dismiss" data-notice="customize">
								<i class="ti-close"></i>
							</a>
						</div>
					<?php endif; ?>
			
					<ul class="subtabnav">
						<?php
						$x = 1;
						if(isset($themify_config['panel']['styling']['tab']['title'])){
							echo '<li class="selected"><a href="' . esc_attr( '#styling-' . themify_scrub_func( $themify_config['panel']['styling']['tab']['title'] ) ) . '">' . $themify_config['panel']['styling']['tab']['title'] . '</a></li>';
						} else {
							foreach($themify_config['panel']['styling']['tab'] as $tab){
								if($x){
									echo '<li class="selected"><a href="' . esc_attr( '#styling-' . themify_scrub_func( $tab['id'] ) ) . '">' . $tab['title'] . '</a></li>';
									$x = 0;
								} else {
									echo '<li><a href="' . esc_attr( '#styling-' . themify_scrub_func( $tab['id'] ) ) . '">' . $tab['title'] . '</a></li>';
								}
							}
						}
						?>
					</ul>
			
					<?php
					if(isset($themify_config['panel']['styling']['tab']['title'])){
					?>
						<!-- subtab: styling-<?php echo themify_scrub_func($themify_config['panel']['styling']['tab']['_a']['title']); ?> -->
						<div id="<?php echo esc_attr( 'styling-' . themify_scrub_func( $themify_config['panel']['styling']['tab']['title'] ) ); ?>" class="subtab">
								<?php
								if(is_array($themify_config['panel']['styling']['tab']['element'])){
									if(isset($themify_config['panel']['styling']['tab']['element']['title']) && isset($themify_config['panel']['styling']['tab']['element']['selector'])){
										echo themify_container(themify_scrub_func($tab['id']), $themify_config['panel']['styling']['tab']['element']);
									} else {
										foreach($themify_config['panel']['styling']['tab']['element'] as $element){
											echo themify_container(themify_scrub_func($themify_config['panel']['styling']['tab']['title']), $element);
										}
									}
								}
								?>
							</div>
							<!-- /subtab: styling-<?php echo themify_scrub_func($tab['_a']['title']); ?> -->
					<?php
					} else {
						foreach($themify_config['panel']['styling']['tab'] as $tab){ ?>
							<!-- subtab: styling-<?php echo themify_scrub_func($tab['id']); ?> -->
							<div id="<?php echo esc_attr( 'styling-' . themify_scrub_func( $tab['id'] ) ); ?>" class="subtab">
								<?php
								if(is_array($tab['element'])){
									if(isset($tab['element']['title']) && isset($tab['element']['selector'])){
										echo themify_container(themify_scrub_func($tab['id']), $tab['element']);
									} else {
										foreach($tab['element'] as $element){
											echo themify_container(themify_scrub_func($tab['id']), $element);
										}
									}
								}
								?>
							</div>
							<!-- /subtab: styling-<?php echo themify_scrub_func($tab['id']); ?> -->
						<?php }
					}
					?>
			
				</div>
				<!--/styling tab -->
			<?php endif; ?>
		<?php endif; // $themify_has_styling_data ?>

		<!------------------------------------------------------------------------------------>

		<!--skins tab -->
		<?php
		if ( ! empty( $themify_skins ) ) : ?>
			<div id="skins" class="maintab">
				<ul class="subtabnav">
					<li class="selected"><a href="#setting-general"><?php _e('Skins', 'themify'); ?></a></li>
				</ul>

				<div id="load-load" class="subtab">
					<?php if( $skins_and_demos ) : ?>
						<div class="themify-info-link"><?php _e( 'Select a skin & import the demo content (demo import is optional). Import demo will import the content (posts/pages), Themify panel settings, menus and widgets as our demo. Erase demo will delete only the imported posts/pages (Themify panel settings, widgets, existing and modified imported posts/pages will not be affected).', 'themify' ); ?></div>
					<?php endif; ?>
					<div class="themify-skins">
						<input type="hidden" name="skin" value="<?php echo esc_url( themify_get( 'skin' ) ); ?>">
						<?php echo themify_get_skins_admin(); ?>
					</div>
				</div>
			</div>
			<!--/skins tab -->
		<?php endif; ?>

		<!------------------------------------------------------------------------------------>

		<!--transfer tab -->
		<div id="transfer" class="maintab">
			<ul class="subtabnav">
				<li><a href="#transfer-import"><?php _e( 'Theme Settings', 'themify' ); ?></a></li>
			</ul>

			<div id="transfer-import" class="subtab">
				<div class="themify-info-link"><?php _e( 'Click "Export" to export the Themify panel data which you can use to import in the future by clicking the "Import" button. Note: this will only export/import the data within the Themify panel (the WordPress settings, widgets, content, comments, page/post settings, etc. are not included).', 'themify' ) ?></div>

				<div class="biggest-transfer-btn">
				<input type="hidden" id="import" />
				 <?php themify_uploader( 'import', array(
							'label' => __('Import', 'themify'),
							'confirm' => __('Import will overwrite all settings and configurations. Press OK to continue, Cancel to stop.', 'themify') )
						); ?>

				<em><?php _e('or', 'themify'); ?></em>
				<?php
				/**
				 * URL of Themify Settings Page properly nonced.
				 * @var String
				 */
				$baseurl = wp_nonce_url(admin_url('admin.php?page=themify'), 'themify_export_nonce');
				$baseurl = add_query_arg( 'export', 'themify', $baseurl );
				?>
				<a href="<?php echo esc_url( $baseurl ) ?>" class="export" id="download-export"><?php _e('Export', 'themify'); ?></a>
				</div>
			</div>

		</div>
		<!--/transfer tab -->

		<?php if( $sample_data && ! $skins_and_demos ) : ?>
		<!--demo import tab -->
		<div id="demo-import" class="maintab">
			<ul class="subtabnav">
				<li><a href="#demo-import"><?php _e( 'Demo Import', 'themify' ); ?></a></li>
			</ul>

			<div id="demo-import" class="subtab demo-import-main">
				<p>
				<a href="#" class="button import-sample-content" data-default="<?php _e( 'Import Demo', 'themify' ); ?>" data-success="<?php _e( 'Done', 'themify' ); ?>" data-importing="<?php _e( 'Importing', 'themify' ) ?>"> <i class="ti-arrow-down"></i> <span><?php _e( 'Import Demo', 'themify' ); ?></span> </a>
				</p>
				<p><?php _e( 'Import Demo will import the content (posts/pages), Themify panel settings, menus and widgets as our demo. Due to copyright reasons, demo images will be replaced with a placeholder image.', 'themify' ); ?></p>
				<p><small><?php printf( __( 'Demo Import might not work for some servers with restrict settings. Sample content can also be imported manually with
WordPress <a href="%s">Tools &gt; Import</a>.', 'themify' ), 'http://themify.me/docs/importing#import-tool' ); ?></small></p>
				<p>
				<a href="#" class="button erase-sample-content" data-default="<?php _e( 'Erase Demo', 'themify' ); ?>" data-erasing="<?php _e( 'Erasing', 'themify' ); ?>" data-success="<?php _e( 'Done', 'themify' ); ?>"> <i class="ti-close"></i> <span><?php _e( 'Erase Demo', 'themify' ); ?></span> </a>
				</p>
				<p><?php _e( 'Erase demo will delete the imported posts/pages. Existing and modified imported post/page will not be deleted. Themify panel settings and widgets will not be removed. You may import the content again later.', 'themify' ); ?></p>
			</div>

		</div>
		<!--/demo import tab -->
		<?php endif; ?>

		<?php if ( themify_allow_update() ) : ?>
		<!--update theme/framework tab -->
		<div id="update-check" class="maintab">
			<ul class="subtabnav">
				<li><a href="#update-main"><?php _e( 'Update', 'themify' ); ?></a></li>
			</ul>

			<div id="update-main" class="subtab update-main">
				<?php
				ob_start();
				themify_check_version( 'tab' );
				$update_message = ob_get_contents();
				ob_end_clean();
				$button_label = __( 'Check for Updates', 'themify' );
				$update_available = __( 'Check for theme and framework updates.', 'themify' );
				if ( isset( $_GET['update'] ) && 'check' == $_GET['update'] ) {
					$button_label = __( 'Check Again', 'themify' );
					$update_available = __( 'No updates available.', 'themify' );
				}

				if ( $update_message ) : ?>
					<?php if ( false !== strpos( $update_message, 'reinstalltheme' ) && false === strpos( $update_message, 'updateready' ) ) : ?>
						<p><a href="<?php echo esc_url( add_query_arg( 'update', 'check', admin_url('admin.php?page=themify') ) ); ?>" class="button big-button update"><span><?php echo esc_html( $button_label ); ?></span></a>
						</p>
						<p><?php echo esc_html( $update_available ); ?></p>
					<?php endif; ?>
					<?php echo !empty( $update_message ) ? $update_message : ''; ?>
				<?php else : ?>
					<p><a href="<?php echo esc_url( add_query_arg( 'update', 'check', admin_url('admin.php?page=themify') ) ); ?>" class="button big-button update"><span><?php echo esc_html( $button_label ); ?></span></a>
					</p>
					<p><?php echo esc_html( $update_available ); ?></p>
				<?php endif; ?>
			</div>
		</div>
		<!--/update theme/framework tab -->
		<?php endif; // user can update_themes ?>

		<!------------------------------------------------------------------------------------>

	</div>
	<!--/content -->

	<?php if( get_option( get_template() . '_themify_import_notice', 1 ) ) : ?>
		<div id="demo-import-notice" class="themify-modal">
		<?php if( $skins_and_demos ) : ?>
			<p><?php _e( 'Skins & Demos', 'themify' ); ?></p>
			<p><?php _e( 'Select a skin and import the demo content as per our demo (optional). You can do this later at the Skins & Demos tab.', 'themify' ); ?></p>
			<div class="skins-demo-import-notice">
				<?php echo themify_get_skins_admin(); ?>
			</div>
		<?php else : ?>
			<h3><?php _e( 'Import Demo', 'themify' ); ?></h3>
			<p><?php _e( 'Would you like to import the demo content to have the exact look as our demo?', 'themify' ); ?></p>
			<p><?php _e( 'You may import or erase demo content later at the Import tab of the Themify panel.', 'themify' ); ?></p>
			<a href="#" class="button import-sample-content" data-default="<?php _e( 'Import Demo', 'themify' ); ?>" data-success="<?php _e( 'Done', 'themify' ); ?>" data-importing="<?php _e( 'Importing', 'themify' ) ?>"> <i class="ti-arrow-down"></i> <span><?php _e( 'Yes, import', 'themify' ); ?></span> </a>
			<a href="#" class="thanks-button dismiss-import-notice"> <?php _e( 'No, thanks', 'themify' ); ?> </a>
		<?php endif; ?>
			<a href="#" class="close dismiss-import-notice"><i class="ti-close"></i></a>
		</div>
		<?php
			// disable the demo import modal after first visit
			update_option( get_template() . '_themify_import_notice', 0 ); ?>
	<?php endif; ?>

	<!-- footer -->
	<div id="bottomtab">
	   <p id="logo"><a href="<?php echo themify_https_esc( 'http://themify.me/logs/framework-changelogs/' ); ?>" data-changelog="http://themify.me/changelogs/themify.txt" target="_blank" class="themify_changelogs">v<?php echo THEMIFY_VERSION; ?></a></p>
		<div class="reset">
			<strong><?php _e( 'Reset', 'themify' ); ?></strong>
			<ul>
				<li><a href="#" id="reset-setting" class="reset-button"><?php _e('Settings', 'themify'); ?></a></li>
				<li><?php if ( $themify_has_styling_data ) : ?>
					<a href="#" id="reset-styling" class="reset-button"><?php _e('Styling', 'themify'); ?></a>
				<?php endif; ?></li>
			</ul>
		</div>
		<p class="btm-save-btn">
			<a href="#" class="save-button"><?php _e('Save', 'themify'); ?></a>
		</p>
	</div>
	<!--/footer -->

	</form>
	<div class="clearBoth"></div>
	<!-- /html -->

	<?php
	do_action('themify_settings_panel_end');
}

/**
 * Return an array of available theme skins
 *
 * @since 2.7.8
 * @return array
 */
function themify_get_skins(){
	// Open Styles Folder
	$dir = trailingslashit( get_template_directory() ) . '/skins';

	$skins = array( array(
		'name' => __( 'No Skin', 'themify' ),
		'version' => null,
		'description' => null,
		'screenshot' => get_template_directory_uri() . '/themify/img/non-skin.gif',
		'has_demo' => false,
	) );
	if ( is_dir( $dir ) ) {
		if( $handle = opendir( $dir ) ){
			// Grab Folders
			while ( false !== ( $dirTwo = readdir($handle) ) ) {
				if( $dirTwo != '.' && $dirTwo != '..' ) {
					$path = trailingslashit( $dir ) . $dirTwo;
					if( is_file( $path . '/style.css' ) ) {
						$info = get_file_data( $path . '/style.css', array( 'Skin Name', 'Version', 'Description', 'Demo URI', 'Required Plugins' ) );
						$skins[$dirTwo] = array(
							'name' => $info[0],
							'version' => $info[1],
							'description' => $info[2],
							'screenshot' => is_file( $path . '/screenshot.png' ) ? get_template_directory_uri().'/skins/'. $dirTwo . '/screenshot.png' : get_template_directory_uri() . '/themify/img/screenshot-na.png',
							'has_demo' => is_file( $path . '/sample-content.zip' ),
							'demo_uri' => $info[3],
							'required_plugins' => $info[4]
						);
					}
				}
			}
			closedir($handle);
		}
	}

	return apply_filters( 'themify_theme_skins', $skins );
}

/**
 * Display the admin field for the theme skins
 *
 * @return string
 */
function themify_get_skins_admin(){
	$data = themify_get_data();
	$skins = themify_get_skins();
	$output = '';

	if( ! empty( $skins ) ) {
		foreach( $skins as $id => $skin ) {
			$selected = trailingslashit( get_template_directory_uri() ) . "skins/{$id}/style.css" == themify_get( 'skin' ) ? 'selected' : '';

			if( ! themify_check( 'skin' ) && $id == 'default' ) {
				$selected = 'selected';
			}

			$output .= '
				<div class="skin-preview '. $selected .'" data-skin="'. $id .'">
				<a href="#"><img src="' . esc_url( $skin['screenshot'] ) . '" alt="' . esc_attr__( 'Skin', 'themify' ) . '" id="' . esc_attr( trailingslashit( get_template_directory_uri() ) . "skins/{$id}/style.css" ) . '" /></a>
				<br />' . $skin['name'];
			if( isset( $skin['demo_uri'] ) && ! empty( $skin['demo_uri'] ) ) {
				$output .= sprintf( ' <span class="view-demo"><a href="%s" target="_blank">%s</a></span>', $skin['demo_uri'], __( 'view demo', 'themify' ) );
			}
			if( $skin['has_demo'] ) {
				$output .= '<div class="skin-demo-content" data-skin="' . esc_attr( $id ) . '">';
					$output .= __( 'Demo:', 'themify' );
					$output .= ' <a href="#" class="skin-demo-import">' . __( 'Import', 'themify' ) . '</a> <a href="#" class="skin-erase-demo">' . __( 'Erase', 'themify' ) . '</a>';
				$output .= '</div>';
				$required_plugins = $skin['required_plugins'];
				if( ! empty( $required_plugins ) ) {
					$required_plugins = array_map( 'trim', explode( ',', $required_plugins ) );
					$required_plugins = array_map( 'themify_get_known_plugin_info', $required_plugins );
				}
				if( ! empty( $required_plugins ) && ! themify_are_plugins_active( wp_list_pluck( $required_plugins, 'path' ) ) ) {
					$all_plugins = get_plugins();
					$output .= '<div class="required-addons themify-modal" style="display: none;">';
						$output .= '<p>' . __( 'This demo requires these plugins/addons:', 'themify' ) . '</p>';
						$output .= '<ul>';
						foreach( $required_plugins as $plugin ) {
							$state = isset( $all_plugins[$plugin['path']] ) ? is_plugin_active( $plugin['path'] ) ? __( '<span class="ti-check"></span>', 'themify' ) : __( 'installed, but not active', 'themify' ) : __( 'not installed', 'themify' );
							$output .= '<li>' . sprintf( "<a href='%s' class='external-link'>%s</a> (%s)", $plugin['page'], $plugin['name'], $state ) . '</li>';
						}
						$output .= '</ul>';
						$output .= '<p>' . sprintf( __( 'If you have an active Themify membership, download the missing addons from the <a href="https://themify.me/member" target="_blank">Member Area</a>. Then install and activate them at <a href="%s" class="external-link">WP Admin > Plugins</a>.', 'themify' ), admin_url( 'plugins.php' ) ) . '</p>';
						$output .= '<a href="#" class="close"><i class="ti-close"></i></a>';
					$output .= '</div>';
				}
			}

			$output .= '</div>';
		}
	}

	return $output;
}

/**
 * Create Settings Fieldset
 *
 * @param string $title
 * @param string $module
 * @param string $attr
 *
 * @return string
 */
function themify_fieldset( $title = '', $module = '', $attr = '' ) {
	$data = themify_get_data();
	$data_param = isset( $data['setting'] ) && isset( $data['setting'][$title] )? $data['setting'][$title] : '';
	if( is_array( $module ) && is_callable( $module ) ) {
		$function = $module;
	} else {
		$function = '';
		$module = trim( $module );
		$module = themify_scrub_func( $module );
		if ( function_exists( 'themify_' . $module ) ) {
			$function = 'themify_' . $module;
		} else if ( function_exists( $module ) ) {
			$function = $module;
		}
		if ( '' == $function ) {
			return '';
		}
	}
	$output = '<fieldset><legend>' . esc_html( $title ) . '</legend>';
	$output .= call_user_func( $function, array(
		'data' => $data_param,
		'attr' => $attr )
	);
	$output .= '</fieldset>';
	return $output;
}

/**
 * Create styles container
 */
function themify_container( $category = '', $element = array() ) {
	$data = themify_get_data();
	$temp = array();
	if(is_array($data)){
		$new_arr = array();
		foreach($data as $name => $value){
			$array = explode('-',$name);
			$path = "";
			foreach($array as $part){
				$path .= "[$part]";
			}
			$new_arr[ $path ] = $value;
		}
		$temp = themify_convert_brackets_string_to_arrays( $new_arr );
	}
	if($element){
		$base_id = $element['id'];
		$output = '	<fieldset><legend>' . esc_html( $element['title'] ) . '</legend>';
		if(is_array($element['module'])){
			foreach($element['module'] as $module){
				if( themify_is_associative_array($module) ) {
					$module_name = $module['name'];
				} else {
					$module_name = $module;
				}

				$title = $element['id'];
				$attr = $module;
				$module = trim(str_replace(array(' ','-','|'),array('','_','hr'),$module_name));
				$value = isset( $temp['styling'][$category][$title][$module] )? $temp['styling'][$category][$title][$module] : '';
				if(function_exists("themify_".$module)){
					$output .=	call_user_func("themify_".$module, array('category' => $category, 'title' => $title, 'value' => $value, 'attr' => $attr, 'id' => $base_id));
				} else {
					if(function_exists($module)){
						$output .=	call_user_func($module, array('category' => $category, 'title' => $title, 'value' => $value, 'attr' => $attr, 'id' => $base_id));
					}
				}
			}
		}
		$output .= '</fieldset>';
		return $output;
	}
}

/**
 * Get details about a known plugin
 *
 * @param $name if omitted, returns the entire list
 * @since 2.8.6
 */
function themify_get_known_plugin_info( $name = '' ) {
	$plugins = array(
		'builder-ab-image'       => array( 'name' => __( 'Builder A/B Image', 'themify' ), 'page' => 'http://themify.me/addons/ab-image', 'path' => 'builder-ab-image/init.php' ),
		'builder-audio'          => array( 'name' => __( 'Builder Audio', 'themify' ), 'page' => 'http://themify.me/addons/audio', 'path' => 'builder-audio/init.php' ),
		'builder-bar-chart'      => array( 'name' => __( 'Builder Bar Chart', 'themify' ), 'page' => 'http://themify.me/addons/bar-chart', 'path' => 'builder-bar-chart/init.php' ),
		'builder-button'         => array( 'name' => __( 'Builder Button Pro', 'themify' ), 'page' => 'http://themify.me/addons/button', 'path' => 'builder-button/init.php' ),
		'builder-contact'        => array( 'name' => __( 'Builder Contact', 'themify' ), 'page' => 'https://themify.me/addons/contact', 'path' => 'builder-contact/init.php' ),
		'builder-countdown'      => array( 'name' => __( 'Builder Countdown', 'themify' ), 'page' => 'http://themify.me/addons/countdown', 'path' => 'builder-countdown/init.php' ),
		'builder-counter'        => array( 'name' => __( 'Builder Counter', 'themify' ), 'page' => 'http://themify.me/addons/counter', 'path' => 'builder-counter/init.php' ),
		'builder-fittext'        => array( 'name' => __( 'Builder FitText', 'themify' ), 'page' => 'http://themify.me/addons/fittext', 'path' => 'builder-fittext/init.php' ),
		'builder-image-pro'      => array( 'name' => __( 'Builder Image Pro', 'themify' ), 'page' => 'http://themify.me/addons/image-pro', 'path' => 'builder-image-pro/init.php' ),
		'builder-infinite-posts' => array( 'name' => __( 'Builder Infinite Posts', 'themify' ), 'page' => 'http://themify.me/addons/infinite-posts', 'path' => 'builder-infinite-posts/init.php' ),
		'builder-line-chart'     => array( 'name' => __( 'Builder Line Chart', 'themify' ), 'page' => 'http://themify.me/addons/line-chart', 'path' => 'builder-line-chart/init.php' ),
		'builder-maps-pro'       => array( 'name' => __( 'Builder Maps Pro', 'themify' ), 'page' => 'https://themify.me/addons/maps-pro', 'path' => 'builder-maps-pro/init.php' ),
		'builder-pie-chart'      => array( 'name' => __( 'Builder Pie Chart', 'themify' ), 'page' => 'http://themify.me/addons/pie-chart', 'path' => 'builder-pie-chart/init.php' ),
		'builder-pointers'       => array( 'name' => __( 'Builder Pointers', 'themify' ), 'page' => 'http://themify.me/addons/pointers', 'path' => 'builder-pointers/init.php' ),
		'builder-pricing-table'  => array( 'name' => __( 'Builder Pricing Table', 'themify' ), 'page' => 'http://themify.me/addons/pricing-table', 'path' => 'builder-pricing-table/init.php' ),
		'builder-progress-bar'   => array( 'name' => __( 'Builder Progress Bar', 'themify' ), 'page' => 'https://themify.me/addons/progress-bar', 'path' => 'builder-progress-bar/init.php' ),
		'builder-slider-pro'     => array( 'name' => __( 'Builder Slider Pro', 'themify' ), 'page' => 'http://themify.me/addons/slider-pro', 'path' => 'builder-slider-pro/init.php' ),
		'builder-tiles'          => array( 'name' => __( 'Builder Tiles', 'themify' ), 'page' => 'http://themify.me/addons/tiles', 'path' => 'builder-tiles/init.php' ),
		'builder-timeline'       => array( 'name' => __( 'Builder Timeline', 'themify' ), 'page' => 'http://themify.me/addons/timeline', 'path' => 'builder-timeline/init.php' ),
		'builder-typewriter'     => array( 'name' => __( 'Builder Typewriter', 'themify' ), 'page' => 'https://themify.me/addons/typewriter', 'path' => 'builder-typewriter/init.php' ),
		'builder-woocommerce'    => array( 'name' => __( 'Builder WooCommerce', 'themify' ), 'page' => 'https://themify.me/addons/woocommerce', 'path' => 'builder-woocommerce/init.php' ),
		'contact-form-7'    => array( 'name' => __( 'Contact Form 7', 'themify' ), 'page' => 'https://wordpress.org/plugins/contact-form-7/', 'path' => 'contact-form-7/wp-contact-form-7.php' ),
		'themify-portfolio-post' => array( 'name' => __( 'Portfolio Posts', 'themify' ), 'page' => 'https://themify.me', 'path' => 'themify-portfolio-post/themify-portfolio-post.php' ),
	);

	if( empty( $name ) ) {
		return $plugins;
	} elseif( isset( $plugins[$name] ) ) {
		return $plugins[$name];
	}
}