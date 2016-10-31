<?php
if (!defined('ABSPATH'))
    exit; // Exit if accessed directly
/**
 * Template Buttons
 * 
 * Access original fields: $mod_settings
 * @author Themify
 */
if (TFCache::start_cache('buttons', self::$post_id, array('ID' => $module_ID))):

    $fields_default = array(
        'mod_title_button' => '',
        'buttons_size' => '',
        'buttons_style'=>'',
        'content_button' => array(),
        'animation_effect' => '',
        'css_button' => ''
    );


    $fields_args = wp_parse_args($mod_settings, $fields_default);
    extract($fields_args, EXTR_SKIP);
    $animation_effect = $this->parse_animation_effect($animation_effect, $fields_args);

    $container_class = implode(' ', apply_filters('themify_builder_module_classes', array(
        'module', 'module-' . $mod_name, $module_ID, $css_button, $animation_effect
                    ), $mod_name, $module_ID, $fields_args)
    );
    $ui_class = implode(' ', array('module-' . $mod_name,$buttons_size,$buttons_style));
    
    $container_props = apply_filters( 'themify_builder_module_container_props', array(
        'id' => $module_ID,
        'class' => $container_class
    ), $fields_args, $mod_name, $module_ID );
    ?>
    <!-- module buttons -->
    <div <?php echo $this->get_element_attributes( $container_props ); ?>>

        <?php if ($mod_title_button != ''): ?>
            <?php echo $mod_settings['before_title'] . wp_kses_post(apply_filters('themify_builder_module_title', $mod_title_button, $fields_args)) . $mod_settings['after_title']; ?>
        <?php endif; ?>

        <?php do_action('themify_builder_before_template_content_render'); ?>

        <div class="<?php echo esc_attr($ui_class); ?>">
            <?php
            foreach (array_filter($content_button) as $content):
               
                $content = wp_parse_args($content, array(
                    'label' => '',
                    'link' => '',
                    'icon' => '',
                    'link_options' => false,
                    'lightbox_width' => '',
                    'lightbox_height' => '',
                    'lightbox_size_unit_width' => '',
                    'lightbox_size_unit_height' => '',
                    'button_color_bg' => false
                ));
                $link_css_clsss = array( 'ui builder_button' );
                $link_attr = array();
                $units = array(
                    'pixels' => 'px',
                    'percents' => '%'
                );

                if( $content['link_options'] === 'lightbox' ) {
                    $content['link'] = themify_get_lightbox_iframe_link( $content['link'] );
                    $link_css_clsss[] = 'themify_lightbox';

                    if( !empty( $content['lightbox_width'] ) || !empty( $content['lightbox_height'] ) ) {
                        $lightbox_settings = array();
                        $lightbox_settings[] = !empty( $content['lightbox_width'] ) 
                            ? $content['lightbox_width'] . (!empty( $content['lightbox_size_unit_width'] ) 
                                ? $units[$content['lightbox_size_unit_width']] : 'px') : '';
                        $lightbox_settings[] = !empty( $content['lightbox_height'] ) 
                            ? $content['lightbox_height'] . (!empty( $content['lightbox_size_unit_height'] ) 
                                ? $units[$content['lightbox_size_unit_height']] : 'px') : '';

                        $link_attr[] = sprintf( 'data-zoom-config="%s"', implode( '|', $lightbox_settings ) );
                    }
                } elseif( $content['link_options'] === 'newtab' ) {
                    $link_attr[] = 'target="_blank"';
                }

                if( !empty( $content['button_color_bg'] ) ) {
                    $link_css_clsss[] = $content['button_color_bg'];
                }
                ?>
                <div class="module-buttons-item">
                    <?php if($content['link']):?>
                        <?php printf( '<a class="%s" %s href="%s">'
                            , implode( ' ', $link_css_clsss )
                            , implode( ' ', $link_attr )
                            , esc_url( $content['link'] ) ); ?>
                    <?php endif;?>
                        <?php if($content['icon']):?>
                            <i class="fa <?php echo $content['icon'];?>"></i>
                        <?php endif;?>
                        <span><?php esc_attr_e($content['label'])?></span>
                    <?php if($content['link']):?>
                        </a>
                    <?php endif;?>
                </div>
            <?php endforeach; ?>
        </div>

        <?php do_action('themify_builder_after_template_content_render'); ?>

    </div>
    <!-- /module buttons -->
<?php endif; ?>
<?php TFCache::end_cache(); ?>