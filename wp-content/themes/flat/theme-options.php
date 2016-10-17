<?php
/**
 * Main Themify class
 * @package themify
 * @since 1.0.0
 */

class Themify {
	/** Default sidebar layout
	 * @var string */
	public $layout;
	/** Default posts layout
	 * @var string */
	public $post_layout;
	
	public $hide_title;
	public $hide_meta;
	public $hide_meta_author;
	public $hide_meta_category;
	public $hide_meta_comment;
	public $hide_meta_tag;
	public $hide_date;
	public $hide_image;
	
	public $unlink_title;
	public $unlink_image;
	
	public $display_content = '';
	public $auto_featured_image;
	
	public $width = '';
	public $height = '';
	
	public $avatar_size = 96;
	public $page_navigation;
	public $posts_per_page;
	
	public $image_align = '';
	public $image_setting = '';
	
	public $page_id = '';
	public $page_image_width = 978;
	public $query_category = '';
	public $query_post_type = '';
	public $query_taxonomy = '';
	public $paged = '';

	public $use_original_dimensions = '';
	
	/////////////////////////////////////////////
	// Set Default Image Sizes 					
	/////////////////////////////////////////////
	
	// Default Index Layout
	static $content_width = 978;
	static $sidebar1_content_width = 670;
	
	// Default Single Post Layout
	static $single_content_width = 978;
	static $single_sidebar1_content_width = 670;
	
	// Default Single Image Size
	static $single_image_width = 978;
	static $single_image_height = 400;
	
	// Grid4
	static $grid4_width = 144;
	static $grid4_height = 144;
	
	// Grid3
	static $grid3_width = 305;
	static $grid3_height = 305;
	
	// Grid2
	static $grid2_width = 400;
	static $grid2_height = 400;

	// List Grid2 Thumb
	static $grid2_thumb_width = 120;
	static $grid2_thumb_height = 120;
	
	// List Large
	static $list_large_image_width = 400;
	static $list_large_image_height = 400;
	 
	// List Thumb
	static $list_thumb_image_width = 221;
	static $list_thumb_image_height = 221;
	
	// List Post
	static $list_post_width = 978;
	static $list_post_height = 978;

	// Index Portfolio
	static $index_portfolio_image_width = 221;
	static $index_portfolio_image_height = 221;

	// Single Portfolio
	static $single_portfolio_image_width = 640;
	static $single_portfolio_image_height = 640;
	
	// Sorting Parameters
	public $order = 'DESC';
	public $orderby = 'date';

	function __construct() {
		
		///////////////////////////////////////////
		//Global options setup
		///////////////////////////////////////////
		$this->layout = themify_get('setting-default_layout');
		if($this->layout == '' ) $this->layout = 'sidebar1'; 
		
		$this->post_layout = themify_get('setting-default_post_layout');
		if($this->post_layout == '') $this->post_layout = 'list-post'; 
		
		$this->page_title = themify_get('setting-hide_page_title');
		$this->hide_title = themify_get('setting-default_post_title');
		$this->unlink_title = themify_get('setting-default_unlink_post_title');
		
		$this->hide_image = themify_get('setting-default_post_image');
		$this->unlink_image = themify_get('setting-default_unlink_post_image');
		$this->auto_featured_image = !themify_check('setting-auto_featured_image')? 'field_name=post_image, image, wp_thumb&' : '';
		$this->hide_page_image = themify_get( 'setting-hide_page_image' ) == 'yes' ? 'yes' : 'no';
		
		$this->hide_meta = themify_get('setting-default_post_meta');
		$this->hide_meta_author = themify_get('setting-default_post_meta_author');
		$this->hide_meta_category = themify_get('setting-default_post_meta_category');
		$this->hide_meta_comment = themify_get('setting-default_post_meta_comment');
		$this->hide_meta_tag = themify_get('setting-default_post_meta_tag');

		$this->hide_date = themify_get('setting-default_post_date');

		// Set Order & Order By parameters for post sorting
		$this->order = themify_check('setting-index_order')? themify_get('setting-index_order'): 'DESC';
		$this->orderby = themify_check('setting-index_orderby')? themify_get('setting-index_orderby'): 'date';
		
		$this->display_content = themify_get('setting-default_layout_display');
		$this->avatar_size = apply_filters('themify_author_box_avatar_size', 96);
		
		$this->posts_per_page = get_option('posts_per_page');
		
		add_action('template_redirect', array(&$this, 'template_redirect'));
	}

	function template_redirect() {
		
		$post_image_width = $post_image_height = '';
		if (is_page()) {
                    if(post_password_required()){
                        return;
                    }
                    $this->page_id = get_the_ID();
                    $this->post_layout = (themify_get('layout') != "default" && themify_check('layout')) ?
                                        themify_get('layout') : themify_get('setting-default_post_layout');
                    // set default post layout
                    if($this->post_layout == ''){
                            $this->post_layout = 'list-post';
                    }
                    $post_image_width = themify_get('image_width');
                    $post_image_height = themify_get('image_height');
		}
		if(!isset($post_image_width) || $post_image_width===''){
                    $post_image_width = themify_get('setting-image_post_width');
		}
		if(!isset($post_image_height) || $post_image_height===''){
                    $post_image_height = themify_get('setting-image_post_height');
		}


		if( is_singular() ) {
			$this->display_content = 'content';
		}
		
		if($post_image_width==='' || $post_image_height===''){
                    ///////////////////////////////////////////
                    // Setting image width, height
                    ///////////////////////////////////////////
                    switch ($this->post_layout){
                        case 'grid4':
                            $this->width = self::$grid4_width;
                            $this->height = self::$grid4_height;
                        break;
                        case 'grid3':
                            $this->width = self::$grid3_width;
                            $this->height = self::$grid3_height;
                        break;
                        case 'grid2':
                            $this->width = self::$grid2_width;
                            $this->height = self::$grid2_height;
                        break;
                        case 'list-large-image':
                            $this->width = self::$list_large_image_width;
                            $this->height = self::$list_large_image_height;
                        break;
                        case 'list-thumb-image':
                            $this->width = self::$list_thumb_image_width;
                            $this->height = self::$list_thumb_image_height;
                        break;
                        case 'grid2-thumb':
                            $this->width = self::$grid2_thumb_width;
                            $this->height = self::$grid2_thumb_height;
                        break;
                        default :
                            $this->width = self::$list_post_width;
                            $this->height = self::$list_post_height;
                        break;
                    }
                }
		if ($post_image_width>=0) {
			$this->width = $post_image_width;
		}
		if($post_image_height>=0){
			$this->height = $post_image_height;
		}
		
		if( is_page() ) {
			if(get_query_var('paged')):
				$this->paged = get_query_var('paged');
			elseif(get_query_var('page')):
				$this->paged = get_query_var('page');
			else:
				$this->paged = 1;
			endif;
			global $paged;
			$paged = $this->paged;

			$this->layout = (themify_get('page_layout') != 'default' && themify_check('page_layout')) ? themify_get('page_layout') : themify_get('setting-default_page_layout');

			if($this->layout == ''){
                            $this->layout = 'sidebar1';
                        }

			$this->post_layout = (themify_get('layout') != 'default' && themify_check('layout')) ? themify_get('layout') : themify_get('setting-default_post_layout');
			if($this->post_layout == ''){
                            $this->post_layout = 'list-post';
                        }

			$this->page_title = (themify_get('hide_page_title') != 'default' && themify_check('hide_page_title')) ? themify_get('hide_page_title') : themify_get('setting-hide_page_title');
			$this->hide_title = themify_get('hide_title');
			$this->unlink_title = themify_get('unlink_title');
			$this->media_position = 'default' != themify_get('media_position') && themify_check('media_position')? themify_get('media_position'): themify_check('setting-default_media_position')? themify_get('setting-default_media_position'): 'above';
			$this->hide_image = themify_get('hide_image');
			$this->unlink_image = themify_get('unlink_image');

			// Post Meta Values ///////////////////////
			$post_meta_keys = array(
				'_author' 	=> 'post_meta_author',
				'_category' => 'post_meta_category',
				'_comment'  => 'post_meta_comment',
				'_tag' 	 	=> 'post_meta_tag'
			);
			$post_meta_key = 'setting-default_';
			$this->hide_meta = themify_check('hide_meta_all')?
									themify_get('hide_meta_all') : themify_get($post_meta_key . 'post_meta');
			foreach($post_meta_keys as $k => $v){
				$this->{'hide_meta'.$k} = themify_check('hide_meta'.$k)? themify_get('hide_meta'.$k) : themify_get($post_meta_key . $v);
			}

			// Post query or portfolio query ///////////////////
			$post_query_category = themify_get('query_category');
			$portfolio_query_category = themify_get('portfolio_query_category');
			$section_query_category = themify_get('section_query_category');

			if( '' != $portfolio_query_category ) {
				$this->query_category = $portfolio_query_category;
				$this->query_taxonomy = 'portfolio-category';
				$this->query_post_type = 'portfolio';

				if('default' != themify_get('portfolio_hide_meta_all')){
					$this->hide_meta = themify_get('portfolio_hide_meta_all');
				} else {
					$this->hide_meta = themify_check('setting-default_portfolio_index_post_meta_category')?
					themify_get('setting-default_portfolio_index_post_meta_category') : 'yes';
				}
				if('default' != themify_get('portfolio_hide_date')){
					$this->hide_date = themify_get('portfolio_hide_date');
				} else {
					$this->hide_date = themify_check('setting-default_portfolio_index_post_date')?
					themify_get('setting-default_portfolio_index_post_date') : 'yes';
				}

				$this->post_layout = themify_get('portfolio_layout') ? themify_get('portfolio_layout') : themify_get('setting-default_portfolio_index_post_layout');
				if('' == $this->post_layout){
					$this->post_layout = 'list-post';
                                }

				$this->hide_title = themify_get('portfolio_hide_title');
				$this->unlink_title = themify_get('portfolio_unlink_title');
				$this->hide_image = themify_get('portfolio_hide_image');
				$this->unlink_image = themify_get('portfolio_unlink_image');
				$this->display_content = themify_get('portfolio_display_content');
				$this->post_image_width = themify_get('portfolio_image_width');
				$this->post_image_height = themify_get('portfolio_image_height');
				$this->page_navigation = themify_get('portfolio_hide_navigation');
				$this->posts_per_page = themify_get('portfolio_posts_per_page');
				$this->order = themify_get('portfolio_order');
				$this->orderby = themify_get('portfolio_orderby');
                                $img_width = themify_get('portfolio_image_width');
                                $img_height = themify_get('portfolio_image_height');
                                $this->width = $img_width>=0?$img_width:(themify_get('setting-default_portfolio_index_image_post_width')>=0 ?
								themify_get('setting-default_portfolio_index_image_post_width'):
								self::$index_portfolio_image_width);
                                $this->width = $img_height>=0?$img_height:(themify_get('setting-default_portfolio_index_image_post_height')>=0 ?
								themify_get('setting-default_portfolio_index_image_post_height'):
								self::$index_portfolio_image_height);
				
				
			} elseif( '' != $section_query_category ) {
				$this->query_category = $section_query_category;
				$this->query_taxonomy = 'section-category';
				$this->query_post_type = 'section';

				$this->hide_title = themify_get('section_hide_title');
				$this->posts_per_page = themify_get('section_posts_per_page');
				$this->order = themify_get('section_order');
				$this->orderby = themify_get('section_orderby');
			} else {
				$this->query_category = $post_query_category;
				$this->query_taxonomy = 'category';
				$this->query_post_type = 'post';
				if(themify_check('posts_per_page'))
					$this->posts_per_page = themify_get('posts_per_page');
				$this->order = (themify_get('order') && '' != themify_get('order')) ? themify_get('order') : (themify_check('setting-index_order') ? themify_get('setting-index_order') : 'DESC');
				$this->orderby = (themify_get('orderby') && '' != themify_get('orderby')) ? themify_get('orderby') : (themify_check('setting-index_orderby') ? themify_get('setting-index_orderby') : 'date');
				if ( 'default' != themify_get( 'hide_date' ) ) {
					$this->hide_date = themify_get( 'hide_date' );
				} else {
					$this->hide_date = themify_check( 'setting-default_post_date' ) ?
						themify_get( 'setting-default_post_date' ) : 'no';
				}
				$this->display_content = themify_check('display_content')?	themify_get('display_content'): 'excerpt';
			}
		}
		elseif (is_tax('portfolio-category')) {
			$this->post_layout = themify_check('setting-default_portfolio_index_post_layout')? themify_get('setting-default_portfolio_index_post_layout') : 'list-post';

			$this->layout = themify_check('setting-default_portfolio_index_layout')? themify_get('setting-default_portfolio_index_layout') : 'sidebar-none';

			$this->display_content = themify_check('setting-default_portfolio_index_display') ?
										themify_get('setting-default_portfolio_index_display'): 'none';

			$this->hide_title = themify_check('setting-default_portfolio_index_title')? themify_get('setting-default_portfolio_index_title'): 'no';

			$this->unlink_title = themify_check('setting-default_portfolio_index_unlink_post_title')? themify_get('setting-default_portfolio_index_unlink_post_title'): 'no';

			$this->hide_meta = themify_check('setting-default_portfolio_index_post_meta_category')?
					themify_get('setting-default_portfolio_index_post_meta_category') : 'yes';

			$this->hide_date = themify_check('setting-default_portfolio_index_post_date')?
					themify_get('setting-default_portfolio_index_post_date') : 'yes';

			$this->width = themify_get('setting-default_portfolio_index_image_post_width')>=0 ?
								themify_get('setting-default_portfolio_index_image_post_width'):
								self::$index_portfolio_image_width;

			$this->height = themify_get('setting-default_portfolio_index_image_post_height')>=0?
								themify_get('setting-default_portfolio_index_image_post_height'):
								self::$index_portfolio_image_height;
		}
		elseif (is_tax('section-category')) {
			$this->post_layout = themify_check('setting-default_section_index_post_layout')? themify_get('setting-default_section_index_post_layout') : 'list-post';
			$this->layout = themify_check('setting-default_section_index_layout')? themify_get('setting-default_section_index_layout') : 'sidebar-none';
			$this->hide_meta = themify_check('setting-default_section_index_post_meta_category')?
					themify_get('setting-default_section_index_post_meta_category') : 'yes';
			$this->hide_date = themify_check('setting-default_section_index_post_date')?
					themify_get('setting-default_section_index_post_date') : 'yes';
		}
		elseif( is_singular('post') || is_singular('portfolio') ) {
                        $is_portfolio = is_singular('portfolio');
			$this->hide_title = (themify_get('hide_post_title') != 'default' && themify_check('hide_post_title')) ? themify_get('hide_post_title') : themify_get('setting-default_page_post_title');
			$this->unlink_title = (themify_get('unlink_post_title') != 'default' && themify_check('unlink_post_title')) ? themify_get('unlink_post_title') : themify_get('setting-default_page_unlink_post_title');
			$this->hide_date = (themify_get('hide_post_date') != 'default' && themify_check('hide_post_date')) ? themify_get('hide_post_date') : themify_get('setting-default_page_post_date');
			$this->media_position = 'above';

			if(!$is_portfolio){

				if ( themify_get('layout') != 'default' ) {
					$this->layout = themify_get('layout');
				} elseif( themify_check('setting-default_page_post_layout') ) {
					$this->layout = themify_get('setting-default_page_post_layout');
				} else {
					$this->layout = 'sidebar1';
				}

				// Post Meta Values ///////////////////////
				$post_meta_keys = array(
					'_author' 	=> 'post_meta_author',
					'_category' => 'post_meta_category',
					'_comment'  => 'post_meta_comment',
					'_tag' 	 	=> 'post_meta_tag'
				);

				$post_meta_key = is_singular('portfolio')? 'setting-default_portfolio_single_': 'setting-default_page_';
				$this->hide_meta = themify_check('hide_meta_all')?
										themify_get('hide_meta_all') : themify_get($post_meta_key . 'post_meta');
				foreach($post_meta_keys as $k => $v){
					$this->{'hide_meta'.$k} = themify_check('hide_meta'.$k)? themify_get('hide_meta'.$k) : themify_get($post_meta_key . $v);
				}
                                
                                $post_image_width = themify_get('setting-image_post_single_width');
                                $post_image_height = themify_get('setting-image_post_single_height');
                                
			} else {

				if(themify_check('hide_meta_all')){
					$this->hide_meta = themify_get('hide_meta_all');
				} else {
					$this->hide_meta = themify_check('setting-default_portfolio_single_post_meta_category')?
					themify_get('setting-default_portfolio_single_post_meta_category') : 'yes';
				}
				$this->layout = 'sidebar-none';

				$this->hide_title = (themify_get('hide_post_title') != 'default' && themify_check('hide_post_title')) ? themify_get('hide_post_title') : themify_get('setting-default_portfolio_single_title');
				$this->unlink_title = (themify_get('unlink_post_title') != 'default' && themify_check('unlink_post_title')) ? themify_get('unlink_post_title') : themify_get('setting-default_portfolio_single_unlink_post_title');
				$this->hide_date = (themify_get('hide_post_date') != 'default' && themify_check('hide_post_date')) ? themify_get('hide_post_date') : themify_get('setting-default_portfolio_single_post_date');

				$post_image_width = themify_get('setting-default_portfolio_single_image_post_width');
				$post_image_height = themify_get('setting-default_portfolio_single_image_post_height');
			}

			$this->hide_image = (themify_get('hide_post_image') != 'default' && themify_check('hide_post_image')) ? themify_get('hide_post_image') : themify_get('setting-default_page_post_image');
			$this->unlink_image = (themify_get('unlink_post_image') != 'default' && themify_check('unlink_post_image')) ? themify_get('unlink_post_image') : themify_get('setting-default_page_unlink_post_image');

			$this->display_content = '';

			self::$content_width = self::$single_content_width;
			self::$sidebar1_content_width = self::$single_sidebar1_content_width;
                        
                        // Set Default Image Sizes for Single
                        $this->width =$post_image_width>=0?$post_image_width:($is_portfolio?self::$single_portfolio_image_width:self::$single_image_width);
                        $this->height = $post_image_height>=0?$post_image_height:($is_portfolio ?self::$single_portfolio_image_height:self::$single_image_height);
		}
		elseif ( is_singular( 'team' ) ) {
			$teampre = 'setting-default_team_single_';
                        $this->layout = themify_check( $teampre.'layout' ) ?themify_get( $teampre.'layout' ):'sidebar1';
                        $post_image_width = themify_get('setting-default_team_single_image_post_width');
                        $post_image_height = themify_get('setting-default_team_single_image_post_height');
                        if($post_image_width>=0){
                             $this->width = $post_image_width;
                        }
                        if($post_image_height>=0){
                             $this->height = $post_image_height;
                        }
		}
		if ( ! is_singular() ) {
			if(empty($this->width) &&  empty($this->height) && $this->height!=='0'  && ($this->layout === 'sidebar1' || $this->layout === 'sidebar1 sidebar-left')) {
				$ratio = $this->width / self::$content_width;
				$aspect = $this->width == 0 ? 0 : $this->height / $this->width;
				$this->width = round($ratio * self::$sidebar1_content_width);
				if($this->height>0 && $this->width>0){
                                    $this->height = round($this->width * $aspect);
                                }
			}
		}

		if ( is_single() && $this->hide_image != 'yes' ) {
			$this->image_align = themify_get('setting-image_post_single_align');
			$this->image_setting = 'setting=image_post_single&';
		} elseif($this->query_category != '' && $this->hide_image != 'yes') {
			$this->image_align = '';
			$this->image_setting = '';
		} else {
			$this->image_align = themify_get('setting-image_post_align');
			$this->image_setting = 'setting=image_post&';
		}
	}
}

/**
 * Initializes Themify class
 * @since 1.0.0
 */
function themify_global_options(){
	global $themify;
	$themify = new Themify();
	$themify->theme = new Themify_ThemeClass();
}
add_action( 'after_setup_theme','themify_global_options', 12 );