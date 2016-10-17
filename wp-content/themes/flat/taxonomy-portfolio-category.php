<?php get_header(); ?>

<?php
/** Themify Default Variables
 *  @var object */
global $themify; ?>

<?php if(is_front_page() && !is_paged()){ get_template_part( 'includes/slider'); } ?>
<?php if(is_front_page() && !is_paged()){ get_template_part( 'includes/welcome-message'); } ?>
		
<!-- layout -->
<div id="layout" class="pagewidth clearfix">

	<?php themify_content_before(); //hook ?>
	<!-- content -->
	<div id="content">
    	<?php themify_content_start(); //hook ?>
	
		<?php 
		/////////////////////////////////////////////
		// Category Title	 							
		/////////////////////////////////////////////
		?>
		
		<h1 class="page-title"><?php single_cat_title(); ?></h1>
		<?php echo $themify->theme->get_category_description(); ?>
		
		<?php
		global $query_string;
		// If it's a taxonomy, set the related post type
		$set_post_type = str_replace('-category', '', $wp_query->query_vars['taxonomy']);
		if( in_array($wp_query->query_vars['taxonomy'], get_object_taxonomies($set_post_type)) ){
			query_posts($query_string.'&post_type='.$set_post_type.'&paged=' . $paged);
		}
		?>

		<?php 
		/////////////////////////////////////////////
		// Loop	 							
		/////////////////////////////////////////////
		?>
		<?php if (have_posts()) : ?>
		
			<!-- loops-wrapper -->
			<div id="loops-wrapper" class="loops-wrapper <?php echo $themify->layout . ' ' . $themify->post_layout; ?>">

				<?php while (have_posts()) : the_post(); ?>
		
					<?php get_template_part( 'includes/loop-portfolio' , 'index'); ?>
		
				<?php endwhile; ?>
							
			</div>
			<!-- /loops-wrapper -->

			<?php get_template_part( 'includes/pagination'); ?>
		
		<?php 
		/////////////////////////////////////////////
		// Error - No Page Found	 							
		/////////////////////////////////////////////
		?>
	
		<?php else : ?>

			<p><?php _e( 'Sorry, nothing found.', 'themify' ); ?></p>
	
		<?php endif; ?>			
	
    	<?php themify_content_end(); //hook ?>
	</div>
	<!-- /#content -->
    <?php themify_content_after() //hook; ?>

	<?php 
	/////////////////////////////////////////////
	// Sidebar							
	/////////////////////////////////////////////
	 if ($themify->layout != "sidebar-none"): get_sidebar(); endif; ?>

</div>
<!-- /#layout -->

<?php get_footer(); ?>