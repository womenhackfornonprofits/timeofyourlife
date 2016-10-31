<?php if(!is_single()) { global $more; $more = 0; } //enable more link ?>
<?php
/** Themify Default Variables
 *  @var object */
global $themify; ?>

<?php
$categories = wp_get_object_terms(get_the_id(), 'portfolio-category');
$class = '';
foreach($categories as $cat){
	$class .= ' cat-'.$cat->term_id;
}
?>

<?php themify_post_before(); // hook ?>
<article id="portfolio-<?php the_id(); ?>" class="<?php echo implode(' ', get_post_class('post clearfix portfolio-post' . $class)); ?>">
	<?php themify_post_start(); // hook ?>

	<?php if( $themify->hide_image != 'yes' ) { ?>
		<?php themify_before_post_image(); // hook ?>
		<?php
		// Save portfolio ID
		$portfolio_id = get_the_id();
		$show_slider = is_singular( 'portfolio' )? true: 'slider' == get_post_meta($portfolio_id, 'media_type', true);

		if( $show_slider && themify_check('gallery_shortcode') ) {

			// Get images from [gallery]
			$sc_gallery = preg_replace('#\[gallery(.*)ids="([0-9|,]*)"(.*)\]#i', '$2', themify_get('gallery_shortcode'));
			$image_ids = explode(',', str_replace(' ', '', $sc_gallery));
			$gallery_images = get_posts(array(
				'post__in' => $image_ids,
				'post_type' => 'attachment',
				'post_mime_type' => 'image',
				'numberposts' => -1,
				'orderby' => 'post__in',
				'order' => 'ASC'
			));

			// Get slider options
			$option = 'setting-portfolio_slider';
			$autoplay = themify_check($option.'_autoplay')? themify_get($option.'_autoplay'): '4000';
			$effect = themify_check($option.'_effect')? themify_get($option.'_effect'): 'scroll';
			$speed = themify_check($option.'_transition_speed')? themify_get($option.'_transition_speed'): '500';

			// Append instance to the portfolio ID
			$portfolio_id .= isset($themify->portfolio_instance)? $themify->portfolio_instance: '';

			// Output width and height in style if user enters in Themify Custom Panel
			$style = '';
			if( is_singular('portfolio') ) {
				$slider_width = '';
				$slider_height = '';
				if( $slider_width = themify_get('image_width') ) {
					$slider_width = 'width: '.$slider_width.'px;';
				}
				if( $slider_height = themify_get('image_height') ) {
					$slider_height = 'height: '.$slider_height.'px;';
				}
				$style = 'style="' . $slider_width . ' ' . $slider_width . ' "';
			}
			?>
			<div id="portfolio-slider-<?php echo $portfolio_id; ?>" class="post-image slideshow-wrap" <?php echo $style; ?>>
				<ul class="slideshow" data-id="portfolio-slider-<?php echo $portfolio_id; ?>" data-autoplay="<?php echo $autoplay; ?>" data-effect="<?php echo $effect; ?>" data-speed="<?php echo $speed; ?>">
				<?php foreach ( $gallery_images as $gallery_image ) { ?>
				<li>
					<a href="<?php echo themify_get_featured_image_link(); ?>">
						<?php echo themify_theme_portfolio_image($gallery_image->ID, $themify->width, $themify->height);	?>
						<?php themify_zoom_icon(); ?>
					</a>
					<?php
					if( is_singular('portfolio') ) {
						if('' != $img_caption = $gallery_image->post_excerpt) { ?>
							<div class="slider-image-caption"><?php echo $img_caption; ?></div>
					<?php
						}
					}
					?>
				</li>
				<?php }	?>
				</ul>
			</div>
		<?php
		} else {
			// Check if user wants to use a common dimension or those defined in each highlight
			if ('yes' == $themify->use_original_dimensions) {
				// Save post id
				$post_id = get_the_id();

				// Set image width
				$themify->width = get_post_meta($post_id, 'image_width', true);

				// Set image height
				$themify->height = get_post_meta($post_id, 'image_height', true);
			}

			//otherwise display the featured image
			if( $post_image = themify_get_image('ignore=true&'.$themify->auto_featured_image . $themify->image_setting . "w=".$themify->width."&h=".$themify->height ) ){ ?>
				<figure class="post-image <?php echo $themify->image_align; ?>">
					<?php if( 'yes' == $themify->unlink_image): ?>
						<?php echo $post_image; ?>
					<?php else: ?>
						<a href="<?php echo themify_get_featured_image_link(); ?>"><?php echo $post_image; ?><?php themify_zoom_icon(); ?></a>
					<?php endif; ?>
				</figure><!-- .post-image -->
			<?php } // end if post image
		}
		?>
		<?php themify_after_post_image(); // hook ?>
	<?php } //hide image/slider ?>

	<div class="post-content">
		<?php if($themify->hide_meta != 'yes'): ?>
			<p class="post-meta entry-meta">
				<?php echo ' '. get_the_term_list( get_the_id(), get_post_type().'-category', '<span class="post-category">', ' <span class="separator">/</span> ', ' </span>' ) ?>
			</p>
		<?php endif; //post meta ?>

		<?php if($themify->hide_title != 'yes'): ?>
			<?php themify_before_post_title(); // hook ?>
			<h1 class="post-title entry-title">
				<?php if($themify->unlink_title == 'yes'): ?>
					<?php the_title(); ?>
				<?php else: ?>
					<a href="<?php echo themify_get_featured_image_link(); ?>" title="<?php the_title_attribute(); ?>"><?php the_title(); ?></a>
				<?php endif; //unlink post title ?>
			</h1>
			<?php themify_after_post_title(); // hook ?>
		<?php endif; //post title ?>

		<?php if($themify->hide_date != 'yes'): ?>
			<time datetime="<?php the_time('o-m-d') ?>" class="post-date entry-date updated"><?php echo get_the_date( apply_filters( 'themify_loop_date', '' ) ) ?></time>
		<?php endif; //post date ?>

		<div class="entry-content">

		<?php if ( 'excerpt' == $themify->display_content && ! is_attachment() ) : ?>

			<?php the_excerpt(); ?>

		<?php elseif ( 'none' == $themify->display_content && ! is_attachment() ) : ?>

		<?php else: ?>

			<?php the_content(themify_check('setting-default_more_text')? themify_get('setting-default_more_text') : __('More &rarr;', 'themify')); ?>

		<?php endif; //display content ?>

		</div><!-- /.entry-content -->

		<?php edit_post_link(__('Edit', 'themify'), '<span class="edit-button">[', ']</span>'); ?>
	</div>
	<!-- /.post-content -->
	<?php themify_post_end(); // hook ?>

</article>
<!-- /.post -->
<?php themify_post_after(); //hook ?>
