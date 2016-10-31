<?php
if ( ! defined( 'ABSPATH' ) )
	exit;

/**
 * Template Fancy Heading
 * 
 * Access original fields: $mod_settings
 * @author Themify
 */
$fields_default = array(
	'heading' => '',
	'heading_tag' => 'h1',
	'sub_heading' => '',
	'animation_effect' => ''
);

$fields_args = wp_parse_args( $mod_settings, $fields_default );
extract( $fields_args, EXTR_SKIP );
$animation_effect = $this->parse_animation_effect( $animation_effect, $fields_args );

$container_class = implode(' ', apply_filters('themify_builder_module_classes', array(
	'module', 'module-' . $mod_name, $module_ID, $animation_effect
	), $mod_name, $module_ID, $fields_args)
);
$container_props = apply_filters( 'themify_builder_module_container_props', array(
	'id' => $module_ID,
	'class' => $container_class
), $fields_args, $mod_name, $module_ID );
?>
<!-- module fancy heading -->
<div<?php echo $this->get_element_attributes( $container_props ); ?>>
	<<?php echo $heading_tag; ?> class="fancy-heading">
		<span class="main-head"><?php echo $heading; ?></span>
		<span class="sub-head"><?php echo $sub_heading; ?></span>
	</<?php echo $heading_tag; ?>>
</div>
<!-- /module fancy heading -->