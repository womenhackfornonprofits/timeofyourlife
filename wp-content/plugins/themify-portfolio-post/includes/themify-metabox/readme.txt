=== Themify Metabox ===
Contributors: themifyme
Plugin Name: Themify Metabox
Tags: metabox, meta-box, fields, settings, option, custom-fields, admin
Requires at least: 3.0
Tested up to: 4.6
Stable tag: 1.0.0

Metabox creation tool with advanced features.

== Description ==

Easily create metaboxes for your posts and custom post types. Please note, this plugin is intended for developers, to see how to use this plugin you can checkout the "example-functions.php" file inside the plugin.

Supported field types

* <strong>textbox</strong>: general text input
* <strong>image</strong>: image uploader, allows user to upload images directly or use the WordPress media browser
* <strong>video</strong>: same as "image" but only allows uploading video files
* <strong>audio</strong>: same as "image" but only allows uploading audio files
* <strong>dropdown</strong>: multiple choice select field
* <strong>radio</strong>
* <strong>checkbox</strong>
* <strong>color</strong>: color picker
* <strong>date</strong>: date and time picker, with options to change the formatting of the date
* <strong>gallery_shortcode</strong>: upload and select multiple images
* <strong>multi</strong>: allows displaying multiple fields in the same row

== Installation ==

1. Upload the whole plugin directory to the `/wp-content/plugins/` directory
2. Activate the plugin through the 'Plugins' menu in WordPress

== Changelogs ==

= 1.0.1 =
* update example-functions.php file with more fields
* refactor fields API
* Fix image field type not showing preview
* Fix audio and video field showing error in console after media browse
* allow adjusting 'size' and 'rows' attributes for textarea field type