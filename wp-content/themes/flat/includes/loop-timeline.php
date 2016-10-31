<?php
/** Themify Default Variables
 *  @var object */
global $themify; ?>

<?php themify_post_before(); // hook ?>
<li id="timeline-<?php the_id(); ?>" class="clearfix timeline-post">
	<?php themify_post_start(); // hook ?>
	<?php
	$year = get_the_date('Y');
	$month = get_the_date('M');
	?>
	<h3 class="timeline-date">
		<span class="timeline-month"><?php echo $month; ?></span>
		<span class="timeline-year"><?php echo $year; ?></span>
	</h3>
	<!-- /.timeline-date -->

	<div class="timeline-dot">&bull;</div>
	<!-- /timeline-dot -->

	<div class="timeline-content-wrap">

		<div class="timeline-content">

			<?php if('no' != $themify->hide_image && has_post_thumbnail()): ?>
				<?php themify_before_post_image(); // hook ?>
				<figure class="timeline-image">
					<?php
					// Check if user wants to use a common dimension or those defined in each highlight
					if ('yes' == $themify->use_original_dimensions) {
						// Save post id
						$post_id = get_the_id();

						// Set image width
						$themify->width = get_post_meta($post_id, 'image_width', true);

						// Set image height
						$themify->height = get_post_meta($post_id, 'image_height', true);
					}

					themify_image('ignore=true&w='.$themify->width.'&h='.$themify->height); ?>
				</figure>
				<!-- /.timeline-image -->
				<?php themify_after_post_image(); // hook ?>
			<?php endif; // hide image ?>

			<div class="entry-content">

				<?php if($themify->display_content == 'content'): ?>
					<?php the_content(themify_check('setting-default_more_text')? themify_get('setting-default_more_text') : __('More &rarr;', 'themify')); ?>
				<?php endif; //display content ?>

			</div><!-- /.entry-content -->

			<?php edit_post_link(__('Edit Timeline Entry', 'themify'), '<span class="edit-button">[', ']</span>'); ?>

		</div>
		<!-- /.timeline-content -->

	</div>
	<!-- /.timeline-content-wrap -->
	<?php themify_post_end(); // hook ?>
</li>
<!-- /.timeline -->
<?php themify_post_after(); // hook ?>
