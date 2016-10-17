<?php if(!is_single()){ global $more; $more = 0; } //enable more link ?>

<?php 
/** Themify Default Variables
 *  @var object */
global $themify, $post; ?>

<?php themify_post_before(); // hook ?>

<section id="<?php echo apply_filters('editable_slug', $post->post_name); ?>" <?php post_class('clearfix section-post'.themify_theme_section_category_classes($post->ID)); ?>>
	
	<div class="section-inner">
		<?php themify_post_start(); // hook ?>
	
		<?php if($themify->hide_title != 'yes'): ?>
			<?php themify_before_post_title(); // Hook ?>
			
			<h2 class="section-title"><?php the_title(); ?></h2>
			
			<?php themify_after_post_title(); // Hook ?>
		<?php endif; //section title ?>
	
		<div class="section-content clearfix">

			<?php the_content(themify_check('setting-default_more_text')? themify_get('setting-default_more_text') : __('More &rarr;', 'themify')); ?>
			
			<?php edit_post_link(__('Edit Section', 'themify'), '<span class="edit-button">[', ']</span>'); ?>

		</div>
		<!-- /.section-content -->

		<?php themify_post_end(); // hook ?>
	</div> <!-- /.section-inner -->
	
</section>
<?php themify_post_after(); // hook ?>
<!-- /.section-post -->