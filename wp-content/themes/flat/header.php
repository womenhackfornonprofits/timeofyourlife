<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
<?php
/** Themify Default Variables
 *  @var object */
global $themify; ?>
<meta charset="<?php bloginfo( 'charset' ); ?>">
<!-- wp_header -->
<?php wp_head(); ?>

</head>

<body <?php body_class(); ?>>
<?php themify_body_start(); // hook ?>
<div id="pagewrap" class="hfeed site">

	<div id="headerwrap">

		<?php themify_header_before(); // hook ?>

		<header id="header" class="section-inner pagewidth" itemscope="itemscope" itemtype="https://schema.org/WPHeader">
		
			<a id="menu-icon" href="#mobile-menu"></a>

        	<?php themify_header_start(); // hook ?>

			<hgroup>
				<?php echo themify_logo_image(); ?>
				<?php if ( $site_desc = get_bloginfo( 'description' ) ) : ?>
					<?php global $themify_customizer; ?>
					<div id="site-description" class="site-description"><?php echo class_exists( 'Themify_Customizer' ) ? $themify_customizer->site_description( $site_desc ) : $site_desc; ?></div>
				<?php endif; ?>
			</hgroup>
			
			<div id="mobile-menu" class="sidemenu sidemenu-off">

				<div class="social-widget">
					<?php dynamic_sidebar('social-widget'); ?>

					<?php if(!themify_check('setting-exclude_rss')): ?>
						<div class="rss"><a href="<?php if(themify_get('setting-custom_feed_url') != ''){ echo themify_get('setting-custom_feed_url'); } else { bloginfo('rss2_url'); } ?>">RSS</a></div>
					<?php endif ?>
				</div>
				<!-- /.social-widget -->

				<?php if(!themify_check('setting-exclude_search_form')): ?>
					<?php get_search_form(); ?>
				<?php endif ?>

				<nav itemscope="itemscope" itemtype="https://schema.org/SiteNavigationElement">
					<?php themify_theme_menu_nav(); ?>
					<!-- /#main-nav -->
				</nav>
				
				<a id="menu-icon-close" href="#"></a>
				
			</div>
			<!-- /#mobile-menu -->

			<?php themify_header_end(); // hook ?>

		</header>
		<!-- /#header -->

        <?php themify_header_after(); // hook ?>

	</div>
	<!-- /#headerwrap -->

	<div id="body" class="clearfix">

		<?php themify_layout_before(); //hook ?>
