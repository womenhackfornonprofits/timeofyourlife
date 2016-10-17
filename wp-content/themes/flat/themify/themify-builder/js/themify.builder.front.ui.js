;
var ThemifyPageBuilder, ThemifyLiveStyling, ThemifyBuilderCommon, tinyMCEPreInit, ThemifyBuilderModuleJs;
(function($, _, window, document, undefined) {

	'use strict';

	// Serialize Object Function
	if ('undefined' === typeof $.fn.themifySerializeObject) {
		$.fn.themifySerializeObject = function() {
			var o = {};
			var a = this.serializeArray();
			$.each(a, function() {
				if (o[this.name] !== undefined) {
					if (!o[this.name].push) {
						o[this.name] = [o[this.name]];
					}
					o[this.name].push(this.value || '');
				} else {
					o[this.name] = this.value || '';
				}
			});
			return o;
		};
	}

	// Builder Function
	ThemifyPageBuilder = {
		clearClass: 'col6-1 col5-1 col4-1 col4-2 col4-3 col3-1 col3-2 col2-1 col-full',
		gridClass: ['col-full', 'col4-1', 'col4-2', 'col4-3', 'col3-1', 'col3-2', 'col6-1', 'col5-1'],
		slidePanelOpen: true,
		activeBreakPoint: 'desktop', // default: desktop
		init: function() {
			this.tfb_hidden_editor_object = tinyMCEPreInit.mceInit['tfb_lb_hidden_editor'];
			this.alertLoader = $('<div/>', {
				id: 'themify_builder_alert',
				class: 'themify-builder-alert'
			});
			this.builder_content_selector = '#themify_builder_content-' + themifyBuilder.post_ID;

			// status
			this.editing = false;

			this.bindEvents();

			ThemifyBuilderCommon.Lightbox.setup();
			ThemifyBuilderCommon.LiteLightbox.modal.on('attach', function() {
				this.$el.addClass('themify_builder_lite_lightbox_modal');
			});

			this.setupTooltips();
			this.mediaUploader();
			this.openGallery();

			/**
			 * New instance created on lightbox open, destroyed on lightbox close
			 * @type ThemifyLiveStyling
			 */
			this.liveStylingInstance = new ThemifyLiveStyling();
		},
		bindEvents: function() {
			var self = ThemifyPageBuilder,
				$body = $('body'),
				resizeId,
				eventToUse = 'true' == themifyBuilder.isTouch ? 'touchend' : 'mouseenter mouseleave';

			$body.on( 'change', '.tf-image-gradient-field .tf-radio-input-container input', function(){
                                var $field = $( this ).closest( '.tf-image-gradient-field' ).find( '.themify-gradient-field' );
				if( $( this ).val() === 'image' ) {
                                    $field.hide().end().find( '.themify-image-field' ).show().find('.themify-builder-uploader-input').trigger('change');
				} else {
                                    $field.show().end().find( '.themify-image-field' ).hide();
                                    $field.find('select').trigger('change');
				}
			});

			/* rows */
			$body.on('click', '.themify_builder_toggle_row, .themify_builder_row_js_wrapper .themify_builder_row_top .toggle_row', this.toggleRow)
				.on('click', '.themify_builder_option_row,.themify_builder_style_row', this.optionRow)
				// used for both column and sub-column options
				.on('click', '.themify_builder_option_column', this.optionColumn)

			.on('click', '.themify_builder_content .themify_builder_delete_row', this.deleteRowBuilder)
				.on('click', '.themify_builder_content .themify_builder_duplicate_row', this.duplicateRowBuilder)
				.on('click', '#tfb_module_settings .themify_builder_delete_row, #tfb_row_settings .themify_builder_delete_row', this.deleteRow)
				.on('click', '#tfb_module_settings .themify_builder_duplicate_row, #tfb_row_settings .themify_builder_duplicate_row', this.duplicateRow)

			/* Copy, paste, import, export component (row, sub-row, module) */
			.on('click', '.themify_builder_content .themify_builder_copy_component', this.copyComponentBuilder)
				.on('click', '.themify_builder_content .themify_builder_paste_component', this.pasteComponentBuilder)
				.on('click', '.themify_builder_content .themify_builder_import_component', this.importComponentBuilder)
				.on('click', '.themify_builder_content .themify_builder_export_component', this.exportComponentBuilder)

			/* On component import form save */
			.on('click', '#builder_submit_import_component_form', this.importRowModBuilderFormSave)

			.on(eventToUse, '.themify_builder_row .row_menu', this.MenuHover)
				.on(eventToUse, '.themify_builder_module_front', this.ModHover)
				.on('click', '#tfb_row_settings .add_new a', this.rowOptAddRow);
			$('.themify_builder_row_panel').on(eventToUse, '.module_menu, .module_menu .themify_builder_dropdown', this.MenuHover);

			/* module */
			$body.on('click', '.themify_builder .js--themify_builder_module_styling', this.moduleStylingOption)
				.on('click', '.themify_builder .themify_module_options', this.optionsModule)
				.on('dblclick', '.themify_builder .active_module', this.dblOptionModule)
				.on('click', '.themify_builder .themify_module_duplicate', this.duplicateModule)
				.on('click', '.themify_builder .themify_module_delete', this.deleteModule)
				.on('click', '.add_module', this.addModule)

			/* panel */
			.on('click', '.themify-builder-front-save-title', this.panelSave)
				.on('click', '.themify-builder-front-close', this.panelClose)

			/* Layout Action */
			.on('click', '.layout_preview', this.templateSelected);

			// add support click mobile device
			if (this.is_touch_device()) {
				$body.on('touchstart', '.themify_builder .themify_module_options', this.optionsModule)
					.on('touchstart', '.themify_builder .themify_module_duplicate', this.duplicateModule)
					.on('touchstart', '.themify_builder .themify_module_delete', this.deleteModule);
			}

			$body
				.on('click', '#tfb_module_settings .add_new a', this.moduleOptAddRow)
				.on('click', '#builder_submit_layout_form', this.saveAsLayout)

			.on('mouseenter mouseleave', '.themify_builder_sub_row_top', this.hideColumnStylingIcon);

			$('body').on('builderscriptsloaded.themify', function() {
				if (typeof switchEditors !== 'undefined' && typeof tinyMCE !== 'undefined') {
					//make sure the hidden WordPress Editor is in Visual mode
					switchEditors.go('tfb_lb_hidden_editor', 'tmce');
				}
			});

			// module events
			$(window).resize(function() {
				clearTimeout(resizeId);
				resizeId = setTimeout(function() {
					self.moduleEvents();
				}, 500);
			});

			// add loader to body
			self.alertLoader.appendTo('body').hide();

			// layout icon selected
			$body.on('click', '.tfl-icon', function(e) {
				$(this).addClass('selected').siblings().removeClass('selected');
				e.preventDefault();
			});

			// Front builder
			$('#wp-admin-bar-themify_builder .ab-item:first').on('click', function(e) {
				e.preventDefault();
			});
			$('body').on('click.aftertbloader', 'a.js-turn-on-builder', this.toggleFrontEdit);
			$('.themify_builder_dup_link a').on('click', this.duplicatePage);
			$('.slide_builder_module_panel').on('click', this.slidePanel);

			if (this.is_touch_device()) {
				$body.addClass('touch');
				$body.on('touchstart', '.themify_builder_module_front .module', function(e) {
					$(self.builder_content_selector + ' .themify_builder_module_front').removeClass('tap');
					$(this).parent().addClass('tap');
				}).on('touchend', '.themify_builder_module_front_overlay', function(e) {
					$(this).parent().removeClass('tap');
				});
			}

			// Import links
			$('.themify_builder_import_page > a').on('click', this.builderImportPage);
			$('.themify_builder_import_post > a').on('click', this.builderImportPost);
			$('.themify_builder_import_file > a').on('click', this.builderImportFile);
			$('.themify_builder_load_layout > a').on('click', this.builderLoadLayout);
			$('.themify_builder_save_layout > a').on('click', this.builderSaveLayout);
			$body.on('click', '#builder_submit_import_form', this.builderImportSubmit)

			// Grid Menu List
			.on('click', '.themify_builder_grid_list li a', this._gridMenuClicked)
				.on('click', '.themify_builder_column_alignment li a', this._columnAlignmentMenuClicked)
				.on(eventToUse, '.themify_builder_row .grid_menu', this._gridHover)
				.on('change', '.themify_builder_row .gutter_select', this._gutterChange)
				.on('click', '.themify_builder_sub_row .sub_row_delete', this._subRowDelete)
				.on('click', '.themify_builder_sub_row .sub_row_duplicate', this._subRowDuplicate)
				.on('change', '.themify_builder_equal_column_height_checkbox', this._equalColumnHeightChanged)

			// Undo / Redo buttons
			.on('click', '.js-themify-builder-undo-btn', this.actionUndo)
				.on('click', '.js-themify-builder-redo-btn', this.actionRedo)

			// Builder Revisions
			.on('click', '.themify_builder_load_revision > a, .js-themify-builder-load-revision', ThemifyBuilderCommon.loadRevisionLightbox)
				.on('click', '.themify_builder_save_revision > a, .js-themify-builder-save-revision', ThemifyBuilderCommon.saveRevisionLightbox)
				.on('click', '.js-builder-restore-revision-btn', ThemifyBuilderCommon.restoreRevision)
				.on('click', '.js-builder-delete-revision-btn', ThemifyBuilderCommon.deleteRevision)
				.on('click', '.themify-builder-revision-dropdown-panel', this.toggleRevDropdown)

			// Breakpoint switcher
			.on('click', '.js--themify_builder_breakpoint_switcher', this.breakPointSwitcher)

			// Apply All checkbox
			.on('change', '.style_apply_all', this.applyAll_events)
			.on('editing_module_option', this.bindEventModuleOption.bind(this));

			// Listen to any changes of undo/redo
			ThemifyBuilderCommon.undoManager.instance.setCallback(this.undoManagerCallback);
			this.updateUndoBtns();
			ThemifyBuilderCommon.undoManager.events.on('change', function(event, container, startValue, newValue) {
				ThemifyBuilderCommon.undoManager.set(container, startValue, newValue);
			});

			// Module actions
			self.moduleActions();

			// Ajax Start action
			$(document).on('ajaxSend', this._ajaxStart).on('ajaxComplete', this._ajaxComplete);
		},
		bindEventModuleOption: function( event, moduleSettings ){

			if ( $('.tf-option-checkbox-enable input').length ) {
				$('.tf-option-checkbox-enable input').trigger('change');
			}
			// add new wp editor
			this.addNewWPEditor();

			// set touch element
			this.touchElement();

			// colorpicker
			this.setColorPicker();

			// plupload init
			this.builderPlupload('normal');

			// option binding setup
			this.moduleOptionsBinding();

			// builder drag n drop init
			this.moduleOptionBuilder();

			// tabular options
			if ( $('.themify_builder_tabs').length ) {
				$('.themify_builder_tabs').tabs();
			}

			ThemifyBuilderCommon.Lightbox.rememberRow();
			// "Apply all" // apply all init
			this.applyAll_init();

			// shortcut tabs
			if (ThemifyPageBuilder.isShortcutModuleStyling && $('a[href="#themify_builder_options_styling"]').length ) {
				$('a[href="#themify_builder_options_styling"]').trigger('click');
				ThemifyPageBuilder.isShortcutModuleStyling = false;
			}
            ThemifyBuilderCommon.fontPreview($('#themify_builder_lightbox_container'),moduleSettings);
		},
		checkUnload: function() {
			/* unload event */
			if ($('body').hasClass('themify_builder_active')) {
				window.onbeforeunload = function() {
					return ThemifyBuilderCommon.undoManager.instance.hasUndo() && ThemifyPageBuilder.editing ? themifyBuilder.confirm_on_unload : null;
				};
			}
		},
		// "Apply all" // apply all init
		applyAll_init: function() {
			var $this = this;
			$('.style_apply_all').each(function() {
				var $val = $(this).val(),
					$fields = $(this).closest('.themify_builder_field').prevUntil('h4'),
                                        $last = $fields.last(),
					$inputs = $last.find('input[type="text"]').not('.colordisplay'),
					$selects = $last.find('select'),
					$fieldFilter = $val == 'border' ?
					'[name="border_top_color"], [name="border_top_width"], [name="border_top_style"], [name="border_right_color"], [name="border_right_width"], [name="border_right_style"], [name="border_bottom_color"], [name="border_bottom_width"], [name="border_bottom_style"], [name="border_left_color"], [name="border_left_width"], [name="border_left_style"]' :
					'[name="' + $val + '_top"], [name="' + $val + '_right"], [name="' + $val + '_bottom"], [name="' + $val + '_left"]',
					$preSelect = true,
					$callback = function(e) {
						if ($fields.first().next('.themify_builder_field').find('.style_apply_all').is(':checked')) {
							var $v = $(this).val(),
								$opt = false,
								$select = $(this).is('select');
							
							$fields.not(':last').each(function(){
								if ($select) {
									$opt = $(this).find('select option').prop('selected', false).filter('[value="' + $v + '"]');
									$opt.prop('selected', true);
									if($val!=='border'){
										$opt.trigger('change');
									}
									
								} else {
									$opt = $(this).find('input[type="text"].tfb_lb_option');
									$opt.val($v);
									if($val!=='border'){
										$opt.trigger('keyup');
									}
								}
							});
							if($opt && $val==='border'){
								$this.liveStylingInstance.setApplyBorder($select?$opt.closest('select').prop('name'):$opt.prop('name'),$v,$select?'style':'width');
								if($select){
                                                                    $last.find('input[type="text"].colordisplay').trigger('blur');
								}
							}
						}
					};

				if ($(this).is(':checked')) {
					$fields.not(':last').hide();
					$last.children('.themify_builder_input').css('color', '#FFF');
				} else {
					// Pre-select
					$fields.find($fieldFilter).each(function() {
						if ($(this).val() != '') {
							$preSelect = false;
							return false;
						}
					});

					if ($preSelect) {
						$(this).prop('checked', true);
						$fields.not(':last').hide();
						$last.children('.themify_builder_input').css('color', '#FFF');
					}
				}

				// Events
				$inputs.on('keyup', _.debounce( $callback, 300 ) );
				$selects.on('change', $callback);
			});
		},
		// "Apply all" // apply all events
		applyAll_events: function($selector) {
			var $this = $(this),
				$fields = $this.closest('.themify_builder_field').prevUntil('h4');

			if ($this.prop('checked')) {
                                var $fire = true;
				$fields.not(':last').slideUp(function(){
					if($fire){
						
						$fields.last().find('input[type="text"], select').each(function() {
								var ev = ($(this).prop('tagName') == 'SELECT') ? 'change' : 'keyup';
								$(this).trigger(ev);
						});
						$fire = false;
					}
				});
				$fields.last().children('.themify_builder_input').css('color', '#FFF');
			} else {
				$fields.slideDown();
				$fields.last().children('.themify_builder_input').css('color', '');
			}
		},
		// "Apply all" // apply all color change
		applyAll_verifyBorderColor: function(element, hiddenInputValue, colorDisplayInputValue, minicolorsObjValue, type) {
			var $checkbox = false,
				element = $(element);
			if(element.prop('name').indexOf('border_top_color')!==-1){
					var $fields = element.closest('.themify_builder_field').nextAll('.themify_builder_field');
					$fields.each(function(){
                                                $checkbox = $(this).find('.style_apply_all_border');
						if ( $checkbox.length>0) {
                                                    return false;
						}
					});

				if ( $checkbox  && $checkbox.is(':checked')) {
					var minicolorsObj=null;
					if(type!=='keyup'){
						$('.builderColorSelectInput', $fields).each(function() {
							var $parent = $(this).closest('.themify_builder_input');
								minicolorsObj = $parent.find('.builderColorSelect');
							$(this).val(hiddenInputValue);
							$parent.children('.colordisplay').val(colorDisplayInputValue);
							minicolorsObj.minicolors('value', minicolorsObjValue);
						});	
					}
					else{
						minicolorsObj = element.closest('.themify_builder_input').find('.builderColorSelect');
					}
					this.liveStylingInstance.setApplyBorder(element.prop('name'),minicolorsObj.minicolors('rgbaString'),'color');
				}
			}
		},
		setColorPicker: function(context) {
			// "Apply all" // instance self
			var self = ThemifyPageBuilder;

			$('.builderColorSelect', context).each(function() {
				var $minicolors = $(this),
					// Hidden field used to save the value
					$input = $minicolors.parent().parent().find('.builderColorSelectInput'),
					// Visible field used to show the color only
					$colorDisplay = $minicolors.parent().parent().find('.colordisplay'),
					setColor = '',
					setOpacity = 1.0,
					sep = '_',
					$colorOpacity = $minicolors.parent().parent().find('.color_opacity');

				if ('' != $input.val()) {
					// Get saved value from hidden field
					var colorOpacity = $input.val();
					if (-1 != colorOpacity.indexOf(sep)) {
						// If it's a color + opacity, split and assign the elements
						colorOpacity = colorOpacity.split(sep);
						setColor = colorOpacity[0];
						setOpacity = colorOpacity[1] ? colorOpacity[1] : 1;
					} else {
						// If it's a simple color, assign solid to opacity
						setColor = colorOpacity;
						setOpacity = 1.0;
					}
					// If there was a color set, show in the dummy visible field
					$colorDisplay.val(setColor);
					$colorOpacity.val(setOpacity);
				}

				$minicolors.minicolors({
					opacity: 1,
					textfield: false,
					change: _.debounce(function(hex, opacity) {
						if ('' != hex) {
							if (opacity && '0.99' == opacity) {
								opacity = '1';
							}
							var value = hex.replace('#', '') + sep + opacity;

							var $cssRuleInput = this.parent().parent().find('.builderColorSelectInput');
							$cssRuleInput.val(value);

							$colorDisplay.val(hex.replace('#', ''));
							$colorOpacity.val(opacity);

							// "Apply all" // verify is "apply all" is enabled to propagate the border color
							self.applyAll_verifyBorderColor($cssRuleInput, value, hex.replace('#', ''), hex.replace('#', ''),'change');

							$('body').trigger(
								'themify_builder_color_picker_change', [$cssRuleInput.attr('name'), $minicolors.minicolors('rgbaString')]
							);
						}
					}, 200)
				});
				// After initialization, set initial swatch, either defaults or saved ones
				$minicolors.minicolors('value', setColor);
				$minicolors.minicolors('opacity', setOpacity);
			});

			$('body').on('blur keyup', '.colordisplay', function(e) {
				var $input = $(this),
					tempColor = '',
					$minicolors = $input.parent().find('.builderColorSelect'),
					$field = $input.parent().find('.builderColorSelectInput');
				if ('' != $input.val()) {
					tempColor = $input.val();
				}
				$input.val(tempColor.replace('#', ''));
				$field.val($input.val().replace(/[abcdef0123456789]{3,6}/i, tempColor.replace('#', '')));
				$minicolors.minicolors('value', tempColor);

				// "Apply all" // verify is "apply all" is enabled to propagate the border color
				self.applyAll_verifyBorderColor($field, $field.val(), $input.val(), tempColor,e.type);
			})

			$('body').on('blur keyup', '.color_opacity', function(e) {
				var $input = $(this),
					tempOpacity = '',
					$minicolors = $input.parent().find('.builderColorSelect'),
					$field = $input.parent().find('.builderColorSelectInput');
				if ('' != $input.val()) {
					tempOpacity = $input.val();
				}
				$input.val(tempOpacity);
				$minicolors.minicolors('opacity', tempOpacity);
				// "Apply all" // verify is "apply all" is enabled to propagate the border color
				//self.applyAll_verifyBorderColor($field, $field.val(), $input.val(), tempColor,e.type);
			})
		},
		draggedNotTapped: false,
		moduleEvents: function() {
			var self = ThemifyPageBuilder;

			$('.row_menu .themify_builder_dropdown, .module_menu .themify_builder_dropdown').hide();
			$('.themify_module_holder').each(function() {
				if ($(this).find('.themify_builder_module_front').length > 0) {
					$(this).find('.empty_holder_text').hide();
				} else {
					$(this).find('.empty_holder_text').show();
				}
			});

			$(".themify_builder_module_panel .themify_builder_module").not('.themify_is_premium_module').draggable({
				appendTo: "body",
				helper: "clone",
				revert: 'invalid',
				zIndex: 20000,
				connectToSortable: ".themify_module_holder"
			});

			$('.themify_module_holder').each(function() {
				var startModuleFragment = $(this).closest('.themify_builder_content')[0].innerHTML,
					newModuleFragment;
				$(this).sortable({
					placeholder: 'themify_builder_ui_state_highlight',
					items: '.themify_builder_module_front, .themify_builder_sub_row',
					connectWith: '.themify_module_holder',
					cursor: 'move',
					revert: 100,
					handle: '.themify_builder_module_front_overlay, .themify_builder_sub_row_top',
					tolerance: 'pointer',
					cursorAt: {
						top: 20,
						left: 110
					},
					helper: function() {
						return $('<div class="themify_builder_sortable_helper"/>');
					},
					sort: function(event, ui) {
						$('.themify_module_holder .themify_builder_ui_state_highlight').height(35);
						$('.themify_module_holder .themify_builder_sortable_helper').height(40).width(220);

						if (!$('#themify_builder_module_panel').hasClass('slide_builder_module_state_down')) {
							$('#themify_builder_module_panel').addClass('slide_builder_module_state_down');
							self.slidePanelOpen = false;
							$('#themify_builder_module_panel').find('.slide_builder_module_panel_wrapper').slideUp();
						}
					},
					receive: function(event, ui) {
						self.PlaceHoldDragger();
						$(this).parent().find('.empty_holder_text').hide();
					},
					start: function(event, ui) {
						ThemifyPageBuilder.draggedNotTapped = true;
					},
					stop: function(event, ui) {
						ThemifyPageBuilder.draggedNotTapped = false;
						if (!ui.item.hasClass('active_module') && !ui.item.hasClass('themify_builder_sub_row')) {
							var module_name = ui.item.data('module-name'),
								module_text = ui.item.find('.module_name').text(),
								template = wp.template('builder_add_element'),
								$newElems = $(template({
									slug: module_name,
									name: module_text
								}));

							$(this).parent().find(".empty_holder_text").hide();
							ui.item.addClass('active_module').find('.add_module').hide();
							ui.item.replaceWith($newElems);
							self.moduleEvents();
							$newElems.find('.themify_builder_module_front_overlay').show();
							$newElems.find('.themify_module_options').trigger('click', [true]);
						} else {
							var builder_container = ui.item.closest('.themify_builder_content')[0];
							newModuleFragment = ui.item.closest('.themify_builder_content')[0].innerHTML;

							// Go to module position
							$('html,body').animate({
								scrollTop: ui.item.offset().top - 150
							}, 500);

							// Make sub_row only can nested one level
							if (ui.item.hasClass('themify_builder_sub_row') && ui.item.parents('.themify_builder_sub_row').length) {
								var $clone_for_move = ui.item.find('.active_module').clone();
								$clone_for_move.insertAfter(ui.item);
								ui.item.remove();
							}

							self.newRowAvailable();
							self.moduleEvents();
							self.showSlidingPanel();

							if ( $('.themify_module_holder .themify_builder_sortable_helper').length ) 
								$('.themify_module_holder .themify_builder_sortable_helper').remove();

							if (startModuleFragment !== newModuleFragment) {
								ThemifyBuilderCommon.undoManager.events.trigger('change', [builder_container, startModuleFragment, newModuleFragment]);
							}
						}
						self.editing = true;
					},
					create: function(event, ui) {
						$('body').css('overflow-x', 'inherit');
					}
				});
			});
			$('.themify_builder_content').not('.not_editable_builder').each(function() {
				var startValue = $(this).closest('.themify_builder_content')[0].innerHTML,
					newValue;
				$(this).sortable({
					items: '.themify_builder_row',
					handle: '.themify_builder_row_top',
					axis: 'y',
					placeholder: 'themify_builder_ui_state_highlight',
					sort: function(event, ui) {
						$('.themify_builder_ui_state_highlight').height(35);
					},
					stop: function(event, ui) {
						self.editing = true;
						var builder_container = ui.item.closest('.themify_builder_content')[0];
						newValue = ui.item.closest('.themify_builder_content')[0].innerHTML;
						if (startValue !== newValue) {
							ThemifyBuilderCommon.undoManager.events.trigger('change', [builder_container, startValue, newValue]);
						}
					},
					create: function(event, ui) {
						$('body').css('overflow-x', 'inherit');
					}
				});
			});
			// Column and Sub-Column sortable
			$('.themify_builder_content').not('.not_editable_builder').find('.themify_builder_row_content, .themify_builder_sub_row_content').each(function(){
				var $wrapper = $(this);
				if ( $wrapper.children('.themify_builder_col').length > 1 ) {
					$wrapper.sortable({
						items: '> .themify_builder_col',
						handle: '> .themify_builder_column_action .themify_builder_column_dragger',
						axis: 'x',
						placeholder: 'themify_builder_ui_state_highlight',
						sort: function(event, ui) {
							$('.themify_builder_ui_state_highlight').width( ui.item.width() );
						},
						stop: function( event, ui ){
							$wrapper.children().removeClass('first last');
							$wrapper.children().first().addClass('first');
							$wrapper.children().last().addClass('last');
                                                        ThemifyBuilderCommon.columnDrag($wrapper,false);
						}
					});
				}
			});

			var grid_menu_func = wp.template('builder_grid_menu'),
				tmpl_grid_menu = grid_menu_func({});
			$('.themify_builder_row_content').each(function() {
				$(this).children().each(function() {
					var $holder = $(this).find('.themify_module_holder').first();
					$holder.children('.themify_builder_module_front').each(function() {
						if ($(this).find('.grid_menu').length == 0) {
							$(this).append($(tmpl_grid_menu));
						}
					});
				});
			});

			self._RefreshHolderHeight();
		},
		setupTooltips: function() {
			var setupBottomTooltips = function() {
				$('body').on('mouseover', '[rel^="themify-tooltip-"]', function(e) {
					// append custom tooltip
					var $title = $(this).data('title') ? $(this).data('title') : $(this).prop('title');
					$(this).append('<span class="themify_tooltip">' + $title + '</span>');
				});

				$('body').on('mouseout', '[rel^="themify-tooltip-"]', function(e) {
					// remove custom tooltip
					$(this).children('.themify_tooltip').remove();
				});
			};

			setupBottomTooltips();
                        ThemifyBuilderCommon.setUpTooltip();
		},
		toggleRow: function(e) {
			e.preventDefault();
			$(this).parents('.themify_builder_row').toggleClass('collapsed').find('.themify_builder_row_content').slideToggle();
		},
		deleteRow: function(e) {
			e.preventDefault();
			var row_length = $(this).closest('.themify_builder_row_js_wrapper').find('.themify_builder_row:visible').length;
			if (row_length > 1) {
				$(this).closest('.themify_builder_row').remove();
			} else {
				$(this).closest('.themify_builder_row').hide();
			}
			self.editing = true;
		},
		deleteRowBuilder: function(e) {
			e.preventDefault();

			if (!confirm(themifyBuilder.rowDeleteConfirm)) {
				return;
			}

			var $builder_container = $(this).closest('.themify_builder_content'),
				row_length = $builder_container.find('.themify_builder_row:visible').length,
				self = ThemifyPageBuilder,
				startValue = $builder_container[0].innerHTML;

			if (row_length > 1) {
				$(this).closest('.themify_builder_row').remove();
			} else {
				$(this).closest('.themify_builder_row').hide();
			}
			self.editing = true;

			var newValue = $builder_container[0].innerHTML;
			if (startValue !== newValue) {
				ThemifyBuilderCommon.undoManager.events.trigger('change', [$builder_container[0], startValue, newValue]);
			}
		},
		duplicateRow: function(e) {
			e.preventDefault();

			var self = ThemifyPageBuilder,
				oriElems = $(this).closest('.themify_builder_row'),
				newElems = $(this).closest('.themify_builder_row').clone(),
				row_count = $('#tfb_module_settings .themify_builder_row_js_wrapper').find('.themify_builder_row:visible').length + 1,
				number = row_count + Math.floor(Math.random() * 9);

			// fix wpeditor empty textarea
			newElems.find('.tfb_lb_wp_editor.tfb_lb_option_child').each(function() {
				var this_option_id = $(this).attr('id'),
					element_val;
				if (typeof tinyMCE !== 'undefined') {
					element_val = tinyMCE.get(this_option_id).hidden === false ? tinyMCE.get(this_option_id).getContent() : switchEditors.wpautop(tinymce.DOM.get(this_option_id).value);
				} else {
					element_val = $('#' + this_option_id).val();
				}
				$(this).val(element_val);
				$(this).addClass('clone');
			});

			// fix textarea field clone
			newElems.find('textarea:not(.tfb_lb_wp_editor)').each(function(i) {
				var insertTo = oriElems.find('textarea').eq(i).val();
				$(this).val(insertTo);
			});

			// fix radio button clone
			newElems.find('.themify-builder-radio-dnd').each(function(i) {
				var oriname = $(this).attr('name');
				$(this).attr('name', oriname + '_' + row_count);
				$(this).attr('id', oriname + '_' + row_count + '_' + i);
				$(this).next('label').attr('for', oriname + '_' + row_count + '_' + i);
			});

			newElems.find('.themify-builder-plupload-upload-uic').each(function(i) {
				$(this).attr('id', 'pluploader_' + row_count + number + i + 'themify-builder-plupload-upload-ui');
				$(this).find('input[type="button"]').attr('id', 'pluploader_' + row_count + number + i + 'themify-builder-plupload-browse-button');
				$(this).addClass('plupload-clone');
			});
			newElems.find('select').each(function(i) {
				var orival = oriElems.find('select').eq(i).find('option:selected').val();
				$(this).find('option[value="' + orival + '"]').prop('selected', true);
			});
			newElems.insertAfter(oriElems).find('.themify_builder_dropdown').hide();

			$('#tfb_module_settings').find('.tfb_lb_wp_editor.tfb_lb_option_child.clone').each(function(i) {
				var element = $(this),
					parent_child = element.closest('.themify_builder_input');

				$(this).closest('.wp-editor-wrap').remove();

				var oriname = element.attr('name');
				element.attr('id', oriname + '_' + row_count + number + '_' + i);
				element.attr('class').replace('wp-editor-area', '');

				element.appendTo(parent_child).wrap('<div class="wp-editor-wrap"/>');

			});

			self.addNewWPEditor();
			self.builderPlupload('new_elemn');
			self.moduleEvents();
			if (newElems.find('.builderColorSelect').length > 0) {
				newElems.find('.builderColorSelect').minicolors('destroy').removeAttr('maxlength');
				self.setColorPicker(newElems);
			}
			self.editing = true;
		},
		duplicateRowBuilder: function(e) {
			e.preventDefault();
			var self = ThemifyPageBuilder,
				oriElems = $(this).closest('.themify_builder_row'),
				$builder_container = $(this).closest('.themify_builder_content'),
				builder_id = $builder_container.data('postid'),
				sendData = ThemifyPageBuilder._getSettings(oriElems, 0),
				startValue = $builder_container[0].innerHTML;

			$.ajax({
				type: "POST",
				url: themifyBuilder.ajaxurl,
				dataType: 'json',
				beforeSend: function(xhr) {
					ThemifyBuilderCommon.showLoader('show');
				},
				data: {
					action: 'builder_render_duplicate_row',
					nonce: themifyBuilder.tfb_load_nonce,
					row: sendData,
					id: builder_id,
					builder_grid_activate: 1
				},
				success: function(data) {
					var $newElems = $(data.html);
					$newElems.find('.themify_builder_dropdown').hide();
					oriElems[0].parentNode.insertBefore($newElems[2], oriElems[0].nextSibling);
					self.moduleEvents();
					self.loadContentJs();
					self.editing = true;
					ThemifyBuilderCommon.showLoader('hide');

					var newValue = $builder_container[0].innerHTML;
					if (startValue !== newValue) {
						ThemifyBuilderCommon.undoManager.events.trigger('change', [$builder_container[0], startValue, newValue]);
					}
				}
			});
		},
		menuTouched: [],
		MenuHover: function(e) {
			if ('touchend' == e.type) {
				var $row = $(this).closest('.themify_builder_row'),
					$col = $(this).closest('.themify_builder_col'),
					$mod = $(this).closest('.themify_builder_module'),
					index = 'row_' + $row.index();
				if ($col.length > 0) {
					index += '_col_' + $col.index();
				}
				if ($mod.length > 0) {
					index += '_mod_' + $mod.index();
				}
				if (ThemifyPageBuilder.menuTouched[index]) {
					$(this).find('.themify_builder_dropdown_front').stop(false, true).css('z-index', '').hide();
					$(this).find('.themify_builder_dropdown_front ul').stop(false, true).hide();
					$(this).find('.themify_builder_dropdown').stop(false, true).hide();
					$row.css('z-index', '');
					ThemifyPageBuilder.menuTouched = [];
				} else {
					var $builderCont = $('.themify_builder_content');
					$builderCont.find('.themify_builder_dropdown').stop(false, true).hide();
					$builderCont.find('.themify_builder_dropdown_front').stop(false, true).hide();
					$builderCont.find('.themify_builder_dropdown_front ul').stop(false, true).hide();
					$builderCont.find('.themify_builder_row').css('z-index', '');
					$(this).find('.themify_builder_dropdown').stop(false, true).show();
					$row.css('z-index', '998');
					ThemifyPageBuilder.menuTouched = [];
					ThemifyPageBuilder.menuTouched[index] = true;
				}
			} else if (e.type == 'mouseenter') {
				$(this).find('.themify_builder_dropdown').stop(false, true).show();
			} else if (e.type == 'mouseleave') {
				$(this).find('.themify_builder_dropdown').stop(false, true).hide();
			}
		},
		highlightModuleFront: function($module) {
			$('.themify_builder_content .module_menu_front').removeClass('current_selected_module');
			$module.addClass('current_selected_module');
		},
		ModHover: function(e) {
			if ('touchend' == e.type) {
				if (!ThemifyPageBuilder.draggedNotTapped) {
					ThemifyPageBuilder.draggedNotTapped = false;
					var $row = $(e.currentTarget).closest('.themify_builder_row'),
						$col = $(e.currentTarget).closest('.themify_builder_col'),
						$mod = $(e.currentTarget).closest('.themify_builder_module'),
						index = 'row_' + $row.index();
					if ($col.length > 0) {
						index += '_col_' + $col.index();
					}
					if ($mod.length > 0) {
						index += '_mod_' + $mod.index();
					}
					if (ThemifyPageBuilder.menuTouched[index]) {
						$(e.currentTarget).find('.themify_builder_dropdown_front').stop(false, true).css('z-index', '').hide();
						$(e.currentTarget).find('.themify_builder_dropdown_front ul').stop(false, true).hide();
						$(e.currentTarget).find('.themify_builder_dropdown').stop(false, true).hide();
						ThemifyPageBuilder.menuTouched = [];
					} else {
						var $builderCont = $('.themify_builder_content');
						$builderCont.find('.themify_builder_dropdown_front').stop(false, true).css('z-index', '').hide();
						$builderCont.find('.themify_builder_dropdown_front ul').stop(false, true).hide();
						$builderCont.find('.themify_builder_dropdown').stop(false, true).hide();
						$(e.currentTarget).find('.themify_builder_dropdown_front').stop(false, true).css('z-index', '999').show();
						$(e.currentTarget).find('.themify_builder_dropdown_front ul').stop(false, true).show();
						ThemifyPageBuilder.menuTouched = [];
						ThemifyPageBuilder.menuTouched[index] = true;
					}
				}
			} else if (e.type == 'mouseenter') {
				$(e.currentTarget).find('.themify_builder_module_front_overlay').stop(false, true).show();
				$(e.currentTarget).find('.themify_builder_dropdown_front').stop(false, true).show();
			} else if (e.type == 'mouseleave') {
				$(e.currentTarget).find('.themify_builder_module_front_overlay').stop(false, true).hide();
				$(e.currentTarget).find('.themify_builder_dropdown_front').stop(false, true).hide();
			}
		},
		isShortcutModuleStyling: false,
		moduleStylingOption: function(event) {
			event.preventDefault();
			ThemifyPageBuilder.isShortcutModuleStyling = true;
			$(this).closest('ul').find('.themify_module_options').trigger('click');
		},
		createGradientPicker : function( $input, value ) {
                        if(typeof $.fn.ThemifyGradient==='undefined'){
                            return;
                        }
                        var $field = $input.closest( '.themify-gradient-field' ),
                            instance = null, // the ThemifyGradient object instance
                            isTrigger = false,
                            args = {
                                   onChange : function(stringGradient, cssGradient, asArray){ 
                                            
                                                $input.val( stringGradient );
                                                $field.find( '.themify-gradient-css' ).val( cssGradient );  
                                            if(isTrigger){
                                                var $is_cover = $input.prop('name')==='cover_gradient-gradient',
                                                rgbaString = ThemifyPageBuilder.liveStylingInstance.bindBackgroundGradient($input.data('id'),cssGradient,$is_cover);
                                                if($is_cover && rgbaString){
                                                    ThemifyPageBuilder.liveStylingInstance.addOrRemoveComponentOverlay(rgbaString,true);
                                                }
                                            }
                                   }
                           };
			if( value ) {
				args.gradient = value;
			}
			else {
				if( $input.attr( 'data-default-gradient' ) ) {
					args.gradient = $input.attr( 'data-default-gradient' );
				} else {
					args.gradient = []; // empty gradient
				}
			}
			$input.prev().ThemifyGradient( args );
			instance = $input.prev().data( 'ThemifyGradient' );
			$field.find( '.themify-clear-gradient' ).on( 'click', function(e){
				e.preventDefault();
				instance.settings.gradient = '0% rgba(255,255,255, 1)|100% rgba(255,255,255,1)';
				instance.update();
				$input.add( $field.find( '.themify-gradient-css' ) ).val( '' ).trigger( 'change' );
                                if($input.prop('name')==='cover_gradient-gradient'){
                                     ThemifyPageBuilder.liveStylingInstance.addOrRemoveComponentOverlay('');
                                }
			} );

			// $( 'body' ).on( 'themify_builder_lightbox_resize', function(){
				// instance.settings.width = $field.width();
				// instance.settings.gradient = $input.val();
				// instance.update();
			// } );
                        // angle input
			var $angleInput = $field.find( '.themify-gradient-angle' );
                        
			// Linear or Radial select field
			$field.find( '.themify-gradient-type' ).on( 'change', function(){
				instance.setType( $( this ).val() );
                                var $angelparent = $angleInput.closest('.gradient-angle-knob'),
                                    $radial_circle = $field.find('.themify-radial-circle');
                                if($( this ).val()==='radial'){
                                    $angelparent.hide();
                                    $angelparent.next('span').hide();
                                    $radial_circle.show();
                                }
                                else{
                                    $angelparent.show();
                                    $angelparent.next('span').show();
                                    $radial_circle.hide();
                                }
			} )
			.trigger( 'change' ); // required: the option's value is set before the event handler is registered, trigger change manually to patch this
                        
                        $field.find('.themify-radial-circle input').on('change',function(){
                            instance.setRadialCircle( $( this ).is(':checked'));
                        }).trigger( 'change' );
			
			$angleInput.on( 'change', function(){
                            var $val = parseInt($( this ).val());
                                if(!$val){
                                    $val = 0;
                                }
				instance.setAngle($val);
			} ).knob({
				change: function(v) {
					instance.setAngle( Math.round( v ) );
				}
			});
			$angleInput.trigger('change'); // required

			// angle input popup style
			$angleInput.removeAttr( 'style' )
				.focus(function(){
					$( this ).parent().find( 'canvas' ).show();
				})
				.parent().addClass( 'gradient-angle-knob' )
				.hover( function(){
					$( this ).addClass( 'gradient-angle-hover-state' );
				}, function(){
					$( this ).removeClass( 'gradient-angle-hover-state' );
				} )
				.find( 'canvas' )
					.insertAfter( $angleInput );
			$( document ).bind( 'click', function() {
				if ( ! $angleInput.parent().is('.gradient-angle-hover-state')) {
					$angleInput.parent().find('canvas').hide('fast');
				}
			});
                        //for image_and_gradient
                        setTimeout(function(){
                            isTrigger = true;
                            $field.closest('.tf-image-gradient-field').find('.tf-option-checkbox-js:checked').trigger('change');
                        },900);
		},
		optionsModule: function(event, isNewModule) {
			event.preventDefault();
			isNewModule = isNewModule || false; // assume that if isNewModule:true = Add module, otherwise Edit Module

			var self = ThemifyPageBuilder,
				$this = $(this),
				module_name = $this.data('module-name'),
				$moduleWrapper = $this.closest('.themify_builder_module_front'),
				$currentStyledModule = $moduleWrapper.children('.module'),
				moduleSettings = ThemifyBuilderCommon.getModuleSettings($moduleWrapper),
				is_settings_exist = typeof moduleSettings !== 'string' ? true : false;

			$('.module_menu .themify_builder_dropdown').hide();

			self.highlightModuleFront($this.closest('.module_menu_front'));

			var callback = function(response) {
				if (isNewModule) {
					response.setAttribute('data-form-state', 'new');
				} else {
					response.setAttribute('data-form-state', 'edit');
				}
				$('<div/>', {
					class: 'tfb_module_settings_entire_data'
				}).data('entire-data', moduleSettings).appendTo($('#tfb_module_settings'));
				if ('desktop' !== self.activeBreakPoint) {
					var styleFields = $('#themify_builder_options_styling .tfb_lb_option').map(function() {
						return $(this).attr('id');
					}).get();
					moduleSettings = _.omit(moduleSettings, styleFields);

					if (!_.isUndefined(moduleSettings['breakpoint_' + self.activeBreakPoint]) && _.isObject(moduleSettings['breakpoint_' + self.activeBreakPoint])) {
						moduleSettings = _.extend(moduleSettings, moduleSettings['breakpoint_' + self.activeBreakPoint]);
					}
				}
                                
                                self.liveStylingInstance.init($currentStyledModule, moduleSettings);
                                
				var is_settings_exist = typeof moduleSettings !== 'string' ? true : false;
                                
				var inputs = response.getElementsByClassName('tfb_lb_option'),
					iterate;
				for (iterate = 0; iterate < inputs.length; ++iterate) {
					var $this_option = $(inputs[iterate]),
						this_option_id = $this_option.attr('id'),
						$found_element = moduleSettings[this_option_id];

					if( $this_option.hasClass( 'themify-gradient' ) ) {
						ThemifyPageBuilder.createGradientPicker( $this_option, $found_element );
					} else if ( $this_option.hasClass( 'tf-radio-input-container' ) ) {
						//@todo move this
						$this_option.find( ':checked' ).trigger('change');
					}
					if ($found_element) {
						if ($this_option.hasClass('select_menu_field')) {
							if (!isNaN($found_element)) {
								$this_option.find("option[data-termid='" + $found_element + "']").attr('selected', 'selected');
							} else {
								$this_option.find("option[value='" + $found_element + "']").attr('selected', 'selected');
							}
						} else if ($this_option.is('select')) {
							$this_option.val($found_element).trigger('change');
						} else if ($this_option.hasClass('themify-builder-uploader-input')) {
							var img_field = $found_element,
								img_thumb = $('<img/>', {
									src: img_field,
									width: 50,
									height: 50
								});

							if (img_field != '') {
								$this_option.val(img_field);
								$this_option.parent().find('.img-placeholder').empty().html(img_thumb);
							} else {
								$this_option.parent().find('.thumb_preview').hide();
							}

						} else if ($this_option.hasClass('themify-option-query-cat')) {
							var parent = $this_option.parent(),
								multiple_cat = parent.find('.query_category_multiple'),
								elems = $found_element,
								value = elems.split('|'),
								cat_val = value[0];

							multiple_cat.val(cat_val);
							parent.find("option[value='" + cat_val + "']").attr('selected', 'selected');

						} else if ($this_option.hasClass('themify_builder_row_js_wrapper')) {
							var row_append = 0;
							if ($found_element.length > 0) {
								row_append = $found_element.length - 1;
							}

							// add new row
							for (var i = 0; i < row_append; i++) {
								$this_option.parent().find('.add_new a').first().trigger('click');
							}

							$this_option.find('.themify_builder_row').each(function(r) {
								$(this).find('.tfb_lb_option_child').each(function(i) {
									var $this_option_child = $(this),
										this_option_id_real = $this_option_child.attr('id'),
										this_option_id_child = $this_option_child.hasClass('tfb_lb_wp_editor') ? $this_option_child.attr('name') : $this_option_child.data('input-id');
									if (!this_option_id_child) {
										this_option_id_child = this_option_id_real;
									}
									var $found_element_child = $found_element[r]['' + this_option_id_child + ''];

									if ($this_option_child.hasClass('themify-builder-uploader-input')) {
										var img_field = $found_element_child,
											img_thumb = $('<img/>', {
												src: img_field,
												width: 50,
												height: 50
											});

										if (img_field != '' && img_field != undefined) {
											$this_option_child.val(img_field);
											$this_option_child.parent().find('.img-placeholder').empty().html(img_thumb).parent().show();
										} else {
											$this_option_child.parent().find('.thumb_preview').hide();
										}

									} else if ($this_option_child.hasClass('tf-radio-choice')) {
										$this_option_child.find("input[value='" + $found_element_child + "']").attr('checked', 'checked').trigger( 'change' );
									} else if ($this_option_child.hasClass('themify-layout-icon')) {
										$this_option_child.find('#' + $found_element_child).addClass('selected');
									} else if ($this_option_child.hasClass('themify-checkbox')) {
										for (var $i in $found_element_child) {

											$this_option_child.find("input[value='" + $found_element_child[$i] + "']").prop('checked', true);
										}
									} else if ($this_option_child.is('input, textarea, select')) {
										$this_option_child.val($found_element_child);
									}

									if ($this_option_child.hasClass('tfb_lb_wp_editor') && !$this_option_child.hasClass('clone')) {
										self.initQuickTags(this_option_id_real);
										if (typeof tinyMCE !== 'undefined') {
											self.initNewEditor(this_option_id_real);
										}
									}

								});
							});

						} else if ($this_option.hasClass('tf-radio-input-container')) {
							$this_option.find("input[value='" + $found_element + "']").prop('checked', true).trigger('change');
							var selected_group = $this_option.find('input[name="' + this_option_id + '"]:checked').val();

							// has group element enable
							if ($this_option.hasClass('tf-option-checkbox-enable')) {
								$this_option.find('.tf-group-element').hide();
								$this_option.find('.tf-group-element-' + selected_group).show();
							}

						} else if ($this_option.is('input[type!="checkbox"][type!="radio"], textarea')) {
							$this_option.val($found_element).trigger('change');
							if (!isNewModule && $this_option.is('textarea') && $this_option.hasClass('tf-thumbs-preview')) {
								self.getShortcodePreview($this_option, $found_element);
							}

						} else if ($this_option.hasClass('themify-checkbox')) {
							var cselected = $found_element;
							cselected = cselected.split('|');

							$this_option.find('.tf-checkbox').each(function() {
								if ($.inArray($(this).val(), cselected) > -1) {
									$(this).prop('checked', true);
								} else {
									$(this).prop('checked', false);
								}
							});

						} else if ($this_option.hasClass('themify-layout-icon')) {
							$this_option.find('#' + $found_element).addClass('selected');
						} else {
							$this_option.html($found_element);
						}
					} else {
						if ($this_option.hasClass('themify-layout-icon')) {
							$this_option.children().first().addClass('selected');
						} else if ($this_option.hasClass('themify-builder-uploader-input')) {
							$this_option.parent().find('.thumb_preview').hide();
						} else if ($this_option.hasClass('tf-radio-input-container')) {
							$this_option.find('input[type="radio"]').first().prop('checked');
							var selected_group = $this_option.find('input[name="' + this_option_id + '"]:checked').val();

							// has group element enable
							if ($this_option.hasClass('tf-option-checkbox-enable')) {
								$('.tf-group-element').hide();
								$('.tf-group-element-' + selected_group).show();
							}
						} else if ($this_option.hasClass('themify_builder_row_js_wrapper')) {
							$this_option.find('.themify_builder_row').each(function(r) {
								$(this).find('.tfb_lb_option_child').each(function(i) {
									var $this_option_child = $(this),
										this_option_id_real = $this_option_child.attr('id');

									if ($this_option_child.hasClass('tfb_lb_wp_editor')) {

										var this_option_id_child = $this_option_child.data('input-id');

										self.initQuickTags(this_option_id_real);
										if (typeof tinyMCE !== 'undefined') {
											self.initNewEditor(this_option_id_real);
										}
									}

								});
							});
						} else if ($this_option.hasClass('themify-checkbox') && is_settings_exist) {
							$this_option.find('.tf-checkbox').each(function() {
								$(this).prop('checked', false);
							});
						} else if ($this_option.is('input[type!="checkbox"][type!="radio"], textarea') && is_settings_exist) {
							$this_option.val('');
						}
					}

					if ($this_option.hasClass('tfb_lb_wp_editor')) {
						self.initQuickTags(this_option_id);
						if (typeof tinyMCE !== 'undefined') {
							self.initNewEditor(this_option_id);
						}
					}
				} //iterate

				console.time('moduleOption');

				// Trigger event
				$('body').trigger('editing_module_option', [moduleSettings]);
                                $('.tf-option-checkbox-enable input:checked').trigger('change');

                console.timeEnd('moduleOption');
			};

			ThemifyBuilderCommon.highlightRow($(this).closest('.themify_builder_row'));

			// Start capture undo action
			var $startValueRaw = $(this).closest('.themify_builder_content').clone(),
				startValue;
			if (isNewModule) {
				$startValueRaw.find('.current_selected_module').closest('.active_module').remove();
				startValue = $startValueRaw[0].innerHTML;
			} else {
				startValue = $(this).closest('.themify_builder_content')[0].innerHTML;
			}
			ThemifyBuilderCommon.undoManager.setStartValue(startValue);

			ThemifyBuilderCommon.Lightbox.open({
				loadMethod: 'inline',
				templateID: 'builder_form_module_' + module_name
			}, function(response){
				setTimeout(function(){
					callback(response);
				}, 400)
			});
		},
		_objectAssocLength: function(obj) {
			var size = 0,
				key;
			for (key in obj) {
				if (obj.hasOwnProperty(key))
					size++;
			}
			return size;
		},
		moduleOptionsBinding: function () {
			var form = $('#tfb_module_settings');
			$(form).on( 'change', 'input[data-binding], textarea[data-binding], select[data-binding]',function () {
				var logic = false,
					$self = $( this ),
					binding = $(this).data('binding'),
					val = $(this).val();
				if( $( this ).hasClass( 'tf-checkbox' ) ) {
					if( $( this ).is( ':checked' ) && binding['checked'] != undefined ) {
						logic = binding['checked'];
					} else if( ! $( this ).is( 'checked' ) && binding['not_checked'] != undefined ) {
						logic = binding['not_checked'];
					}
				} else {
				if (val == '' && binding['empty'] != undefined) {
					logic = binding['empty'];
				} else if (val != '' && binding[val] != undefined) {
					logic = binding[val];
				} else if (val != '' && binding['not_empty'] != undefined) {
					logic = binding['not_empty'];
				}
				}

				if (logic) {
					if (logic['show'] != undefined) {
						$.each(logic['show'], function (i, v) {
							var optionRow = $self.closest('.themify_builder_row_content');
							if( optionRow.length ) {
								optionRow.find('.' + v).removeClass( 'conditional-input' );
								optionRow.find('.' + v).children().show();
							} else {
								$('.' + v).removeClass( 'conditional-input' );
								$('.' + v).children().show();
							}
						});
					}
					if (logic['hide'] != undefined) {
						$.each(logic['hide'], function (i, v) {
							var optionRow = $self.closest('.themify_builder_row_content');
							if( optionRow.length ) {
								optionRow.find('.' + v).addClass( 'conditional-input' );
								optionRow.find('.' + v).children().hide();
							} else {
								$('.' + v).addClass( 'conditional-input' );
								$('.' + v).children().hide();
							}
						});
					}
				}
			});
			$( 'input[data-binding], textarea[data-binding], select[data-binding]', form ).trigger( 'change' );
		},
		dblOptionModule: function(e) {
			e.preventDefault();
			$(this).find('.themify_module_options').trigger('click');
		},
		duplicateModule: function(e) {
			e.preventDefault();
			var holder = $(this).closest('.themify_builder_module_front'),
				self = ThemifyPageBuilder,
				temp_appended_data = JSON.parse(holder.find('.front_mod_settings').find('script[type="text/json"]').text()),
				module_slug = holder.find('.front_mod_settings').data('mod-name'),
				$builder_container = $(this).closest('.themify_builder_content'),
				builder_id = $builder_container.data('postid'),
				startValue = $builder_container[0].innerHTML;

			$.ajax({
				type: "POST",
				url: themifyBuilder.ajaxurl,
				dataType: 'json',
				data: {
					action: 'tfb_load_module_partial',
					tfb_post_id: builder_id,
					tfb_module_slug: module_slug,
					tfb_module_data: JSON.stringify(temp_appended_data),
					tfb_load_nonce: themifyBuilder.tfb_load_nonce,
					builder_grid_activate: 1
				},
				beforeSend: function(xhr) {
					ThemifyBuilderCommon.showLoader('show');
				},
				success: function(data) {
					var $newElems = $(data.html);
					holder[0].parentNode.insertBefore($newElems[0], holder[0].nextSibling);

					self.newRowAvailable();
					self.moduleEvents();
					self.loadContentJs();
					ThemifyBuilderCommon.showLoader('hide');

					var newValue = $builder_container[0].innerHTML;
					if (startValue !== newValue) {
						ThemifyBuilderCommon.undoManager.events.trigger('change', [$builder_container[0], startValue, newValue]);
					}
				}
			});

			self.editing = true;
		},
		deleteModule: function(e) {
			e.preventDefault();

			var self = ThemifyPageBuilder,
				_this = $(this);

			if (confirm(themifyBuilder.moduleDeleteConfirm)) {

				var builder_container = _this.closest('.themify_builder_content')[0],
					startValue = builder_container.innerHTML;

				self.switchPlaceholdModule(_this);
				_this.parents('.themify_builder_module_front').remove();
				self.newRowAvailable();
				self.moduleEvents();
				self.editing = true;

				var newValue = builder_container.innerHTML;
				if (startValue !== newValue) {
					ThemifyBuilderCommon.undoManager.events.trigger('change', [builder_container, startValue, newValue]);
				}
			}
		},
		addModule: function(e) {
			e.preventDefault();

			var self = ThemifyPageBuilder,
				module_name = $(this).data('module-name'),
				module_text = $(this).parent().find('.module_name').text(),
				template = wp.template('builder_add_element'),
				$newElems = $(template({
					slug: module_name,
					name: module_text
				})),
				dest = $('.themify_builder_row:visible').first().find('.themify_module_holder').first();

			$newElems.appendTo(dest);

			self.moduleEvents();
			$newElems.find('.themify_builder_module_front_overlay').show();
			$newElems.find('.themify_module_options').trigger('click', [true]);
			self.editing = true;
		},
		/**
		 * @deprecated Backwards compatibility with Builder plugins.
		 *
		 * TODO: remove.
		 */
		showLoader: ThemifyBuilderCommon.showLoader,
		/**
		 * @deprecated Backwards compatibility with Builder plugins.
		 *
		 * TODO: remove.
		 */
		_openLightbox: ThemifyBuilderCommon.Lightbox.open,
		/**
		 * @deprecated Backwards compatibility with Builder plugins.
		 *
		 * TODO: remove.
		 */
		cancelKeyListener: ThemifyBuilderCommon.Lightbox.cancelKeyListener,
		/**
		 * @deprecated Backwards compatibility with Builder plugins.
		 *
		 * TODO: remove.
		 */
		cancelLightbox: ThemifyBuilderCommon.Lightbox.cancel,
		/**
		 * @deprecated Backwards compatibility with Builder plugins.
		 *
		 * TODO: remove.
		 */
		closeLightbox: ThemifyBuilderCommon.Lightbox.close,
		initNewEditor: function(editor_id) {
			var self = ThemifyPageBuilder;
			if (typeof tinyMCEPreInit.mceInit[editor_id] !== "undefined") {
				self.initMCEv4(editor_id, tinyMCEPreInit.mceInit[editor_id]);
				return;
			}
			var tfb_new_editor_object = self.tfb_hidden_editor_object;

			tfb_new_editor_object['elements'] = editor_id;
			tinyMCEPreInit.mceInit[editor_id] = tfb_new_editor_object;

			// v4 compatibility
			self.initMCEv4(editor_id, tinyMCEPreInit.mceInit[editor_id]);
		},
		initMCEv4: function(editor_id, $settings) {
			// v4 compatibility
			if (parseInt(tinyMCE.majorVersion) > 3) {
				// Creates a new editor instance
				var ed = new tinyMCE.Editor(editor_id, $settings, tinyMCE.EditorManager);
				ed.render();
			}
		},
		initQuickTags: function(editor_id) {
			// add quicktags
			if (typeof(QTags) == 'function') {
				quicktags({
					id: editor_id
				});
				QTags._buttonsInit();
			}
		},
		switchPlaceholdModule: function(obj) {
			var check = obj.parents('.themify_module_holder');
			if (check.find('.themify_builder_module_front').length == 1) {
				check.find('.empty_holder_text').show();
			}
		},
		PlaceHoldDragger: function() {
			$('.themify_module_holder').each(function() {
				if ($(this).find('.themify_builder_module_front').length == 0) {
					$(this).find('.empty_holder_text').show();
				}
			});
		},
		saveData: function(loader, callback, saveto, previewOnly) {
			saveto = saveto || 'main';
			var self = ThemifyPageBuilder,
				ids = $('.themify_builder_content').not('.not_editable_builder').map(function() {
					var temp_id = $(this).data('postid') || null;
					var temp_data = self.retrieveData(this) || null;
					return {
						id: temp_id,
						data: temp_data
					};
				}).get(),
				previewOnly = typeof previewOnly !== 'undefined' ? previewOnly : false;

			if (saveto == 'main') {
				self.editing = false;
			}

			return $.ajax({
				type: "POST",
				url: themifyBuilder.ajaxurl,
				data: {
					action: 'tfb_save_data',
					tfb_load_nonce: themifyBuilder.tfb_load_nonce,
					ids: JSON.stringify(ids),
					tfb_saveto: saveto,
					// Only trust themifyBuilder.post_ID on single views
					tfb_post_id: themifyBuilder.post_ID
				},
				cache: false,
				beforeSend: function(xhr) {
					if (loader) {
						if (previewOnly) {
							ThemifyBuilderCommon.showLoader('lightbox-preview');
						} else {
							ThemifyBuilderCommon.showLoader('show');
						}
					}
				},
				success: function(data) {
					if (loader && !previewOnly) {
						ThemifyBuilderCommon.showLoader('hide');
					}
					// load callback
					if ($.isFunction(callback)) {
						callback.call(this, data);
					}
				},
				error: function() {
					if (loader && !previewOnly) {
						ThemifyBuilderCommon.showLoader('error');
					}
				}
			});
		},
		moduleSave: function(e) {
			var self = ThemifyPageBuilder,
				$currentSelectedModule = $('.current_selected_module'),
				$active_module_settings = $currentSelectedModule.find('.front_mod_settings'),
				temp_appended_data = {},
				previewOnly = false,
				form_state = document.getElementById('tfb_module_settings').getAttribute('data-form-state'),
				entire_appended_data = $('#tfb_module_settings').find('.tfb_module_settings_entire_data').data('entire-data') || {};

			if (ThemifyBuilderCommon.Lightbox.previewButtonClicked($(this))) {
				previewOnly = true;
			}

			$('#tfb_module_settings .tfb_lb_option').each(function(iterate) {
				var option_value,
					this_option_id = $(this).attr('id');

				if ($(this).hasClass('tfb_lb_wp_editor')) {
					if (typeof tinyMCE !== 'undefined') {
						option_value = tinyMCE.get(this_option_id).hidden === false ? tinyMCE.get(this_option_id).getContent() : switchEditors.wpautop(tinymce.DOM.get(this_option_id).value);
					} else {
						option_value = $(this).val();
					}
				} else if ($(this).hasClass('themify-checkbox')) {
					var cselected = [];
					$(this).find('.tf-checkbox:checked').each(function(i) {
						cselected.push($(this).val());
					});
					if (cselected.length > 0) {
						option_value = cselected.join('|');
					} else {
						option_value = '|';
					}
				} else if ($(this).hasClass('themify-layout-icon')) {
					if ($(this).find('.selected').length > 0) {
						option_value = $(this).find('.selected').attr('id');
					} else {
						option_value = $(this).children().first().attr('id');
					}
				} else if ($(this).hasClass('themify-option-query-cat')) {
					var parent = $(this).parent(),
						single_cat = parent.find('.query_category_single'),
						multiple_cat = parent.find('.query_category_multiple');

					if (multiple_cat.val() != '') {
						option_value = multiple_cat.val() + '|multiple';
					} else {
						option_value = single_cat.val() + '|single';
					}
				} else if ($(this).hasClass('themify_builder_row_js_wrapper')) {
					var row_items = [];
					$(this).find('.themify_builder_row').each(function() {
						var temp_rows = {};
						$(this).find('.tfb_lb_option_child').each(function() {
							var option_value_child,
								this_option_id_child = $(this).data('input-id');
							if (!this_option_id_child) {
								this_option_id_child = $(this).attr('id');
							}
							if ($(this).hasClass('tf-radio-choice')) {
								option_value_child = ($(this).find(':checked').length > 0) ? $(this).find(':checked').val() : '';
							} else if ($(this).hasClass('themify-layout-icon')) {
								if (!this_option_id_child) {
									this_option_id_child = $(this).attr('id');
								}
								if ($(this).find('.selected').length > 0) {
									option_value_child = $(this).find('.selected').attr('id');
								} else {
									option_value_child = $(this).children().first().attr('id');
								}
							} else if ($(this).hasClass('themify-checkbox')) {
								option_value_child = [];
								$(this).find(':checked').each(function(i) {
									option_value_child[i] = $(this).val();
								});
							} else if ($(this).hasClass('tfb_lb_wp_editor')) {
								var text_id = $(this).attr('id');
								this_option_id_child = $(this).attr('name');
								if (typeof tinyMCE !== 'undefined') {
									option_value_child = tinyMCE.get(text_id).hidden === false ? tinyMCE.get(text_id).getContent() : switchEditors.wpautop(tinymce.DOM.get(text_id).value);
								} else {
									option_value_child = $(this).val();
								}
							} else {
								option_value_child = $(this).val();
							}

							if (option_value_child) {
								temp_rows[this_option_id_child] = option_value_child;
							}
						});
						row_items.push(temp_rows);
					});
					option_value = row_items;
				} else if ($(this).hasClass('tf-radio-input-container')) {
					option_value = $(this).find('input[name="' + this_option_id + '"]:checked').val();
				} else if ($(this).hasClass('module-widget-form-container')) {
					option_value = $(this).find(':input').themifySerializeObject();
				} else if ($(this).is('select, input, textarea')) {
					option_value = $(this).val();
				}

				if (option_value) {
					temp_appended_data[this_option_id] = option_value;
				}
			});

			if ('desktop' !== self.activeBreakPoint) {
				var styleFields = $('#themify_builder_options_styling .tfb_lb_option').map(function() {
					return $(this).attr('id');
				}).get();

				// get current styling data
				var temp_style_data = _.pick(temp_appended_data, styleFields);

				// revert desktop styling data
				temp_appended_data = _.omit(temp_appended_data, styleFields);
				temp_appended_data = _.extend(temp_appended_data, _.pick(entire_appended_data, styleFields));

				// append breakpoint data
				temp_appended_data['breakpoint_' + self.activeBreakPoint] = temp_style_data;

				// Check for another breakpoint
				_.each(_.omit(themifyBuilder.breakpoints, self.activeBreakPoint), function(value, key) {
					if (!_.isUndefined(entire_appended_data['breakpoint_' + key])) {
						temp_appended_data['breakpoint_' + key] = entire_appended_data['breakpoint_' + key];
					}
				});
			} else {
				// Check for another breakpoint
				_.each(themifyBuilder.breakpoints, function(value, key) {
					if (!_.isUndefined(entire_appended_data['breakpoint_' + key])) {
						temp_appended_data['breakpoint_' + key] = entire_appended_data['breakpoint_' + key];
					}
				});
			}

			$active_module_settings.find('script[type="text/json"]').text(JSON.stringify(temp_appended_data));

			// clear empty module
			self.deleteEmptyModule();

			var hilite = $('.current_selected_module').parents('.themify_builder_module_front'),
				class_hilite = self.getHighlightClass(hilite),
				hilite_obj = self.getHighlightObject(hilite),
				mod_name = hilite.data('module-name');

			if (!previewOnly) {
				ThemifyBuilderCommon.Lightbox.close()
			}

			hilite.wrap('<div class="temp_placeholder ' + class_hilite + '" />').find('.themify_builder_module_front_overlay').show();
			self.updateContent(class_hilite, hilite_obj, mod_name, temp_appended_data, previewOnly, form_state);

			// hack: hide tinymce inline toolbar
			if ( $('.mce-inline-toolbar-grp:visible').length ) {
				$('.mce-inline-toolbar-grp:visible').hide();
			}

			self.editing = true;
			e.preventDefault();
		},
		hideModulesControl: function() {
			$('.themify_builder_module_front_overlay').hide();
			$('.themify_builder_dropdown_front').hide();
		},
		hideColumnsBorder: function() {
			//$('.themify_builder_col').css('border', 'none');
		},
		showColumnsBorder: function() {
		   // $('.themify_builder_col').css('border', '');
		},
		retrieveData: function(obj) {
			var option_data = {},
				$builder_selector = $(obj);

			// rows
			$builder_selector.children('.themify_builder_row').each(function(r) {
				option_data[r] = ThemifyPageBuilder._getSettings($(this), r);
			});
			return option_data;
		},
		_getSubRowSettings: function($subRow, subRowOrder) {
			var self = ThemifyPageBuilder,
				sub_cols = {};
			$subRow.find('.themify_builder_col').first().parent().children('.themify_builder_col').each(function(sub_col) {
				var sub_grid_class = self.filterClass($(this).attr('class')),
					sub_modules = {};

				$(this).find('.active_module').each(function(sub_m) {
					var sub_mod_name = $(this).find('.front_mod_settings').data('mod-name'),
						sub_mod_elems = $(this).find('.front_mod_settings'),
						sub_mod_settings = JSON.parse(sub_mod_elems.find('script[type="text/json"]').text());
					sub_modules[sub_m] = {
						mod_name: sub_mod_name,
						mod_settings: sub_mod_settings
					};
				});

				sub_cols[sub_col] = {
					'column_order': sub_col,
					'grid_class': sub_grid_class,
                                        'grid_width':$(this).prop('style').width?parseFloat($(this).prop('style').width):false,
					'modules': sub_modules
				};

				// get sub-column styling
				if ($(this).children('.column-data-styling').length > 0) {
					var $data_styling = $(this).children('.column-data-styling').data('styling');
					if ('object' === typeof $data_styling)
						sub_cols[sub_col].styling = $data_styling;
				}
			});

			return {
				row_order: subRowOrder,
				gutter: $subRow.data('gutter'),
				equal_column_height: $subRow.data('equal-column-height'),
				column_alignment: $subRow.data('column-alignment'),
				cols: sub_cols
			}
		},
		_getSettings: function($base, index) {
			var self = ThemifyPageBuilder,
				option_data = {},
				cols = {};

			// cols
			$base.find('.themify_builder_row_content').first().children('.themify_builder_col').each(function(c) {
				var grid_class = self.filterClass($(this).attr('class')),
					modules = [];
				// mods
				$(this).find('.themify_module_holder').first().children().each(function(m) {
					if ($(this).hasClass('themify_builder_module_front')) {
						var mod_name = $(this).find('.front_mod_settings').data('mod-name'),
							mod_elems = $(this).find('.front_mod_settings'),
							mod_settings = JSON.parse(mod_elems.find('script[type="text/json"]').text());
						modules[m] = {
							mod_name: mod_name,
							mod_settings: mod_settings
						};
					}

					// Sub Rows
					if ($(this).hasClass('themify_builder_sub_row')) {
						modules[m] = self._getSubRowSettings($(this), m);
					}
				});

				cols[c] = {
					'column_order': c,
					'grid_class': grid_class,
                                        'grid_width':$(this).prop('style').width?parseFloat($(this).prop('style').width):false,
					'modules': modules
				};

				// get column styling
				if ($(this).children('.column-data-styling').length > 0) {
					var $data_styling = $(this).children('.column-data-styling').data('styling');
					if ('object' === typeof $data_styling)
						cols[c].styling = $data_styling;
				}
			});

			option_data = {
				row_order: index,
				gutter: $base.data('gutter'),
				equal_column_height: $base.data('equal-column-height'),
				column_alignment: $base.data('column-alignment'),
				cols: cols
			};

			// get row styling
			if ($base.find('.row-data-styling').length > 0) {
				var $data_styling = $base.find('.row-data-styling').data('styling');
				if ('object' === typeof $data_styling)
					option_data.styling = $data_styling;
			}

			return option_data;
		},
		filterClass: function(str) {
			var grid = ThemifyPageBuilder.gridClass.concat(['first', 'last']),
				n = str.split(' '),
				new_arr = [];

			for (var i = 0; i < n.length; i++) {
				if ($.inArray(n[i], grid) > -1) {
					new_arr.push(n[i]);
				}
			}

			return new_arr.join(' ');
		},
		limitString: function(str, limit) {
			var new_str;

			if ($(str).text().length > limit) {
				new_str = $(str).text().substr(0, limit);
			} else {
				new_str = $(str).text();
			}

			return new_str;
		},
		mediaUploader: function() {

			// Uploading files
			var $body = $('body'); // Set this

			// Field Uploader
			$body.on('click', '.themify-builder-media-uploader', function(event) {
				var $el = $(this),
					$builderInput = $el.closest('.themify_builder_input'),
					isRowBgImage = $builderInput.children('#background_image').length == 1,
					isRowBgVideo = $builderInput.children('#background_video').length == 1;

				var file_frame = wp.media.frames.file_frame = wp.media({
					title: $el.data('uploader-title'),
					library: {
						type: $el.data('library-type') ? $el.data('library-type') : 'image'
					},
					button: {
						text: $el.data('uploader-button-text')
					},
					multiple: false // Set to true to allow multiple files to be selected
				});

				// When an image is selected, run a callback.
				file_frame.on('select', function() {
					// We set multiple to false so only get one image from the uploader
					var attachment = file_frame.state().get('selection').first().toJSON();

					// Do something with attachment.id and/or attachment.url here
					$el.closest('.themify_builder_input').find('.themify-builder-uploader-input').val(attachment.url).trigger('change')
						.parent().find('.img-placeholder').empty()
						.html($('<img/>', {
							src: attachment.url,
							width: 50,
							height: 50
						}))
						.parent().show();

					// Attached id to input
					$el.closest('.themify_builder_input').find('.themify-builder-uploader-input-attach-id').val(attachment.id);
				});

				// Hide ATTACHMENT DISPLAY SETTINGS
				if (isRowBgImage || isRowBgVideo) {
					if ($('#hide_attachment_display_settings').length == 0) {
						$('body').append('<style id="hide_attachment_display_settings">.media-modal .attachment-display-settings { display:none }</style>');
					}
	 
					file_frame.on('close', function (selection) {
						$('#hide_attachment_display_settings').remove();
					});
				}

				// Finally, open the modal
				file_frame.open();
				event.preventDefault();
			});

			// delete button
			$body.on('click', '.themify-builder-delete-thumb', function(e) {
				$(this).prev().empty().parent().hide();
				$(this).closest('.themify_builder_input').find('.themify-builder-uploader-input').val('').trigger('change');
				e.preventDefault();
			});

			// Media Buttons
			$body.on('click', '.insert-media', function(e) {
				window.wpActiveEditor = $(this).data('editor');
			});
		},
		builderPlupload: function(action_text) {
			var class_new = action_text == 'new_elemn' ? '.plupload-clone' : '',
				$builderPluploadUpload = $(".themify-builder-plupload-upload-uic" + class_new);

			if ($builderPluploadUpload.length > 0) {
				var pconfig = false;
				$builderPluploadUpload.each(function() {
					var $this = $(this),
						id1 = $this.attr("id"),
						imgId = id1.replace("themify-builder-plupload-upload-ui", "");

					pconfig = JSON.parse(JSON.stringify(themify_builder_plupload_init));

					pconfig["browse_button"] = imgId + pconfig["browse_button"];
					pconfig["container"] = imgId + pconfig["container"];
					pconfig["drop_element"] = imgId + pconfig["drop_element"];
					pconfig["file_data_name"] = imgId + pconfig["file_data_name"];
					pconfig["multipart_params"]["imgid"] = imgId;
					//pconfig["multipart_params"]["_ajax_nonce"] = $this.find(".ajaxnonceplu").attr("id").replace("ajaxnonceplu", "");
					pconfig["multipart_params"]["_ajax_nonce"] = themifyBuilder.tfb_load_nonce;
					pconfig["multipart_params"]['topost'] = themifyBuilder.post_ID;
					if ($this.data('extensions')) {
						pconfig['filters'][0]['extensions'] = $this.data('extensions');
					}

					var uploader = new plupload.Uploader(pconfig);

					uploader.bind('Init', function(up) {});

					uploader.init();

					// a file was added in the queue
					uploader.bind('FilesAdded', function(up, files) {
						up.refresh();
						up.start();
						ThemifyBuilderCommon.showLoader('show');
					});

					uploader.bind('Error', function(up, error) {
						var $promptError = $('.prompt-box .show-error');
						$('.prompt-box .show-login').hide();
						$promptError.show();

						if ($promptError.length > 0) {
							$promptError.html('<p class="prompt-error">' + error.message + '</p>');
						}
						$(".overlay, .prompt-box").fadeIn(500);
					});

					// a file was uploaded
					uploader.bind('FileUploaded', function(up, file, response) {
						var json = JSON.parse(response['response']),
							status;

						if ('200' == response['status'] && !json.error) {
							status = 'done';
						} else {
							status = 'error';
						}

						$("#themify_builder_alert").removeClass("busy").addClass(status).delay(800).fadeOut(800, function() {
							$(this).removeClass(status);
						});

						if (json.error) {
							alert(json.error);
							return;
						}

						var response_url = json.large_url ? json.large_url : json.url,
							response_id = json.id,
							thumb_url = json.thumb;

						$this.closest('.themify_builder_input').find('.themify-builder-uploader-input').val(response_url).trigger('change')
							.parent().find('.img-placeholder').empty()
							.html($('<img/>', {
								src: thumb_url,
								width: 50,
								height: 50
							}))
							.parent().show();

						// Attach image id to the input
						$this.closest('.themify_builder_input').find('.themify-builder-uploader-input-attach-id').val(response_id);

					});

					$this.removeClass('plupload-clone');

				});
			}
		},
		moduleOptionBuilder: function() {

			// sortable accordion builder
			$(".themify_builder_module_opt_builder_wrap").sortable({
				items: '.themify_builder_row',
				handle: '.themify_builder_row_top',
				axis: 'y',
				placeholder: 'themify_builder_ui_state_highlight',
				start: function(event, ui) {
					if (typeof tinyMCE !== 'undefined') {
						$('#tfb_module_settings').find('.tfb_lb_wp_editor.tfb_lb_option_child').each(function() {
							var id = $(this).attr('id'),
								content = tinymce.get(id).getContent();
							$(this).data('content', content);
							tinyMCE.execCommand('mceRemoveEditor', false, id);
						});
					}
				},
				stop: function(event, ui) {
					if (typeof tinyMCE !== 'undefined') {
						$('#tfb_module_settings').find('.tfb_lb_wp_editor.tfb_lb_option_child').each(function() {
							var id = $(this).attr('id');
							tinyMCE.execCommand('mceAddEditor', false, id);
							tinymce.get(id).setContent($(this).data('content'));
						});
					}
				},
				sort: function(event, ui) {
					var placeholder_h = ui.item.height();
					$('.themify_builder_module_opt_builder_wrap .themify_builder_ui_state_highlight').height(placeholder_h);
				}
			});
		},
		rowOptionBuilder: function() {
			$(".themify_builder_row_opt_builder_wrap").sortable({
				items: '.themify_builder_row',
				handle: '.themify_builder_row_top',
				axis: 'y',
				placeholder: 'themify_builder_ui_state_highlight',
				start: function(event, ui) {
					if (typeof tinyMCE !== 'undefined') {
						$('#tfb_row_settings').find('.tfb_lb_wp_editor.tfb_lb_option_child').each(function() {
							var id = $(this).attr('id'),
								content = tinymce.get(id).getContent();
							$(this).data('content', content);
							tinyMCE.execCommand('mceRemoveEditor', false, id);
						});
					}
				},
				stop: function(event, ui) {
					if (typeof tinyMCE !== 'undefined') {
						$('#tfb_row_settings').find('.tfb_lb_wp_editor.tfb_lb_option_child').each(function() {
							var id = $(this).attr('id');
							tinyMCE.execCommand('mceAddEditor', false, id);
							tinymce.get(id).setContent($(this).data('content'));
						});
					}
				},
				sort: function(event, ui) {
					var placeholder_h = ui.item.height();
					$('.themify_builder_row_opt_builder_wrap .themify_builder_ui_state_highlight').height(placeholder_h);
				}
			});
		},
		moduleOptAddRow: function(e) {
			var self = ThemifyPageBuilder,
				parent = $(this).parent().prev(),
				template = parent.find('.themify_builder_row').first().clone(),
				row_count = $('.themify_builder_row_js_wrapper').find('.themify_builder_row:visible').length + 1,
				number = row_count + Math.floor(Math.random() * 9);

			// clear form data
			template.removeClass('collapsed').find('.themify_builder_row_content').show();
			template.find('.themify-builder-radio-dnd').each(function(i) {
				var oriname = $(this).attr('name');
				$(this).attr('name', oriname + '_' + row_count).not(':checked').prop('checked', false);
				$(this).attr('id', oriname + '_' + row_count + '_' + i);
				$(this).next('label').attr('for', oriname + '_' + row_count + '_' + i);
				if( $(this).is('[data-checked]') ) {
					var $self = $(this);
					$(this).attr( 'checked', true );
					setTimeout( function() { $self.trigger( 'change' ) }, 100 );
				}
			});

			// Hide conditional inputs
			template.find( '[data-binding]' ).each( function() {
				var bindingData = $(this).data( 'binding' );
				try {
					var hideEl = '.' + bindingData.empty.hide.join( ', .' );
					template.find( hideEl ).children().hide();
				} catch(e) {}
			} );

			template.find('.themify-layout-icon a').removeClass('selected');

			template.find('.thumb_preview').each(function() {
				$(this).find('.img-placeholder').html('').parent().hide();
			});
			template.find('input[type=text], textarea').each(function() {
				$(this).val('');
			});
			template.find('.tfb_lb_wp_editor.tfb_lb_option_child').each(function() {
				$(this).addClass('clone');
			});
			template.find('.themify-builder-plupload-upload-uic').each(function(i) {
				$(this).attr('id', 'pluploader_' + row_count + number + i + 'themify-builder-plupload-upload-ui');
				$(this).find('input[type=button]').attr('id', 'pluploader_' + row_count + number + i + 'themify-builder-plupload-browse-button');
				$(this).addClass('plupload-clone');
			});

			// Fix color picker input
			template.find('.builderColorSelectInput').each(function() {
				var thiz = $(this),
					input = thiz.clone().val(''),
					parent = thiz.closest('.themify_builder_field');
				thiz.prev().minicolors('destroy').removeAttr('maxlength');
				parent.find('.colordisplay').wrap('<div class="themify_builder_input" />').before('<span class="builderColorSelect"><span></span></span>').after(input);
				self.setColorPicker(parent);
			});

			$(template).appendTo(parent).show();

			$('#tfb_module_settings').find('.tfb_lb_wp_editor.tfb_lb_option_child.clone').each(function(i) {
				var element = $(this),
					parent_child = element.closest('.themify_builder_input');

				$(this).closest('.wp-editor-wrap').remove();

				var oriname = element.attr('name');
				element.attr('id', oriname + '_' + row_count + number + '_' + i);
				element.attr('class').replace('wp-editor-area', '');

				element.appendTo(parent_child).wrap('<div class="wp-editor-wrap"/>');

			});

			if (e.which) {
				self.addNewWPEditor();
				self.builderPlupload('new_elemn');
			}

			e.preventDefault();
		},
		rowOptAddRow: function(e) {
			var self = ThemifyPageBuilder,
				parent = $(this).parent().prev(),
				template = parent.find('.themify_builder_row').first().clone(),
				row_count = $('.themify_builder_row_js_wrapper').find('.themify_builder_row:visible').length + 1,
				number = row_count + Math.floor(Math.random() * 9);

			// clear form data
			template.removeClass('collapsed').find('.themify_builder_row_content').show();
			template.find('.themify-builder-radio-dnd').each(function(i) {
				var oriname = $(this).attr('name');
				$(this).attr('name', oriname + '_' + row_count).not(':checked').prop('checked', false);
				$(this).attr('id', oriname + '_' + row_count + '_' + i);
				$(this).next('label').attr('for', oriname + '_' + row_count + '_' + i);
			});

			template.find('.themify-layout-icon a').removeClass('selected');

			template.find('.thumb_preview').each(function() {
				$(this).find('.img-placeholder').html('').parent().hide();
			});
			template.find('input[type="text"], textarea').each(function() {
				$(this).val('');
			});
			template.find('.tfb_lb_wp_editor.tfb_lb_option_child').each(function() {
				$(this).addClass('clone');
			});
			template.find('.themify-builder-plupload-upload-uic').each(function(i) {
				$(this).attr('id', 'pluploader_' + row_count + number + i + 'themify-builder-plupload-upload-ui');
				$(this).find('input[type=button]').attr('id', 'pluploader_' + row_count + number + i + 'themify-builder-plupload-browse-button');
				$(this).addClass('plupload-clone');
			});

			// Fix color picker input
			template.find('.builderColorSelectInput').each(function() {
				var thiz = $(this),
					input = thiz.clone().val(''),
					parent = thiz.closest('.themify_builder_field');
				thiz.prev().minicolors('destroy').removeAttr('maxlength');
				parent.find('.colordisplay').wrap('<div class="themify_builder_input" />').before('<span class="builderColorSelect"><span></span></span>').after(input);
				self.setColorPicker(parent);
			});

			$(template).appendTo(parent).show();

			$('#tfb_row_settings').find('.tfb_lb_wp_editor.tfb_lb_option_child.clone').each(function(i) {
				var element = $(this),
					parent_child = element.closest('.themify_builder_input');

				$(this).closest('.wp-editor-wrap').remove();

				var oriname = element.attr('name');
				element.attr('id', oriname + '_' + row_count + number + '_' + i);
				element.attr('class').replace('wp-editor-area', '');

				element.appendTo(parent_child).wrap('<div class="wp-editor-wrap"/>');

			});

			if (e.which) {
				self.addNewWPEditor();
				self.builderPlupload('new_elemn');
			}

			e.preventDefault();
		},
		updateContent: function(class_hilite, hilite_obj, module_slug, temp_appended_data, previewOnly, form_state) {
			var self = ThemifyPageBuilder,
				$builder_selector = $('.current_selected_module').closest('.themify_builder_content'),
				builder_id = $builder_selector.data('postid'),
				previewOnly = typeof previewOnly !== 'undefined' ? previewOnly : false,
				form_state = form_state || 'edit',
				startValue = ThemifyBuilderCommon.undoManager.getStartValue() || $builder_selector[0].innerHTML;
		   
			$.ajax({
				type: "POST",
				url: themifyBuilder.ajaxurl,
				dataType: 'json',
				data: {
					action: 'tfb_load_module_partial',
					tfb_post_id: builder_id,
					tfb_module_slug: module_slug,
					tfb_module_data: JSON.stringify(temp_appended_data),
					tfb_load_nonce: themifyBuilder.tfb_load_nonce,
					builder_grid_activate: 1,
					rules: self.liveStylingInstance.isModuleExists(module_slug)?0:1
				},
				beforeSend: function(xhr) {
					//
					if (!previewOnly) {
						ThemifyBuilderCommon.showLoader('show');
					}
				},
				success: function(data) {
					var $newElems = $(data.html),
						parent = $builder_selector.find('.temp_placeholder.' + class_hilite);

					// goto mod element
					if (parent.length > 0) {
						$('html,body').animate({
							scrollTop: parent.offset().top - 150
						}, 500);
						parent.empty();
					}

					$newElems.find('.module_menu_front').addClass('current_selected_module');
					parent.first().html($newElems);
					parent.find('.active_module').unwrap();
					$newElems.find('.themify_builder_module_front_overlay')
						.show().delay(1000).fadeOut(1000);

					if(data.rules){
					   self.liveStylingInstance.addStyleDate(module_slug,data.rules);
					}

					if (previewOnly) {
						self.liveStylingInstance.init($newElems.children('.module'), ThemifyBuilderCommon.getModuleSettings($newElems));
					} else {
						self.newRowAvailable();
						ThemifyBuilderCommon.showLoader('spinhide');
					}

					self.moduleEvents();
					self.loadContentJs();

					// Load google font style
					if ('undefined' !== typeof WebFont && data.gfonts.length > 0) {
						WebFont.load({
							google: {
								families: data.gfonts
							}
						});
					}

					if (previewOnly) {
						ThemifyBuilderCommon.showLoader('lightbox-preview-hide');
					} else {
						// log the action
						var newValue = $builder_selector[0].innerHTML;
						ThemifyBuilderCommon.undoManager.events.trigger('change', [$builder_selector[0], startValue, newValue]);
						self.responsiveFrame.doSync();
					}

					// Hook
					$('body').trigger('builder_load_module_partial', $newElems);
				}
			});
		},
		toggleFrontEdit: function(e) {
			var self = ThemifyPageBuilder,
				is_edit = 0;

			// remove lightbox if any
			if ($('#themify_builder_lightbox_parent').is(':visible')) {
				$('.builder_cancel_lightbox').trigger('click');
			}

			var location_url = window.location.pathname + window.location.search;
			// remove hash
			if (window.history && window.history.replaceState) {
				window.history.replaceState('', '', location_url);
			} else {
				window.location.href = window.location.href.replace(/#.*$/, '#');
			}

			var bids = $('.themify_builder_content').not('.not_editable_builder').map(function() {
				return $(this).data('postid') || null;
			}).get();

			// add body class
			if (!$('body').hasClass('themify_builder_active')) {
				is_edit = 1;
				$('.toggle_tf_builder a:first').text(themifyBuilder.toggleOff);
				$('.themify_builder_front_panel').slideDown();
			} else {
				$('.themify_builder_front_panel').slideUp();
				$('.toggle_tf_builder a:first').text(themifyBuilder.toggleOn);
				is_edit = 0;
			}

			if (is_edit == 0 && self.editing) {
				// confirm
				var reply = confirm(themifyBuilder.confirm_on_turn_off);
				if (reply) {
					self.saveData(true, function() {
						self.toggleFrontEditAjax(is_edit, bids);
					});
				} else {
					self.toggleFrontEditAjax(is_edit, bids);
				}
			} else {
				self.toggleFrontEditAjax(is_edit, bids);
				self.editing = false;
			}

			if ('undefined' !== typeof e) {
				e.preventDefault();
			}
		},
		toggleFrontEditAjax: function(is_edit, bids) {
			var self = ThemifyPageBuilder;
			$.ajax({
				type: "POST",
				url: themifyBuilder.ajaxurl,
				dataType: 'json',
				data: {
					action: 'tfb_toggle_frontend',
					tfb_post_id: themifyBuilder.post_ID,
					tfb_post_ids: bids,
					tfb_load_nonce: themifyBuilder.tfb_load_nonce,
					builder_grid_activate: is_edit
				},
				beforeSend: function(xhr) {
					ThemifyBuilderCommon.showLoader('show');
				},
				success: function(data) {

					if (!is_edit) {
						// Clear undo history
						ThemifyBuilderCommon.undoManager.instance.clear();
					}

					if (data.length > 0) {
						$('.themify_builder_content').not('.not_editable_builder').empty();
						$.each(data, function(i, v) {
							var $target = $('#themify_builder_content-' + data[i].builder_id).empty();
							$target.get(0).innerHTML = $(data[i].markup).unwrap().get(0).innerHTML;
						});
					}
					if (is_edit) {
						$('body').addClass('themify_builder_active themify_builder_front');
						self.newRowAvailable();
						self.moduleEvents();
						self._selectedGridMenu();
						self.checkUnload();
						setTimeout(self._RefreshHolderHeight, 1000);
					} else {
						$('body').removeClass('themify_builder_active themify_builder_front');
						window.onbeforeunload = null;
						ThemifyBuilderModuleJs.init();
					}
					self.loadContentJs();
					ThemifyBuilderCommon.showLoader('spinhide');

					$('body').trigger('builder_toggle_frontend', is_edit);
                                         ThemifyBuilderCommon.columnDrag(null,false);
				}
			});
		},
		newRowAvailable: function() {
			var self = ThemifyPageBuilder;

			$('.themify_builder_content').not('.not_editable_builder').each(function() {
				var $container = $(this),
					$parent = $container.find('.themify_builder_row:visible').first().parent().children('.themify_builder_row:visible').not('.module-layout-part .themify_builder_row'), // exclude builder rows inside layout parts
					template_func = wp.template('builder_row'),
					$template = $(template_func({}));

				$parent.each(function() {
					if ($(this).find('.themify_builder_module_front').length != 0) {
						return;
					}

					var removeThis = true;

					var column_data_styling = $(this).find('.column-data-styling');
					var data_styling = null;

					column_data_styling.each(function() {
						if (!removeThis) {
							return;
						}

						data_styling = $(this).data('styling');

						if ((typeof data_styling === 'array' && data_styling.length > 0) || !$.isEmptyObject(data_styling)) {
							removeThis = false;
						}
					});

					data_styling = $(this).find('.row-data-styling').data('styling');

					if (removeThis && (typeof data_styling === 'string' || $.isEmptyObject(data_styling))) {
						$(this).remove();
					}
				});

				if ($parent.find('.themify_builder_module_front').length > 0 || $container.find('.themify_builder_row:visible').length == 0) {
					$template.css('visibility', 'visible').appendTo($container);
					self._selectedGridMenu($template);
				}
			});
		},
		loadContentJs: function() {
			ThemifyBuilderModuleJs.loadOnAjax(); // load module js ajax
			// hook
			$('body').trigger('builder_load_on_ajax');
		},
		duplicatePage: function(e) {
			var self = ThemifyPageBuilder;

			if ($('body').hasClass('themify_builder_active')) {
				var reply = confirm(themifyBuilder.confirm_on_duplicate_page);
				if (reply) {
					self.saveData(true, function() {
						self.duplicatePageAjax();
					});
				} else {
					self.duplicatePageAjax();
				}
			} else {
				self.duplicatePageAjax();
			}
			e.preventDefault();
		},
		duplicatePageAjax: function() {
			$.ajax({
				type: "POST",
				url: themifyBuilder.ajaxurl,
				dataType: 'json',
				data: {
					action: 'tfb_duplicate_page',
					tfb_load_nonce: themifyBuilder.tfb_load_nonce,
					tfb_post_id: themifyBuilder.post_ID,
					tfb_is_admin: 0
				},
				beforeSend: function(xhr) {
					ThemifyBuilderCommon.showLoader('show');
				},
				success: function(data) {
					ThemifyBuilderCommon.showLoader('hide');
					var new_url = data.new_url.replace(/\&amp;/g, '&');
					window.onbeforeunload = null;
					window.location.href = new_url;
				}
			});
		},
		getHighlightClass: function(obj) {
			var mod = obj.index() - 1,
				col = obj.closest('.themify_builder_col').index(),
				row = obj.closest('.themify_builder_row').index();

			return 'r' + row + 'c' + col + 'm' + mod;
		},
		getHighlightObject: function(obj) {
			var mod = obj.index() - 1,
				col = obj.closest('.themify_builder_col').index(),
				row = obj.closest('.themify_builder_row').index();

			return {
				row: row,
				col: col,
				mod: mod
			};

		},
		deleteEmptyModule: function() {
			var self = ThemifyPageBuilder;
			$(self.builder_content_selector).find('.themify_builder_module_front').each(function() {
				if ($.trim($(this).find('.front_mod_settings').find('script[type="text/json"]').text()).length <= 2) {
					$(this).remove();
				}
			});
		},
		is_touch_device: function() {
			return 'true' == themifyBuilder.isTouch;
		},
		touchElement: function() {
			$('input, textarea').each(function() {
				$(this).addClass('touchInput');
			});
		},
		slidePanel: function(e) {
			e.preventDefault();
			ThemifyPageBuilder.slidePanelOpen = $(this).parent().hasClass('slide_builder_module_state_down');
			$(this).parent().toggleClass('slide_builder_module_state_down');
			$(this).next().slideToggle();
		},
		hideSlidingPanel: function() {
			if (ThemifyPageBuilder.slidePanelOpen) {
				ThemifyPageBuilder.slidePanelOpen = false;
				$('.slide_builder_module_panel').trigger('click');
			}
		},
		showSlidingPanel: function() {
			if (!ThemifyPageBuilder.slidePanelOpen) {
				ThemifyPageBuilder.slidePanelOpen = true;
				$('.slide_builder_module_panel').trigger('click');
			}
		},
		openGallery: function() {

			var clone = wp.media.gallery.shortcode,
				$self = this,
				file_frame;

			$('body').on('click', '.tf-gallery-btn', function(event) {
				var shortcode_val = $(this).closest('.themify_builder_input').find('.tf-shortcode-input');

				// Create the media frame.
				file_frame = wp.media.frames.file_frame = wp.media({
					frame: 'post',
					state: 'gallery-edit',
					title: wp.media.view.l10n.editGalleryTitle,
					editing: true,
					multiple: true,
					selection: false
				});

				wp.media.gallery.shortcode = function(attachments) {
					var props = attachments.props.toJSON(),
						attrs = _.pick(props, 'orderby', 'order');

					if (attachments.gallery)
						_.extend(attrs, attachments.gallery.toJSON());

					attrs.ids = attachments.pluck('id');

					// Copy the `uploadedTo` post ID.
					if (props.uploadedTo)
						attrs.id = props.uploadedTo;

					// Check if the gallery is randomly ordered.
					if (attrs._orderbyRandom)
						attrs.orderby = 'rand';
					delete attrs._orderbyRandom;

					// If the `ids` attribute is set and `orderby` attribute
					// is the default value, clear it for cleaner output.
					if (attrs.ids && 'post__in' === attrs.orderby)
						delete attrs.orderby;

					// Remove default attributes from the shortcode.
					_.each(wp.media.gallery.defaults, function(value, key) {
						if (value === attrs[key])
							delete attrs[key];
					});

					var shortcode = new wp.shortcode({
						tag: 'gallery',
						attrs: attrs,
						type: 'single'
					});

					shortcode_val.val(shortcode.string()).trigger('change');

					wp.media.gallery.shortcode = clone;
					return shortcode;
				};

				// Hide GALLERY SETTINGS
				if ($('#hide_gallery_settings').length == 0) {
					$('body').append('<style id="hide_gallery_settings">.media-modal .gallery-settings { display:none }</style>');
				}

				file_frame.on('close', function (selection) {
					$('#hide_gallery_settings').remove();
				});

				file_frame.on('update', function(selection) {
					var shortcode = wp.media.gallery.shortcode(selection).string().slice(1, -1);
					shortcode_val.val('[' + shortcode + ']');
					$self.setShortcodePreview(selection.models, shortcode_val);
				});

				if ($.trim(shortcode_val.val()).length > 0) {
					file_frame = wp.media.gallery.edit($.trim(shortcode_val.val()));

					file_frame.on('close', function (selection) {
						$('#hide_gallery_settings').remove();
					});

					file_frame.state('gallery-edit').on('update', function(selection) {
						var shortcode = wp.media.gallery.shortcode(selection).string().slice(1, -1);
						shortcode_val.val('[' + shortcode + ']');
						$self.setShortcodePreview(selection.models, shortcode_val);
					});
				} else {
					file_frame.open();
					$('.media-menu').find('.media-menu-item').last().trigger('click');
				}
				event.preventDefault();
			});

		},
		setShortcodePreview: function($images, $input) {
			var $preview = $input.next('.themify_builder_shortcode_preview'),
				$html = '';
			if ($preview.length === 0) {
				$input.after('<div class="themify_builder_shortcode_preview"></div>');
				$preview = $input.next('.themify_builder_shortcode_preview');
			}
			for (var $i in $images) {
				var attachment = $images[$i].attributes,
					$url = attachment.sizes.thumbnail ? attachment.sizes.thumbnail.url : attachment.url;
				$html += '<img src="' + $url + '" width="50" height="50" />';
			}
			$preview.html($html);
		},
		getShortcodePreview: function($input, $value) {
			$.ajax({
				type: "POST",
				url: themifyBuilder.ajaxurl,
				data: {
					action: 'tfb_load_shortcode_preview',
					tfb_load_nonce: themifyBuilder.tfb_load_nonce,
					shortcode: $value
				},
				success: function(data) {
					if (data) {
						$input.after(data);
					}
				}
			});
		},
		addNewWPEditor: function() {
			var self = ThemifyPageBuilder;

			$('#tfb_module_settings').find('.tfb_lb_wp_editor.clone').each(function(i) {
				var element = $(this),
					element_val = element.val(),
					parent = element.closest('.themify_builder_input');

				$(this).closest('.wp-editor-wrap').remove();

				var oriname = element.attr('name'),
					this_option_id_temp = element.attr('id'),
					this_class = element.attr('class').replace('wp-editor-area', '').replace('clone', '');

				$.ajax({
					type: "POST",
					url: themifyBuilder.ajaxurl,
					dataType: 'html',
					data: {
						action: 'tfb_add_wp_editor',
						tfb_load_nonce: themifyBuilder.tfb_load_nonce,
						txt_id: this_option_id_temp,
						txt_class: this_class,
						txt_name: oriname,
						txt_val: element_val
					},
					success: function(data) {
						var $newElems = $(data),
							this_option_id_clone = $newElems.find('.tfb_lb_wp_editor').attr('id');
						$newElems.appendTo(parent);

						self.initQuickTags(this_option_id_clone);
						if (typeof tinyMCE !== 'undefined') {
							self.initNewEditor(this_option_id_clone);
						}
					}
				});

			});
		},
		moduleActions: function() {
			var $body = $('body');
			$body.on('change', '.module-widget-select-field', function() {
				var $seclass = $(this).val(),
					id_base = $(this).find(':selected').data('idbase');

				$.ajax({
					type: "POST",
					url: themifyBuilder.ajaxurl,
					dataType: 'html',
					data: {
						action: 'module_widget_get_form',
						tfb_load_nonce: themifyBuilder.tfb_load_nonce,
						load_class: $seclass,
						id_base: id_base
					},
					success: function(data) {
						var $newElems = $(data);

						$('.module-widget-form-placeholder').html($newElems);
						$('#themify_builder_lightbox_container').each(function() {
							var $this = $(this).find('#instance_widget');
							$this.find('select').wrap('<div class="selectwrapper"></div>');
						});
						$('.selectwrapper').click(function() {
							$(this).toggleClass('clicked');
						});

					}
				});
			});

			$body.on('editing_module_option', function(e, settings) {
				var $field = $('#tfb_module_settings .tfb_lb_option.module-widget-select-field');
				if ($field.length == 0)
					return;

				var $seclass = $field.val(),
					id_base = $field.find(':selected').data('idbase'),
					$instance = settings.instance_widget;

				$.ajax({
					type: "POST",
					url: themifyBuilder.ajaxurl,
					dataType: 'html',
					data: {
						action: 'module_widget_get_form',
						tfb_load_nonce: themifyBuilder.tfb_load_nonce,
						load_class: $seclass,
						id_base: id_base,
						widget_instance: $instance
					},
					success: function(data) {
						var $newElems = $(data);
						$('.module-widget-form-placeholder').html($newElems);
					}
				});
			});
		},
		panelSave: function(e) {
			e.preventDefault();
			$(this).parent().find('ul').removeClass('hover');
			if (!$(this).hasClass('disabled')) {
				ThemifyPageBuilder.saveData(true).fail(function() {
					alert(themifyBuilder.errorSaveBuilder);
				});
			}
		},
		panelClose: function(e) {
			e.preventDefault();
			ThemifyPageBuilder.toggleFrontEdit();
		},
		builderImportPage: function(e) {
			e.preventDefault();
			ThemifyPageBuilder.builderImport('page');
		},
		builderImportPost: function(e) {
			e.preventDefault();
			ThemifyPageBuilder.builderImport('post');
		},
		builderImportSubmit: function(e) {
			e.preventDefault();

			var postData = $(this).closest('form').serialize();

			$.ajax({
				type: "POST",
				url: themifyBuilder.ajaxurl,
				dataType: 'json',
				data: {
					action: 'builder_import_submit',
					nonce: themifyBuilder.tfb_load_nonce,
					data: postData,
					importTo: themifyBuilder.post_ID
				},
				success: function(data) {
					ThemifyBuilderCommon.Lightbox.close();
					window.location.reload();
				}
			});
		},
		builderImport: function(imType) {
			var options = {
				dataType: 'html',
				data: {
					action: 'builder_import',
					type: imType
				}
			};
			ThemifyBuilderCommon.Lightbox.open(options, null);
		},
		optionRow: function(e) {
			e.preventDefault();

			var self = ThemifyPageBuilder,
				$this = $(this),
				$currentSelectedRow = $this.closest('.themify_builder_row'),
				options = ThemifyBuilderCommon.getRowStylingSettings($currentSelectedRow),
				callback = function() {
					$('<div/>', {
						class: 'tfb_row_settings_entire_data'
					}).data('entire-data', options).appendTo($('#tfb_row_settings'));
					if ('desktop' !== self.activeBreakPoint) {
						var styleFields = $('#themify_builder_row_fields_styling .tfb_lb_option').map(function() {
							return $(this).attr('id');
						}).get(), temp_background_type = options.background_type;
						options = _.omit(options, styleFields);

						if (!_.isUndefined(options['breakpoint_' + self.activeBreakPoint]) && _.isObject(options['breakpoint_' + self.activeBreakPoint])) {
							options = _.extend(options, options['breakpoint_' + self.activeBreakPoint]);
						}
					}

					if ('object' === typeof options) {
						if (options.background_slider) {
							self.getShortcodePreview($('#background_slider'), options.background_slider);
						}
						$.each(options, function(id, val) {
							$('#tfb_row_settings').find('#' + id).val(val);
						});

						$('#tfb_row_settings').find('.tfb_lb_option[type=radio]').each(function() {
							var id = $(this).prop('name');
							if ('undefined' !== typeof options[id]) {
								if ($(this).val() === options[id]) {
									$(this).prop('checked', true);
								}
							}
						});
					}

					// image field
					$('#tfb_row_settings').find('.themify-builder-uploader-input').each(function() {
						var img_field = $(this).val(),
							img_thumb = $('<img/>', {
								src: img_field,
								width: 50,
								height: 50
							});

						if (img_field != '') {
							$(this).parent().find('.img-placeholder').empty().html(img_thumb);
						} else {
							$(this).parent().find('.thumb_preview').hide();
						}
					});

					 $( '.themify-gradient ' ).each(function(){
                                            var $key = $(this).prop('name');
                                                options = $.extend( {
                                                    $key : '',
                                                }, options );
                                            ThemifyPageBuilder.createGradientPicker( $( this ), options[$key] );
                                        });
					
					// builder
					$('#tfb_row_settings').find('.themify_builder_row_js_wrapper').each(function() {
						var $this_option = $(this),
							this_option_id = $this_option.attr('id'),
							$found_element = options ? options[this_option_id] : false;

						if ($found_element) {
							var row_append = 0;
							if ($found_element.length > 0) {
								row_append = $found_element.length - 1;
							}

							// add new row
							for (var i = 0; i < row_append; i++) {
								$this_option.parent().find('.add_new a').first().trigger('click');
							}

							$this_option.find('.themify_builder_row').each(function(r) {
								$(this).find('.tfb_lb_option_child').each(function(i) {
									var $this_option_child = $(this),
										this_option_id_real = $this_option_child.attr('id'),
										this_option_id_child = $this_option_child.hasClass('tfb_lb_wp_editor') ? $this_option_child.attr('name') : $this_option_child.data('input-id');
									if (!this_option_id_child) {
										this_option_id_child = this_option_id_real;
									}
									var $found_element_child = $found_element[r]['' + this_option_id_child + ''];

									if ($this_option_child.hasClass('themify-builder-uploader-input')) {
										var img_field = $found_element_child,
											img_thumb = $('<img/>', {
												src: img_field,
												width: 50,
												height: 50
											});

										if (img_field != '' && img_field != undefined) {
											$this_option_child.val(img_field);
											$this_option_child.parent().find('.img-placeholder').empty().html(img_thumb).parent().show();
										} else {
											$this_option_child.parent().find('.thumb_preview').hide();
										}
									} else if ($this_option_child.is('input, textarea, select')) {
										$this_option_child.val($found_element_child);
									}
								});
							});
						}
					});

					// set touch element
					self.touchElement();

					// colorpicker
					self.setColorPicker();

					// @backward-compatibility
					if ($('#background_video').val() !== '' && $('#background_type input:checked').length == 0) {
						$('#background_type_video').trigger('click');
					} else if ($('#background_type input:checked').length == 0) {
						$('#background_type_image').trigger('click');
					}

					$('.tf-option-checkbox-enable input:checked').trigger('click');

					// plupload init
					self.builderPlupload('normal');

					/* checkbox field type */
					$('.themify-checkbox').each(function() {
						var id = $(this).attr('id');
						if (options && options[id]) {
							options[id] = typeof options[id] == 'string' ? [options[id]] : options[id]; // cast the option value as array
							// First unchecked all to fixed checkbox has default value.
							$(this).find('.tf-checkbox').prop('checked', false);
							// Set the values
							$.each(options[id], function(i, v) {
								$('.tf-checkbox[value="' + v + '"]').prop('checked', true);
							});
						}
					});

					// Hide non responsive fields
					if ('desktop' !== self.activeBreakPoint) {
						$('.responsive-na').hide();
						if( $.inArray( temp_background_type, ['video', 'slider'] ) > -1 ){
							$.each(['background_repeat', 'background_position', 'background_image'], function(i, v){
								if ( 'video' == temp_background_type && 'background_image' == v ) return true;
								$('#' + v).closest('.themify_builder_field').hide();
							});
						}
					}

					$('body').trigger('editing_row_option', [options]);

					// builder drag n drop init
					self.rowOptionBuilder();

					ThemifyBuilderCommon.Lightbox.rememberRow();
					self.liveStylingInstance.init($currentSelectedRow, options);
					// "Apply all" // apply all init
					self.applyAll_init();

					if ($this.closest('.themify_builder_style_row').length > 0) {
						$('a[href="#themify_builder_row_fields_styling"]').trigger('click');
					}
										ThemifyBuilderCommon.fontPreview($('#themify_builder_lightbox_container'),options);
				};

			ThemifyBuilderCommon.highlightRow($this.closest('.themify_builder_row'));

			ThemifyBuilderCommon.undoManager.setStartValue($currentSelectedRow.closest('.themify_builder_content')[0].innerHTML);

			ThemifyBuilderCommon.Lightbox.open({
				loadMethod: 'inline',
				templateID: 'builder_form_row'
			}, callback);
		},
		optionColumn: function(e) {
			e.preventDefault();

			var self = ThemifyPageBuilder,
				$this = $(this),
				$currentSelectedCol = $this.closest('.themify_builder_col'),
				options = ThemifyBuilderCommon.getColumnStylingSettings($currentSelectedCol),
				callback = function() {
					$('<div/>', {
						class: 'tfb_column_settings_entire_data'
					}).data('entire-data', options).appendTo($('#tfb_column_settings'));
					if ('desktop' !== self.activeBreakPoint) {
						var styleFields = $('#tfb_column_settings .tfb_lb_option').map(function() {
							return $(this).attr('id');
						}).get(), temp_background_type = options.background_type;
						options = _.omit(options, styleFields);

						if (!_.isUndefined(options['breakpoint_' + self.activeBreakPoint]) && _.isObject(options['breakpoint_' + self.activeBreakPoint])) {
							options = _.extend(options, options['breakpoint_' + self.activeBreakPoint]);
						}
					}

					if ('object' === typeof options) {

						if (options.background_slider) {
							self.getShortcodePreview($('#background_slider'), options.background_slider);
						}
						$.each(options, function(id, val) {
							$('#tfb_column_settings').find('#' + id).val(val);
						});

						$('#tfb_column_settings').find('.tfb_lb_option[type=radio]').each(function() {
							var id = $(this).prop('name');
							if ('undefined' !== typeof options[id]) {
								if ($(this).val() === options[id]) {
									$(this).prop('checked', true);
								}
							}
						});
					}

					// image field
					$('#tfb_column_settings').find('.themify-builder-uploader-input').each(function() {
						var img_field = $(this).val(),
							img_thumb = $('<img/>', {
								src: img_field,
								width: 50,
								height: 50
							});

						if (img_field != '') {
							$(this).parent().find('.img-placeholder').empty().html(img_thumb);
						} else {
							$(this).parent().find('.thumb_preview').hide();
						}
					});
                                        
                                        
                                        $( '.themify-gradient ' ).each(function(){
                                            var $key = $(this).prop('name');
                                            options = $.extend( {
						$key : '',
                                            }, options );
                                            ThemifyPageBuilder.createGradientPicker( $( this ), options[$key] );
                                        });
					// set touch element
					self.touchElement();

					// colorpicker
					self.setColorPicker();

					// @backward-compatibility
					if ($('#background_video').val() !== '' && $('#background_type input:checked').length == 0) {
						$('#background_type_video').trigger('click');
					} else if ($('#background_type input:checked').length == 0) {
						$('#background_type_image').trigger('click');
					}

					$('.tf-option-checkbox-enable input:checked').trigger('click');

					// plupload init
					self.builderPlupload('normal');

					/* checkbox field type */
					$('.themify-checkbox').each(function() {
						var id = $(this).attr('id');
						if (options[id]) {
							options[id] = typeof options[id] == 'string' ? [options[id]] : options[id]; // cast the option value as array
							// First unchecked all to fixed checkbox has default value.
							$(this).find('.tf-checkbox').prop('checked', false);
							// Set the values
							$.each(options[id], function(i, v) {
								$('.tf-checkbox[value="' + v + '"]').prop('checked', true);
							});
						}
					});

					// Hide non responsive fields
					if ('desktop' !== self.activeBreakPoint) {
						$('.responsive-na').hide();
						if( $.inArray( temp_background_type, ['video', 'slider'] ) > -1 ){
							$.each(['background_repeat', 'background_position', 'background_image'], function(i, v){
								if ( 'video' == temp_background_type && 'background_image' == v ) return true;
								$('#' + v).closest('.themify_builder_field').hide();
							});
						}
					}

					$('body').trigger('editing_column_option', [options]);

					ThemifyBuilderCommon.Lightbox.rememberRow();
					self.liveStylingInstance.init($currentSelectedCol, options);
					// "Apply all" // apply all init
					self.applyAll_init();
                                        ThemifyBuilderCommon.fontPreview($('#themify_builder_lightbox_container'),options);
				};

			ThemifyBuilderCommon.highlightColumn($this.closest('.themify_builder_col'));
			ThemifyBuilderCommon.highlightRow($this.closest('.themify_builder_row'));

			ThemifyBuilderCommon.undoManager.setStartValue($currentSelectedCol.closest('.themify_builder_content')[0].innerHTML);

			ThemifyBuilderCommon.Lightbox.open({
				loadMethod: 'inline',
				templateID: 'builder_form_column'
			}, callback);
		},
		rowSaving: function(e) {
			e.preventDefault();
			var self = ThemifyPageBuilder,
				$currentSelectedRow = $('.current_selected_row'),
				builder_id = $currentSelectedRow.closest('.themify_builder_content').data('postid'),
				$active_row_settings = $('.current_selected_row .row-data-styling'),
				temp_appended_data = $('#tfb_row_settings .tfb_lb_option').themifySerializeObject(),
				entire_appended_data = $('#tfb_row_settings').find('.tfb_row_settings_entire_data').data('entire-data') || {},
				temp_style_data = {};

			if ('desktop' !== self.activeBreakPoint) {
				var styleFields = $('#themify_builder_row_fields_styling .tfb_lb_option').map(function() {
					return $(this).attr('id');
				}).get();

				// get current styling data
				temp_style_data = _.pick(temp_appended_data, styleFields);

				// revert desktop styling data
				temp_appended_data = _.omit(temp_appended_data, styleFields);
				temp_appended_data = _.extend(temp_appended_data, _.pick(entire_appended_data, styleFields));

				// append breakpoint data
				temp_appended_data['breakpoint_' + self.activeBreakPoint] = temp_style_data;

				// Check for another breakpoint
				_.each(_.omit(themifyBuilder.breakpoints, self.activeBreakPoint), function(value, key) {
					if (!_.isUndefined(entire_appended_data['breakpoint_' + key])) {
						temp_appended_data['breakpoint_' + key] = entire_appended_data['breakpoint_' + key];
					}
				});
			} else {
				// Check for another breakpoint
				_.each(themifyBuilder.breakpoints, function(value, key) {
					if (!_.isUndefined(entire_appended_data['breakpoint_' + key])) {
						temp_appended_data['breakpoint_' + key] = entire_appended_data['breakpoint_' + key];
					}
				});
			}

			$('#tfb_row_settings').find('.themify_builder_row_js_wrapper').each(function() {
				var this_option_id = $(this).attr('id'),
					row_items = [];

				$(this).find('.themify_builder_row').each(function() {
					var temp_rows = {};

					$(this).find('.tfb_lb_option_child').each(function() {
						var option_value_child,
							this_option_id_child = $(this).data('input-id');
						if (!this_option_id_child) {
							this_option_id_child = $(this).attr('id');
						}

						option_value_child = $(this).val();

						if (option_value_child) {
							temp_rows[this_option_id_child] = option_value_child;
						}
					});

					row_items.push(temp_rows);
				});

				if (row_items) {
					temp_appended_data[this_option_id] = row_items;
				}
			});

			$active_row_settings.data('styling', temp_appended_data);

			var sendData = ThemifyPageBuilder._getSettings($currentSelectedRow, 0);

			self.liveUpdateRow(builder_id, sendData, null,
				ThemifyBuilderCommon.Lightbox.previewButtonClicked($(this)));

			self.editing = true;
		},
		columnSaving: function(e) {
			e.preventDefault();
			var self = ThemifyPageBuilder,
				$currentSelectedColumn = $('.current_selected_column'),
				builder_id = $currentSelectedColumn.closest('.themify_builder_content').data('postid'),
				$active_column_settings = $('.current_selected_column').children('.column-data-styling');

			var $parentCol = $currentSelectedColumn.parent().closest('.themify_builder_col');

			// Detect if a column OR a sub-column was selected
			if ($parentCol.length) {
				// a sub-column was selected
				var component = 'sub-column';
			} else {
				var component = 'column';
			}

			var $selectedRow = 'sub-column' === component ? $currentSelectedColumn.closest('.themify_builder_sub_row') : $currentSelectedColumn.closest('.themify_builder_row'),
				col_index = $currentSelectedColumn.index(),
				row_index = $selectedRow.index();

			var temp_appended_data = $('#tfb_column_settings .tfb_lb_option').themifySerializeObject(),
				entire_appended_data = $('#tfb_column_settings').find('.tfb_column_settings_entire_data').data('entire-data') || {},
				temp_style_data = {};

			if ('desktop' !== self.activeBreakPoint) {
				var styleFields = $('#tfb_column_settings .tfb_lb_option').map(function() {
					return $(this).attr('id');
				}).get();

				// get current styling data
				temp_style_data = temp_appended_data;

				// revert desktop styling data
				temp_appended_data = _.omit(temp_appended_data, styleFields);
				temp_appended_data = _.extend(temp_appended_data, _.pick(entire_appended_data, styleFields));

				// append breakpoint data
				temp_appended_data['breakpoint_' + self.activeBreakPoint] = temp_style_data;

				// Check for another breakpoint
				_.each(_.omit(themifyBuilder.breakpoints, self.activeBreakPoint), function(value, key) {
					if (!_.isUndefined(entire_appended_data['breakpoint_' + key])) {
						temp_appended_data['breakpoint_' + key] = entire_appended_data['breakpoint_' + key];
					}
				});
			} else {
				// Check for another breakpoint
				_.each(themifyBuilder.breakpoints, function(value, key) {
					if (!_.isUndefined(entire_appended_data['breakpoint_' + key])) {
						temp_appended_data['breakpoint_' + key] = entire_appended_data['breakpoint_' + key];
					}
				});
			}
			$active_column_settings.data('styling', temp_appended_data);

			var rowData = 'sub-column' === component ? self._getSubRowSettings( $selectedRow, row_index ) : self._getSettings($selectedRow, row_index),
			colDataPlainObject = rowData.cols[ col_index ];

			colDataPlainObject['column_order'] = col_index;
			colDataPlainObject['grid_class'] = ThemifyBuilderCommon.getColClassName( $currentSelectedColumn );

			if ( 'column' === component ) {
				colDataPlainObject['row_order'] = row_index;
			} else {
				colDataPlainObject['sub_row_order'] = $selectedRow.add($selectedRow.siblings()).filter('.themify_builder_sub_row, .active_module').index();
				colDataPlainObject['row_order'] = $currentSelectedColumn.closest('.themify_builder_row').index();
				colDataPlainObject['col_order'] = $currentSelectedColumn.parents('.themify_builder_col').index();
			}
			colDataPlainObject['component_name'] = component;

			self.renderColumn( $currentSelectedColumn, JSON.stringify( colDataPlainObject ) );

			self.editing = true;
		},
		// TODO: remove previewOnly as preview btn was removed.
		liveUpdateRow: function(builder_id, sendData, colLocationObj, previewOnly) {
			var self = ThemifyPageBuilder,
				$currentSelectedRow = $('.current_selected_row'),
				rowIndex = $currentSelectedRow.index(),
				class_hilite = 'r' + rowIndex,
				hilite_obj = {
					row: rowIndex
				},
				$builder_selector = $currentSelectedRow.closest('.themify_builder_content'),
				previewOnly = typeof previewOnly !== 'undefined' ? previewOnly : false,
				startValue = ThemifyBuilderCommon.undoManager.getStartValue() || $builder_selector[0].innerHTML; // startValue is used to capture previous builder output before its updated. used for undo/redo features.

			$currentSelectedRow.wrap('<div class="temp_row_placeholder ' + class_hilite + '" />');

			$.ajax({
				type: "POST",
				url: themifyBuilder.ajaxurl,
				dataType: 'json',
				data: {
					action: 'tfb_load_row_partial',
					post_id: builder_id,
					nonce: themifyBuilder.tfb_load_nonce,
					row: JSON.stringify(sendData),
					builder_grid_activate: 1
				},
				beforeSend: function(xhr) {
					if (previewOnly) {
						ThemifyBuilderCommon.showLoader('lightbox-preview');
					} else {
						ThemifyBuilderCommon.showLoader('show');
						ThemifyBuilderCommon.Lightbox.close();

					}
				},
				success: function(data) {
					var $newElems = $(data.html),
						parent = $builder_selector.find('.temp_row_placeholder.' + class_hilite);

					// goto mod element
					if (parent.length > 0) {
						$('html,body').animate({
							scrollTop: parent.offset().top - 150
						}, 500);
						parent.empty();
					}

					$newElems.addClass('current_selected_row');

					var $currentCol = null;

					// for col/sub-col styling, select current column
					if (typeof colLocationObj !== 'undefined' && colLocationObj !== null) {
						$currentCol = ThemifyBuilderCommon.findColumnInNewRow($newElems, colLocationObj);

						$currentCol.addClass('current_selected_column');
					}

					$newElems.css('visibility', 'visible');
					parent.get(0).innerHTML = $newElems.get(2).outerHTML;
					parent.find('.themify_builder_row').first().unwrap();

					if (previewOnly) {
						var $currentStyledComponent = $newElems;
						var stylingSettings = ThemifyBuilderCommon.getRowStylingSettings($newElems);

						if ($currentCol !== null) {
							$currentStyledComponent = $currentCol;
							stylingSettings = ThemifyBuilderCommon.getColumnStylingSettings($currentCol);
						}

						self.liveStylingInstance.init(
							$currentStyledComponent,
							stylingSettings
						);

					} else {
						self.newRowAvailable();
					}

					self.moduleEvents();
					self.loadContentJs();

					// Load google font style
					if ('undefined' !== typeof WebFont && data.gfonts.length > 0) {
						WebFont.load({
							google: {
								families: data.gfonts
							}
						});
					}
                                        ThemifyBuilderCommon.columnDrag($('.current_selected_row'),false);
					if (previewOnly) {
						ThemifyBuilderCommon.showLoader('lightbox-preview-hide');
					} else {
						ThemifyBuilderCommon.showLoader('hide');

						// Logs undo action
						var newValue = $builder_selector[0].innerHTML;
						if (startValue !== newValue) {
							ThemifyBuilderCommon.undoManager.events.trigger('change', [$builder_selector[0], startValue, newValue]);
						}
						self.responsiveFrame.doSync();
					}
                                        
					// Hook
					$('body').trigger('builder_load_row_partial', $newElems);
				}
			});
		},
		renderColumn: function( $column, sendData ) {
			var builder_id = $column.closest('.themify_builder_content').data('postid'),
				$base = $column.parent();

			return $.ajax({
				type: "POST",
				url: themifyBuilder.ajaxurl,
				dataType: 'json',
				data: {
					action: 'tfb_render_column',
					post_id: builder_id,
					nonce: themifyBuilder.tfb_load_nonce,
					column_data: sendData,
					builder_grid_activate: 1
				},
				beforeSend: function(xhr) {
					ThemifyBuilderCommon.showLoader('show');
					ThemifyBuilderCommon.Lightbox.close();
				},
				success: function( data ) {
                                    var $current = $('.current_selected_column');
                                        if(data.classes){ 
                                            $current.closest('.themify_builder_row').addClass(data.classes);
                                        }
					var $newColumn = $(data.html);
					$current.get(0).outerHTML = $newColumn.get(0).outerHTML;

					ThemifyPageBuilder.moduleEvents();
					ThemifyPageBuilder.loadContentJs();

					$base.children().removeClass('first last');
					$base.children().first().addClass('first');
					$base.children().last().addClass('last');
                                        ThemifyBuilderCommon.columnDrag($base,false);
					ThemifyPageBuilder.showLoader('hide');
                                        ThemifyPageBuilder.responsiveFrame.doSync();
				}
			});
		},
		renderSubRow: function( $subRow, sendData ) {
			var builder_id = $subRow.closest('.themify_builder_content').data('postid');

			return $.ajax({
				type: "POST",
				url: themifyBuilder.ajaxurl,
				dataType: 'json',
				data: {
					action: 'tfb_render_sub_row',
					post_id: builder_id,
					nonce: themifyBuilder.tfb_load_nonce,
					sub_row_data: sendData,
					builder_grid_activate: 1
				},
				beforeSend: function(xhr) {
					ThemifyBuilderCommon.showLoader('show');
					ThemifyBuilderCommon.Lightbox.close();
				},
				success: function( data ) {

					var $newSubRow = $(data.html);
					$subRow.get(0).outerHTML = $newSubRow.get(0).outerHTML;

					ThemifyPageBuilder.moduleEvents();
					ThemifyPageBuilder.loadContentJs();

					ThemifyPageBuilder.showLoader('hide');
				}
			});
		},
		builderImportFile: function(e) {
			e.preventDefault();
			var self = ThemifyPageBuilder,
				options = {
					dataType: 'html',
					data: {
						action: 'builder_import_file'
					}
				},
				callback = function() {
					self.builderImportPlupload();
				};

			if (confirm(themifyBuilder.importFileConfirm)) {
				ThemifyBuilderCommon.Lightbox.open(options, callback);
			}
		},
		builderImportPlupload: function() {
			var $builderPluploadUpload = $(".themify-builder-plupload-upload-uic");

			if ($builderPluploadUpload.length > 0) {
				var pconfig = false;
				$builderPluploadUpload.each(function() {
					var $this = $(this),
						id1 = $this.attr("id"),
						imgId = id1.replace("themify-builder-plupload-upload-ui", "");

					pconfig = JSON.parse(JSON.stringify(themify_builder_plupload_init));

					pconfig["browse_button"] = imgId + pconfig["browse_button"];
					pconfig["container"] = imgId + pconfig["container"];
					pconfig["drop_element"] = imgId + pconfig["drop_element"];
					pconfig["file_data_name"] = imgId + pconfig["file_data_name"];
					pconfig["multipart_params"]["imgid"] = imgId;
					pconfig["multipart_params"]["_ajax_nonce"] = themifyBuilder.tfb_load_nonce;;
					pconfig["multipart_params"]['topost'] = themifyBuilder.post_ID;

					var uploader = new plupload.Uploader(pconfig);

					uploader.bind('Init', function(up) {});

					uploader.init();

					// a file was added in the queue
					uploader.bind('FilesAdded', function(up, files) {
						up.refresh();
						up.start();
						ThemifyBuilderCommon.showLoader('show');
					});

					uploader.bind('Error', function(up, error) {
						var $promptError = $('.prompt-box .show-error');
						$('.prompt-box .show-login').hide();
						$promptError.show();

						if ($promptError.length > 0) {
							$promptError.html('<p class="prompt-error">' + error.message + '</p>');
						}
						$(".overlay, .prompt-box").fadeIn(500);
					});

					// a file was uploaded
					uploader.bind('FileUploaded', function(up, file, response) {
						var json = JSON.parse(response['response']),
							status;

						if ('200' == response['status'] && !json.error) {
							status = 'done';
						} else {
							status = 'error';
						}

						$("#themify_builder_alert").removeClass("busy").addClass(status).delay(800).fadeOut(800, function() {
							$(this).removeClass(status);
						});

						if (json.error) {
							alert(json.error);
							return;
						}

						$('#themify_builder_alert').promise().done(function() {
							ThemifyBuilderCommon.Lightbox.close();
							window.location.reload();
						});

					});

				});
			}
		},
		builderLoadLayout: function(event) {
			event.preventDefault();
			var options = {
				dataType: 'html',
				data: {
					action: 'tfb_load_layout'
				}
			};

			ThemifyBuilderCommon.Lightbox.open(options, null);
		},
		builderSaveLayout: function(event) {
			event.preventDefault();
			var options = {
					data: {
						action: 'tfb_custom_layout_form',
						postid: themifyBuilder.post_ID
					}
				},
				callback = function() {
					// plupload init
					ThemifyPageBuilder.builderPlupload('normal');
				};
			ThemifyBuilderCommon.Lightbox.open(options, callback);
		},
		copyComponentBuilder: function(event) {
			event.preventDefault();

			var $thisElem = $(this);
			var self = ThemifyPageBuilder;
			var component = ThemifyBuilderCommon.detectBuilderComponent($thisElem);

			switch (component) {
				case 'row':
					var $selectedRow = $thisElem.closest('.themify_builder_row');

					var rowOrder = $selectedRow.index();
					var rowData = self._getSettings($selectedRow, rowOrder);
					var rowDataInJson = JSON.stringify(rowData);

					ThemifyBuilderCommon.Clipboard.set('row', rowDataInJson);

					$selectedRow.find('.themify_builder_dropdown').hide();
					break;

				case 'sub-row':
					var $selectedSubRow = $thisElem.closest('.themify_builder_sub_row');

					var subRowOrder = $selectedSubRow.index();
					var subRowData = self._getSubRowSettings($selectedSubRow, subRowOrder);
					var subRowDataInJSON = JSON.stringify(subRowData);

					ThemifyBuilderCommon.Clipboard.set('sub-row', subRowDataInJSON);
					break;

				case 'module':
					var $selectedModule = $thisElem.closest('.themify_builder_module_front');

					var moduleName = $selectedModule.find('.front_mod_settings').data('mod-name');
					var moduleData = JSON.parse($selectedModule.find('.front_mod_settings')
						.find('script[type="text/json"]').text());

					var moduleDataInJson = JSON.stringify({
						mod_name: moduleName,
						mod_settings: moduleData
					});

					ThemifyBuilderCommon.Clipboard.set('module', moduleDataInJson);
					break;

				case 'column':
				case 'sub-column':
					var $selectedColumn = $thisElem.closest('.themify_builder_col'),
						$selectedRow = 'sub-column' === component ? $thisElem.closest('.themify_builder_sub_row') : $thisElem.closest('.themify_builder_row'),
						rowOrder = $selectedRow.index(),
						rowData = 'sub-column' === component ? self._getSubRowSettings( $selectedRow, rowOrder ) : self._getSettings($selectedRow, rowOrder),
						columnOrder = $selectedColumn.index(),
						columnData = rowData.cols[ columnOrder ],
						columnDataInJson = JSON.stringify(columnData);

					ThemifyBuilderCommon.Clipboard.set(component, columnDataInJson);

					break;
			}
		},
		pasteComponentBuilder: function(event) {
			event.preventDefault();

			var $thisElem = $(this);
			var self = ThemifyPageBuilder;
			var component = ThemifyBuilderCommon.detectBuilderComponent($thisElem);

			var dataInJSON = ThemifyBuilderCommon.Clipboard.get(component);

			if (dataInJSON === false) {
				ThemifyBuilderCommon.alertWrongPaste();
				return;
			}

			if (!ThemifyBuilderCommon.confirmDataPaste()) {
				return;
			}

			switch (component) {
				case 'row':
					var $selectedRow = $thisElem.closest('.themify_builder_row');

					ThemifyBuilderCommon.highlightRow($selectedRow);

					var rowDataPlainObject = JSON.parse(dataInJSON);

					var builderId = $selectedRow.closest('.themify_builder_content').data('postid');

					self.liveUpdateRow(builderId, rowDataPlainObject);
					break;

				case 'sub-row':
					var $selectedRow = $thisElem.closest('.themify_builder_row'),
						$selectedSubRow = $thisElem.closest('.themify_builder_sub_row'),
						subRowDataPlainObject = JSON.parse(dataInJSON);

					subRowDataPlainObject['sub_row_order'] = $selectedSubRow.add($selectedSubRow.siblings()).filter('.themify_builder_sub_row, .active_module').index();
					subRowDataPlainObject['row_order'] = $selectedRow.index();
					subRowDataPlainObject['col_order'] = $selectedSubRow.closest('.themify_builder_col').index();

					self.renderSubRow( $selectedSubRow, JSON.stringify( subRowDataPlainObject ) );

					break;

				case 'module':
					var $selectedModule = $thisElem.closest('.module_menu_front');

					self.highlightModuleFront($selectedModule);

					var modDataPlainObject = JSON.parse(dataInJSON);

					var modSettings = modDataPlainObject['mod_settings'];
					var modName = modDataPlainObject['mod_name'];

					var hilite = $('.current_selected_module').parents('.themify_builder_module_front'),
						class_hilite = self.getHighlightClass(hilite),
						hilite_obj = self.getHighlightObject(hilite);

					$('#themify_builder_lightbox_parent').hide();
					hilite.wrap('<div class="temp_placeholder ' + class_hilite + '" />').find('.themify_builder_module_front_overlay').show();

					self.updateContent(class_hilite, hilite_obj, modName, modSettings);

					ThemifyBuilderCommon.showLoader('hide');
					break;

				case 'column':
				case 'sub-column':
					var $selectedCol = $thisElem.closest('.themify_builder_col'),
						$selectedRow = 'column' === component ? $thisElem.closest('.themify_builder_row') : $thisElem.closest('.themify_builder_sub_row'),
						col_index = $selectedCol.index(),
						row_index = $selectedRow.index(),
						colDataPlainObject = JSON.parse(dataInJSON);

						ThemifyBuilderCommon.highlightColumn( $selectedCol );

						colDataPlainObject['column_order'] = col_index;
						colDataPlainObject['grid_class'] = ThemifyBuilderCommon.getColClassName( $selectedCol );

						if ( 'column' === component ) {
							colDataPlainObject['row_order'] = row_index;
						} else {
							colDataPlainObject['sub_row_order'] = $selectedRow.add($selectedRow.siblings()).filter('.themify_builder_sub_row, .active_module').index();
							colDataPlainObject['row_order'] = $selectedCol.closest('.themify_builder_row').index();
							colDataPlainObject['col_order'] = $selectedCol.parents('.themify_builder_col').index();
						}
						colDataPlainObject['component_name'] = component;

						self.renderColumn( $selectedCol, JSON.stringify( colDataPlainObject ) );
					break;
			}

			self.editing = true;
		},
		importComponentBuilder: function(event) {
			event.preventDefault();

			var $thisElem = $(this);
			var self = ThemifyPageBuilder;
			var component = ThemifyBuilderCommon.detectBuilderComponent($thisElem);

			var options = {
				data: {
					action: 'tfb_imp_component_data_lightbox_options'
				}
			};

			switch (component) {
				case 'row':
					var $selectedRow = $thisElem.closest('.themify_builder_row');
					options.data.component = 'row';

					ThemifyBuilderCommon.highlightRow($selectedRow);
					ThemifyBuilderCommon.Lightbox.open(options, null);
					break;

				case 'sub-row':
					var $selectedSubRow = $thisElem.closest('.themify_builder_sub_row');
					var $selectedRow = $thisElem.closest('.themify_builder_row');
					options.data.component = 'sub-row';

					ThemifyBuilderCommon.highlightRow($selectedRow);
					ThemifyBuilderCommon.highlightSubRow($selectedSubRow);
					ThemifyBuilderCommon.Lightbox.open(options, null);
					break;

				case 'module':
					var $selectedModule = $thisElem.closest('.module_menu_front');
					options.data.component = 'module';

					self.highlightModuleFront($selectedModule);
					ThemifyBuilderCommon.Lightbox.open(options, null);
					break;

				case 'column':
				case 'sub-column':
					var $selectedCol = $thisElem.closest('.themify_builder_col'),
						$selectedRow = 'column' === component ? $thisElem.closest('.themify_builder_row') : $thisElem.closest('.themify_builder_sub_row');
					options.data.component = component;
					options.data.indexData = { row: $selectedRow.index(), col: $selectedCol.index() };

					ThemifyBuilderCommon.highlightColumn($selectedCol);
					ThemifyBuilderCommon.Lightbox.open(options, null);
					break;
			}
		},
		exportComponentBuilder: function(event) {
			event.preventDefault();

			var $thisElem = $(this);
			var self = ThemifyPageBuilder;
			var component = ThemifyBuilderCommon.detectBuilderComponent($thisElem);

			var options = {
				data: {
					action: 'tfb_exp_component_data_lightbox_options'
				}
			};

			switch (component) {
				case 'row':
					var $selectedRow = $thisElem.closest('.themify_builder_row');
					options.data.component = 'row';

					var rowCallback = function() {
						var rowOrder = $selectedRow.index();

						var rowData = self._getSettings($selectedRow, rowOrder);
						rowData['component_name'] = 'row';

						var rowDataInJson = JSON.stringify(rowData);

						var $rowDataTextField = $('#tfb_exp_row_data_field');
						$rowDataTextField.val(rowDataInJson);

						self._autoSelectInputField($rowDataTextField);
						$rowDataTextField.on('click', function() {
							self._autoSelectInputField($rowDataTextField)
						});
					};

					ThemifyBuilderCommon.Lightbox.open(options, rowCallback);
					break;

				case 'sub-row':
					var $selectedSubRow = $thisElem.closest('.themify_builder_sub_row');
					options.data.component = 'sub-row';

					var subRowCallback = function() {
						var subRowOrder = $selectedSubRow.index();

						var subRowData = self._getSubRowSettings($selectedSubRow, subRowOrder);
						subRowData['component_name'] = 'sub-row';

						var subRowDataInJSON = JSON.stringify(subRowData);

						var $subRowDataTextField = $('#tfb_exp_sub_row_data_field');
						$subRowDataTextField.val(subRowDataInJSON);

						self._autoSelectInputField($subRowDataTextField);
						$subRowDataTextField.on('click', function() {
							self._autoSelectInputField($subRowDataTextField)
						});
					};

					ThemifyBuilderCommon.Lightbox.open(options, subRowCallback);
					break;

				case 'module':
					var $selectedModule = $thisElem.closest('.themify_builder_module_front');
					options.data.component = 'module';

					var moduleCallback = function() {
						var moduleName = $selectedModule.find('.front_mod_settings').data('mod-name');
						var moduleData = JSON.parse($selectedModule.find('.front_mod_settings')
							.find('script[type="text/json"]').text());

						var moduleDataInJson = JSON.stringify({
							mod_name: moduleName,
							mod_settings: moduleData,
							component_name: 'module'
						});

						var $moduleDataTextField = $('#tfb_exp_module_data_field');
						$moduleDataTextField.val(moduleDataInJson);

						self._autoSelectInputField($moduleDataTextField);
						$moduleDataTextField.on('click', function() {
							self._autoSelectInputField($moduleDataTextField)
						});
					};

					ThemifyBuilderCommon.Lightbox.open(options, moduleCallback);
					break;

				case 'column':
				case 'sub-column':
					var $selectedRow = 'column' === component ? $thisElem.closest('.themify_builder_row') : $thisElem.closest('.themify_builder_sub_row'),
						$selectedCol = $thisElem.closest('.themify_builder_col');
					options.data.component = component;

					var columnCallback = function() {

						var rowOrder = $selectedRow.index(),
						rowData = 'column' === component ? self._getSettings($selectedRow, rowOrder) : self._getSubRowSettings($selectedRow, rowOrder),
						columnOrder = $selectedCol.index(),
						columnData = rowData.cols[ columnOrder ];
						columnData['component_name'] = component;

						var columnDataInJson = JSON.stringify(columnData),
							$columnDataTextField = $('#tfb_exp_'+ component.replace('-', '_') +'_data_field');
						$columnDataTextField.val(columnDataInJson);

						self._autoSelectInputField($columnDataTextField);
						$columnDataTextField.on('click', function() {
							self._autoSelectInputField($columnDataTextField)
						});
					};

					ThemifyBuilderCommon.Lightbox.open(options, columnCallback);
					break;
			}
		},
		importRowModBuilderFormSave: function(event) {
			event.preventDefault();

			var $form = $("#tfb_imp_component_form");
			var self = ThemifyPageBuilder;
			var component = $form.find("input[name='component']").val();

			switch (component) {
				case 'row':
					var $rowDataField = $form.find('#tfb_imp_row_data_field');
					var rowDataPlainObject = JSON.parse($rowDataField.val());

					if (!rowDataPlainObject.hasOwnProperty('component_name') ||
						rowDataPlainObject['component_name'] !== 'row') {
						ThemifyBuilderCommon.alertWrongPaste();
						return;
					}

					var builderId = $('.current_selected_row').closest('.themify_builder_content').data('postid');

					self.liveUpdateRow(builderId, rowDataPlainObject);
					break;

				case 'sub-row':
					var $subRowDataField = $form.find('#tfb_imp_sub_row_data_field');
					var subRowDataPlainObject = JSON.parse($subRowDataField.val());

					if (!subRowDataPlainObject.hasOwnProperty('component_name') ||
						subRowDataPlainObject['component_name'] !== 'sub-row') {
						ThemifyBuilderCommon.alertWrongPaste();
						return;
					}

					var $selectedRow = $('.current_selected_row');
					var $selectedSubRow = $('.current_selected_sub_row');

					subRowDataPlainObject['sub_row_order'] = $selectedSubRow.add($selectedSubRow.siblings()).filter('.themify_builder_sub_row, .active_module').index();
					subRowDataPlainObject['row_order'] = $selectedRow.index();
					subRowDataPlainObject['col_order'] = $selectedSubRow.closest('.themify_builder_col').index();

					self.renderSubRow( $selectedSubRow, JSON.stringify( subRowDataPlainObject ) );

					break;

				case 'module':
					var $modDataField = $form.find('#tfb_imp_module_data_field');
					var modDataPlainObject = JSON.parse($modDataField.val());

					if (!modDataPlainObject.hasOwnProperty('component_name') ||
						modDataPlainObject['component_name'] !== 'module') {
						ThemifyBuilderCommon.alertWrongPaste();
						return;
					}

					var modSettings = modDataPlainObject['mod_settings'];
					var modName = modDataPlainObject['mod_name'];

					var hilite = $('.current_selected_module').parents('.themify_builder_module_front'),
						class_hilite = self.getHighlightClass(hilite),
						hilite_obj = self.getHighlightObject(hilite);

					ThemifyBuilderCommon.Lightbox.close();
					hilite.wrap('<div class="temp_placeholder ' + class_hilite + '" />').find('.themify_builder_module_front_overlay').show();

					self.updateContent(class_hilite, hilite_obj, modName, modSettings);

					ThemifyBuilderCommon.showLoader('hide');
					break;

				case 'column':
				case 'sub-column':
					var $colDataField = $form.find('#tfb_imp_'+ component.replace('-', '_') +'_data_field');
					var colDataPlainObject = JSON.parse($colDataField.val());

					if (!colDataPlainObject.hasOwnProperty('component_name') ||
						colDataPlainObject['component_name'] !== component) {
						ThemifyBuilderCommon.alertWrongPaste();
						return;
					}

					var $column = $('.current_selected_column'),
						$row = 'column' === component ? $column.closest('.themify_builder_row') : $column.closest('.themify_builder_sub_row'),
						row_index = $row.index(),
						col_index = $column.index();

					colDataPlainObject['column_order'] = col_index;
					colDataPlainObject['grid_class'] = ThemifyBuilderCommon.getColClassName( $column );
					if ( 'column' === component ) {
						colDataPlainObject['row_order'] = row_index;
					} else {
						colDataPlainObject['sub_row_order'] = $row.add($row.siblings()).filter('.themify_builder_sub_row, .active_module').index();
						colDataPlainObject['row_order'] = $column.closest('.themify_builder_row').index();
						colDataPlainObject['col_order'] = $column.parents('.themify_builder_col').index();
					}

					self.renderColumn( $column, JSON.stringify( colDataPlainObject ) );

					break;
			}

			self.editing = true;
		},
		_autoSelectInputField: function($inputField) {
			$inputField.trigger('focus').trigger('select');
		},
		templateSelected: function(event) {
			event.preventDefault();

			var self = ThemifyPageBuilder,
				$this = $(this);
			var options = {
				buttons: {
					no: {
						label: 'Replace Existing Layout'
					},
					yes: {
						label: 'Append Existing Layout'
					}
				}
			};

			ThemifyBuilderCommon.LiteLightbox.confirm(themifyBuilder.confirm_template_selected, function(response) {
				var action = '';
				if ('no' == response) {
					action = 'tfb_set_layout';
				} else {
					action = 'tfb_append_layout';
				}
				$.ajax({
					type: "POST",
					url: themifyBuilder.ajaxurl,
					dataType: 'json',
					data: {
						action: action,
						nonce: themifyBuilder.tfb_load_nonce,
						layout_slug: $this.data('layout-slug'),
						current_builder_id: themifyBuilder.post_ID,
						layout_group: $this.data('group')
					},
					success: function(data) {
						ThemifyBuilderCommon.Lightbox.close();
						if (data.status == 'success') {
							window.location.hash = '#builder_active';
							window.location.reload()
						} else {
							alert(data.msg);
						}
					}
				});
			}, options);
		},
		saveAsLayout: function(event) {
			event.preventDefault();

			var submit_data = $('#tfb_save_layout_form').serialize();
			$.ajax({
				type: "POST",
				url: themifyBuilder.ajaxurl,
				dataType: 'json',
				data: {
					action: 'tfb_save_custom_layout',
					nonce: themifyBuilder.tfb_load_nonce,
					form_data: submit_data
				},
				success: function(data) {
					if (data.status == 'success') {
						ThemifyBuilderCommon.Lightbox.close();
					} else {
						alert(data.msg);
					}
				}
			});
		},
		_gridMenuClicked: function(event) {
			event.preventDefault();
			var $this = $(this),
				set = $(this).data('grid'),
				handle = $(this).data('handle'),
				$builder_container = $this.closest('.themify_builder_content')[0],
				$base, is_sub_row = false,
				startValue = $builder_container.innerHTML;

			$(this).closest('.themify_builder_grid_list').find('.selected').removeClass('selected');
			$(this).closest('li').addClass('selected');
			switch (handle) {
				case 'module':
					var sub_row_func = wp.template('builder_sub_row'),
						tmpl_sub_row = sub_row_func({
							placeholder: themifyBuilder.dropPlaceHolder,
							newclass: 'col-full'
						}),
						$mod_clone = $(this).closest('.active_module').clone();
					$mod_clone.find('.grid_menu').remove();

					$base = $(tmpl_sub_row).find('.themify_module_holder').append($mod_clone).end()
						.insertAfter($(this).closest('.active_module')).find('.themify_builder_sub_row_content');

					$(this).closest('.active_module').remove();
					break;

				case 'sub_row':
					is_sub_row = true;
					$base = $(this).closest('.themify_builder_sub_row').find('.themify_builder_sub_row_content');
					break;

				default:
					$base = $(this).closest('.themify_builder_row').find('.themify_builder_row_content');
			}

			$.each(set, function(i, v) {
				if ($base.children('.themify_builder_col').eq(i).length > 0) {
					$base.children('.themify_builder_col').eq(i).removeClass(ThemifyPageBuilder.clearClass).addClass('col' + v);
				} else {
					// Add column
					ThemifyPageBuilder._addNewColumn({
						placeholder: themifyBuilder.dropPlaceHolder,
						newclass: 'col' + v,
						component: is_sub_row ? 'sub-column' : 'column'
					}, $base);
				}
			});

			// remove unused column
			if (set.length < $base.children().length) {
				$base.children('.themify_builder_col').eq(set.length - 1).nextAll().each(function() {
					// relocate active_module
					var modules = $(this).find('.themify_module_holder').first().clone();
					modules.find('.empty_holder_text').remove();
					modules.children().appendTo($(this).prev().find('.themify_module_holder').first());
					$(this).remove(); // finally remove it
				});
			}

			$base.children().removeClass('first last');
			$base.children().first().addClass('first');
			$base.children().last().addClass('last');
                        
                        var $move_modules = false;
			// remove sub_row when fullwidth column
			if (is_sub_row && set[0] == '-full') {
                                $move_modules = $base.find('.active_module').clone();
				$move_modules.insertAfter($(this).closest('.themify_builder_sub_row'));
				$(this).closest('.themify_builder_sub_row').remove();
			}
                        
                        ThemifyPageBuilder.moduleEvents();

			// hide column 'alignment', 'equal column height' and 'gutter' when fullwidth column
			var $grid = is_sub_row && $move_modules?$move_modules.find('.themify_builder_grid_list'):$(this).closest('.themify_builder_grid_list');
			if (set[0] == '-full') {
				$grid.nextAll('.themify_builder_column_alignment').find('a:first').trigger('click');
				$grid.nextAll('.themify_builder_equal_column_height').find('input:checked').trigger('click');
				$grid.nextAll('.gutter_select').val('gutter-default').trigger('change');
				$grid.nextAll().hide();
			} else {
				$grid.nextAll().show();
			}
			// Log the action
			var newValue = $builder_container.innerHTML;
			if (startValue !== newValue) {
				ThemifyBuilderCommon.undoManager.events.trigger('change', [$builder_container, startValue, newValue]);
			}
                        ThemifyBuilderCommon.columnDrag($base,true);
		},
		_columnAlignmentMenuClicked: function(event) {
			event.preventDefault();

			var handle = $(this).data('handle'),
				alignment = $(this).data('alignment'),
				$row = null,
				$builder_container = $(this).closest('.themify_builder_content')[0],
				startValue = $builder_container.innerHTML;

			if (handle == 'module')
				return;

			$(this).closest('.themify_builder_column_alignment').find('.selected').removeClass('selected');
			$(this).closest('li').addClass('selected');

			if (handle == 'sub_row') {
				$row = $(this).closest('.themify_builder_sub_row');
			} else {
				$row = $(this).closest('.themify_builder_row');
			}

			$row.data('column-alignment', alignment).removeClass(themifyBuilder.columnAlignmentClass).addClass(alignment);

			// Log the action
			var newValue = $builder_container.innerHTML;
			if (startValue !== newValue) {
				ThemifyBuilderCommon.undoManager.events.trigger('change', [$builder_container, startValue, newValue]);
			}
		},
		_addNewColumn: function(params, $context) {
			var tmpl_func = wp.template('builder_column'),
				template = tmpl_func(params);
			$context.append($(template));
		},
		_gridHover: function(event) {
			if (event.type == 'touchend') {
				var $column_menu = $(this).find('.themify_builder_grid_list_wrapper');
				if ($column_menu.is(':hidden')) {
					$column_menu.show();
				} else {
					$column_menu.hide();
				}
			} else if (event.type == 'mouseenter') {
				$(this).find('.themify_builder_grid_list_wrapper').stop(false, true).show();
			} else if (event.type == 'mouseleave' && (event.toElement || event.relatedTarget)) {
				$(this).find('.themify_builder_grid_list_wrapper').stop(false, true).hide();
			}
		},
		_gutterChange: function(event) {
			var handle = $(this).data('handle');
			if (handle == 'module')
				return;

			switch (handle) {
				case 'sub_row':
					$(this).closest('.themify_builder_sub_row').data('gutter', this.value).removeClass(themifyBuilder.gutterClass).addClass(this.value);
					break;

				default:
					$(this).closest('.themify_builder_row').data('gutter', this.value).removeClass(themifyBuilder.gutterClass).addClass(this.value);
			}
		},
		_selectedGridMenu: function(context) {
			context = context || document;
			$('.grid_menu', context).each(function() {
				var handle = $(this).data('handle'),
					grid_base = [],
					$base;
				if (handle == 'module')
					return;
				switch (handle) {
					case 'sub_row':
						$base = $(this).closest('.themify_builder_sub_row').find('.themify_builder_sub_row_content');
						break;

					default:
						$base = $(this).closest('.themify_builder_row').find('.themify_builder_row_content');
				}

				$base.children().each(function() {
					grid_base.push(ThemifyPageBuilder._getColClass($(this).prop('class').split(' ')));
				});

				var $selected = $(this).find('.grid-layout-' + grid_base.join('-'));
				$selected.closest('li').addClass('selected');

				var grid = $selected.data('grid');
				if (grid && grid[0] === '-full') {
					$selected.closest('.themify_builder_grid_list_wrapper').find('.themify_builder_equal_column_height').hide();
				}

				// hide column 'alignment', 'equal column height' and 'gutter' when fullwidth column
				var $grid = $(this).find('.themify_builder_grid_list');
				if (grid && grid[0] == '-full') {
					$grid.nextAll('.themify_builder_column_alignment').find('a:first').trigger('click');
					$grid.nextAll('.themify_builder_equal_column_height').find('input:checked').trigger('click');
					$grid.nextAll('.gutter_select').val('gutter-default').trigger('change');
					$grid.nextAll().hide();
				} else {
					$grid.nextAll().show();
				}
			});
		},
		_equalColumnHeightChanged: function() {
			var handle = $(this).data('handle');
			if (handle == 'module')
				return;

			var $row = null;

			if (handle == 'sub_row') { // sub-rows
				$row = $(this).closest('.themify_builder_sub_row');
			} else { // rows
				$row = $(this).closest('.themify_builder_row');
			}

			// hide column 'alignment' when 'equal column height' is checked
			var $column_alignment = $(this).closest('.themify_builder_equal_column_height').prev('.themify_builder_column_alignment');
			if (this.checked) {
				$column_alignment.find('a:first').trigger('click');
				$column_alignment.hide();
			} else {
				$column_alignment.show();
			}

			// enable equal column height
			if (this.checked) {
				$row.data('equal-column-height', 'equal-column-height').addClass('equal-column-height');
			} else { // disable equal column height
				$row.data('equal-column-height', '').removeClass('equal-column-height');
			}
		},
		makeEqual: function($obj, target) {
			$obj.each(function() {
				var t = 0;
				$(this).find(target).children().each(function() {
					var $holder = $(this).find('.themify_module_holder').first();
					$holder.css('min-height', '');
					if ($holder.height() > t) {
						t = $holder.height();
					}
				});
				$(this).find(target).children().each(function() {
					$(this).find('.themify_module_holder').first().css('min-height', t + 'px');
				});
			});
		},
		_RefreshHolderHeight: function() {
			// Disabled for now, use css flex instead.
			//ThemifyPageBuilder.makeEqual($('.themify_builder_row:visible'), '.themify_builder_row_content:visible');
			//ThemifyPageBuilder.makeEqual($('.themify_builder_sub_row:visible'), '.themify_builder_sub_row_content');
		},
		_getColClass: function(classes) {
			var matches = ThemifyPageBuilder.clearClass.split(' '),
				spanClass = null;

			for (var i = 0; i < classes.length; i++) {
				if ($.inArray(classes[i], matches) > -1) {
					spanClass = classes[i].replace('col', '');
				}
			}
			return spanClass;
		},
		_subRowDelete: function(event) {
			event.preventDefault();
			if (confirm(themifyBuilder.subRowDeleteConfirm)) {
				$(this).closest('.themify_builder_sub_row').remove();
				ThemifyPageBuilder.newRowAvailable();
				ThemifyPageBuilder.moduleEvents();
				ThemifyPageBuilder.editing = true;
			}
		},
		_subRowDuplicate: function(event) {
			event.preventDefault();
			$(this).closest('.themify_builder_sub_row').clone().insertAfter($(this).closest('.themify_builder_sub_row'));
			ThemifyPageBuilder.moduleEvents();
			ThemifyPageBuilder.editing = true;
		},
		hideColumnStylingIcon: function(event) {
			var $colStylingIcon = $(this).closest('.themify_builder_col').children('.themify_builder_column_styling_icon').first();

			if (event.type == 'mouseenter') {
				$colStylingIcon.hide();
			} else {
				$colStylingIcon.css('display', '');
			}
		},
		// Undo/Redo Functionality
		btnUndo: document.getElementsByClassName('js-themify-builder-undo-btn')[0],
		btnRedo: document.getElementsByClassName('js-themify-builder-redo-btn')[0],
		actionUndo: function(event) {
			event.preventDefault();
			if (this.classList.contains('disabled'))
				return;
			ThemifyBuilderCommon.undoManager.instance.undo();
			ThemifyPageBuilder.updateUndoBtns();
		},
		actionRedo: function(event) {
			event.preventDefault();
			if (this.classList.contains('disabled'))
				return;
			ThemifyBuilderCommon.undoManager.instance.redo();
			ThemifyPageBuilder.updateUndoBtns();
		},
		updateUndoBtns: function() {
			if (ThemifyBuilderCommon.undoManager.instance.hasUndo()) {
				ThemifyPageBuilder.btnUndo.classList.remove('disabled');
			} else {
				ThemifyPageBuilder.btnUndo.classList.add('disabled');
			}

			if (ThemifyBuilderCommon.undoManager.instance.hasRedo()) {
				ThemifyPageBuilder.btnRedo.classList.remove('disabled');
			} else {
				ThemifyPageBuilder.btnRedo.classList.add('disabled');
			}
		},
		undoManagerCallback: function() {
			ThemifyPageBuilder.updateUndoBtns();
			ThemifyPageBuilder.moduleEvents();
			ThemifyPageBuilder.loadContentJs();
			$('.themify_builder_module_front_overlay').hide();
			ThemifyBuilderCommon.undoManager.startValue = null; // clear temp
			ThemifyPageBuilder.responsiveFrame.doSync(); // sync responsive frame
		},
		_ajaxStart: function() {
			document.getElementsByClassName('themify-builder-front-save')[0].classList.add('disabled');
		},
		_ajaxComplete: function() {
			document.getElementsByClassName('themify-builder-front-save')[0].classList.remove('disabled');
		},
		toggleRevDropdown: function(event) {
			if (event.type == 'click' && $(this).hasClass('themify-builder-revision-dropdown-panel')) {
				$(this).find('ul').toggleClass('hover');
			}
			if (event.type == 'mouseenter' && $(this).hasClass('themify-builder-front-save-title')) {
				$(this).next().find('ul').removeClass('hover');
			}
			if (event.type == 'click' && $(this).hasClass('themify-builder-front-save')) {
				$(this).find('ul').removeClass('hover');
			}
		},
		responsiveFrame: {
			$el: null,
			contentWindow: null,
			init: function() {
				ThemifyPageBuilder.responsiveFrame.$el = $('#themify_builder_site_canvas_iframe').contents();
				ThemifyPageBuilder.responsiveFrame.contentWindow = document.getElementById('themify_builder_site_canvas_iframe').contentWindow;
				var $frame = ThemifyPageBuilder.responsiveFrame.$el,
                                    eventToUse = 'true' == themifyBuilder.isTouch ? 'touchend' : 'mouseenter mouseleave';

				if ($('#wpadminbar', $frame).length){
                                    $('#wpadminbar', $frame).remove();
                                }
				$frame.find('body').addClass('themify_builder_active themify_builder_front themify_builder_responsive_frame_body');
				$('body').addClass('builder-active-breakpoint--' + ThemifyPageBuilder.activeBreakPoint );

				$frame.on(eventToUse, '.themify_builder_module_front', function(event) {
						ThemifyPageBuilder.ModHover(event);
					})
					.on('click', '.themify_builder_option_column,.js--themify_builder_module_styling,.themify_builder_style_row', function(event) {
						event.preventDefault();
						var path = ThemifyBuilderCommon.getDomPath(this),
                                                    selector = path.join(' > ');console.log(selector);
						$(selector).trigger('click');
					})
					.on('dblclick', '.themify_builder .active_module', function(event){
						event.preventDefault();
						var path = ThemifyBuilderCommon.getDomPath(this),
                                                    selector = path.join(' > ');
						$(selector).find('.js--themify_builder_module_styling').trigger('click');
					});

				$('body').on('builder_toggle_frontend', ThemifyPageBuilder.responsiveFrame.toggleBuilder);
				// Enable iframe scrolling
				ThemifyPageBuilder.responsiveFrame.doIframeScrolling();
			},
			doSync: function() {
				if ('desktop' !== ThemifyPageBuilder.activeBreakPoint)
					ThemifyPageBuilder.responsiveFrame.sync();
			},
			sync: function(reverse) {
				reverse = reverse || false;
				if (reverse) {
					ThemifyPageBuilder.responsiveFrame.$el.find('.themify_builder_content').not('.not_editable_builder').each(function() {

					});
				} else {
					$('.themify_builder_content').not('.not_editable_builder').each(function(i) {
						ThemifyPageBuilder.responsiveFrame.$el.find('.themify_builder_content').not('.not_editable_builder').get(i).innerHTML = this.innerHTML;
					});
				}
				ThemifyPageBuilder.responsiveFrame.contentWindow.ThemifyBuilderModuleJs.isResponsiveFrame = true;
				ThemifyPageBuilder.responsiveFrame.contentWindow.ThemifyBuilderModuleJs.bindEvents();
			},
			toggleBuilder: function(event, is_edit) {
				if (is_edit) {
					$('.themify_builder_module_panel').removeClass('themify_builder_panel_state_inline');
					$('.themify_builder_responsive_switcher_item .themify_builder_popup_menu_wrapper')
						.find('.breakpoint-desktop').parent().addClass('selected').siblings().removeClass('selected');
					$('.themify_builder_front_panel').removeClass('builder-disable-module-draggable');
					$('.themify_builder_module_panel .themify_builder_module').draggable('enable');
					ThemifyPageBuilder.responsiveFrame.doIframeScrolling();
				} else {
					$('.themify_builder_site_canvas, .themify_builder_workspace_container').removeAttr('style');
					$(window).off('scroll.themifybuilderresponsive');
				}
			},
			doIframeScrolling: function() {
				// Sync iframe scrolling with parent window.
				var $window = $(window);
				$window.on('scroll.themifybuilderresponsive', function(){ 
					ThemifyPageBuilder.responsiveFrame.contentWindow.scrollTo(0, $window.scrollTop());
				});
			}
		},
		breakPointSwitcher: function(event) {
			event.preventDefault();
			var breakpoint = 'desktop',
				animateW = $(window).width(),
				prevBreakPoint = ThemifyPageBuilder.activeBreakPoint;
			if ($(this).hasClass('breakpoint-tablet')) {
				breakpoint = 'tablet';
			} else if ($(this).hasClass('breakpoint-tablet-landscape')) {
				breakpoint = 'tablet_landscape';
			} else if ($(this).hasClass('breakpoint-mobile')) {
				breakpoint = 'mobile';
			}
			ThemifyPageBuilder.activeBreakPoint = breakpoint;
			$(this).parent().addClass('selected').siblings().removeClass('selected');
			$('body').removeClass('builder-active-breakpoint--desktop builder-active-breakpoint--tablet builder-active-breakpoint--tablet_landscape builder-active-breakpoint--mobile')
			.addClass('builder-active-breakpoint--' + breakpoint );
			
			if ('desktop' == breakpoint) {
				$('.themify_builder_site_canvas').css('width', animateW);
				$('.themify_builder_workspace_container').hide();
				$('.themify_builder_front_panel').removeClass('builder-disable-module-draggable');
				$('.themify_builder_module_panel').removeClass('themify_builder_panel_state_inline');
				$('.themify_builder_module_panel .themify_builder_module').draggable('enable');
				document.body.style.height = ''; // reset the body height
			} else {
				if ( 'desktop' == prevBreakPoint ) {
					ThemifyPageBuilder.responsiveFrame.sync();
				}
				var breakArr = themifyBuilder.breakpoints[breakpoint].toString().split('-');
				animateW = breakArr[breakArr.length - 1];
				$('.themify_builder_workspace_container').show();
				$('.themify_builder_site_canvas').css('width', animateW);
				$('.themify_builder_front_panel').addClass('builder-disable-module-draggable');
				$('.themify_builder_module_panel .themify_builder_module').draggable('disable');
				$('.themify_builder_module_panel').addClass('themify_builder_panel_state_inline');
				var $padding_bottom = breakpoint==='mobile'? $('body').outerHeight(true) - ThemifyPageBuilder.responsiveFrame.$el.outerHeight(true):-1;
				if($padding_bottom<0){
					$padding_bottom = 180;
				}
				$('body').css('padding-bottom',$padding_bottom);
				document.body.style.height = $(ThemifyPageBuilder.responsiveFrame.contentWindow.document).height() + 'px'; // Set the same height as iframe content height
				ThemifyPageBuilder.responsiveFrame.contentWindow.scrollTo(0, $(window).scrollTop());
			}
		}
	};

	ThemifyLiveStyling = (function($, jss) {

		function ThemifyLiveStyling() {
			this.$context = $('#themify_builder_lightbox_parent');
			this.elmtSelector = '#builder_live_styled_elmt';
			this.isInit = false;
			this.style_tab = '.themify_builder_style_tab';
			this.selectorQueue = [];
			this.data  = [];
			var self = this;
			$('body').on('builderiframeloaded.themify', function(e) {
				self.iframe = ThemifyPageBuilder.responsiveFrame.contentWindow;
				self.data = self.iframe.themify_module_styles;
				self.frameJss = self.iframe.jss;
				self.bindLightboxForm();
				$(document).trigger('tfb.live_styling.after_create', self);
			});
		}

		ThemifyLiveStyling.prototype.init = function($liveStyledElmt, currentStyleObj) {
			this.remove(); // remove previous live styling, if any

			this.$liveStyledElmt = $liveStyledElmt;

			if (typeof currentStyleObj === 'object') {
				this.currentStyleObj = currentStyleObj;
			} else {
				this.currentStyleObj = {};
			}

			this.setLiveStyledElmtID();
			this.isInit = true;
			$(document).trigger('tfb.live_styling.after_init', this);
		};

		ThemifyLiveStyling.prototype.setLiveStyledElmtID = function() {
			this.$liveStyledElmt.prop('id', this.elmtSelector.substring(1));
		};

		ThemifyLiveStyling.prototype.unsetLiveStyledElmtID = function() {
			this.$liveStyledElmt.prop('id', false);
			$('#'+this.elmtSelector.substring(1)).prop('id',false);
		};
		
		ThemifyLiveStyling.prototype.isModuleExists = function($module) {
			return this.data['module-inner'][$module]?true:false;
		};
		
		ThemifyLiveStyling.prototype.addStyleDate = function($module,$rules) {
                   
			if(!this.isModuleExists[$module]){ 
				this.data['module-inner'][$module] = $rules;
			}
		};

		/**
		 * Apply CSS rules to the live styled element.
		 *
		 * @param {Object} newStyleObj Object containing CSS rules for the live styled element.
		 * @param {Array} selectors List of selectors to apply the newStyleObj to (e.g., ['', 'h1', 'h2']).
		 */
		ThemifyLiveStyling.prototype.setLiveStyle = function(newStyleObj, selectors) {
			var self = this;
			if(!selectors){
				selectors = [''];
			}
			selectors.forEach(function(selector) {
				var fullSelector = self.elmtSelector;
				if (selector && selector.length > 0) {
					fullSelector += selector;
				}
				self.selectorQueue.push(fullSelector);
				jss.set(fullSelector, newStyleObj);
				self.frameJss.set(fullSelector, newStyleObj);

				//logging(fullSelector);
			});
			ThemifyPageBuilder.responsiveFrame.doSync();

			function logging(fullSelector) {
			}
		};

		ThemifyLiveStyling.prototype.bindColors = function() {
			var self = this;
			this.$context.on('change', 'input.colordisplay', function() {
				var hexString = $(this).val().length > 0 ? '#' + $(this).val() : '',
					colorType = $(this).parent().find('.builderColorSelectInput').prop('name');

				$('body').trigger('themify_builder_color_picker_change', [colorType, hexString]);
			});
			this.$context.on('change', 'input.color_opacity', function() {
				var opacity = $(this).val(),
					hexString = "#" + $(this).parent().find('.colordisplay').prop('value'),
					colorType = $(this).parent().find('.builderColorSelectInput').prop('name');
					var patt = /^#([\da-fA-F]{2})([\da-fA-F]{2})([\da-fA-F]{2})$/;
					var matches = patt.exec(hexString);
					var rgbaString = "rgba(" + parseInt(matches[1], 16) + ", " + parseInt(matches[2], 16) + ", " + parseInt(matches[3], 16) + ", " + opacity + ")";
				$(this).parent().find('.builderColorSelectInput').prop('value', $(this).parent().find('.colordisplay').prop('value') + "_" + opacity);
				$('body').trigger('themify_builder_color_picker_change', [colorType, rgbaString]);
			});
			$('body').on('themify_builder_color_picker_change', function(e, colorType, rgbaString) {

				if (colorType === 'cover_color') {
					self.addOrRemoveComponentOverlay(rgbaString,false);
				} else if(self.isInit) {
					
					var $el = $('input[name="'+colorType+'"]');
					if($el.next('.style_border').length>0 && $el.closest('.themify_builder_field').nextAll('.themify_builder_field').last().find('.style_apply_all_border').is(':checked')){
						return false;
					}
					var $data = self.getValue(colorType),
						$selector = $data.selector;
					if ($data) {
						self.setLiveStyle({
							[$data.prop]: rgbaString
						}, $selector);
					}
				}
			});
		};
                
		ThemifyLiveStyling.prototype.overlayType = function() {
			var self = this;
			this.$context.on('change', 'input[name="cover_color-type"]', function() {
				if($(this).val()==='color'){
					$('input[name="cover_color"]',this.$context).prev().trigger('change');
				}
				else{
					$('#'+$(this).val()+'-gradient-type').trigger('change');
				}
			});
		};

		ThemifyLiveStyling.prototype.getSpecialTextSelectors = function() {
			return [' h1', ' h2', ' h3:not(.module-title)', ' h4', ' h5', ' h6'];
		};

		ThemifyLiveStyling.prototype.addOrRemoveComponentOverlay = function(rgbaString,$gradient) {
			var $overlayElmt = ThemifyLiveStyling.getComponentBgOverlay(this.$liveStyledElmt);

			if (!rgbaString.length) {
				$overlayElmt.remove();
				return;
			}
                        var $isset = $overlayElmt.length!==0;
                        if (!$isset) {
                            $overlayElmt = $('<div/>', {
                                    class: 'builder_row_cover'
                            });
                        }
                        $overlayElmt.data('color', rgbaString);
                        if(!$gradient){
                             $overlayElmt.css({'background-image': '','background':rgbaString});
                        }
                        else{
                            $overlayElmt.css({'background': rgbaString,'background-color':''});
                        }
                        if($isset){
                            return;
                        }
                        
			var $elmtToInsertBefore = ThemifyLiveStyling.getComponentBgSlider(this.$liveStyledElmt);

			if (!$elmtToInsertBefore.length) {
				var selector = '';
				var componentType = ThemifyBuilderCommon.getComponentType(this.$liveStyledElmt);

				if (componentType === 'row') {
					selector = '.row_inner_wrapper';
				} else if (componentType === 'col' || componentType === 'sub-col') {
					selector = '.themify_builder_column_styling_icon'
				}

				$elmtToInsertBefore = this.$liveStyledElmt.children(selector);
			}

			$overlayElmt.insertBefore($elmtToInsertBefore);
		};




		ThemifyLiveStyling.prototype.bindTextInputs = function() {
			var self = this;

			$('body').delegate(self.style_tab + ' input[type="text"]', 'keyup', function() {
				var $id = $(this).prop('id'),
					$data = self.getValue($id);
				if ($data) {
					var $val = $.trim($(this).val());
					if ($('#' + $id + '_unit').length > 0) {
						$val += $('#' + $id + '_unit').val() ? $('#' + $id + '_unit').val() : 'px';
					} else if ($(this).hasClass('style_border')) {
						if($(this).closest('.themify_builder_field').nextAll('.themify_builder_field').last().find('.style_apply_all_border').is(':checked')){
							return false;
						}
						$val = parseFloat($val);
						if($val){
							$(this).closest('.themify_builder_field').find('select').trigger('change');
							$val = $val.toString();
						}
						else{
							$val = '0';
						}
						$val += 'px';
						
					}
					self.setLiveStyle({
						[$data.prop]: $val
					}, $data.selector);
				}
			});
			$('body').delegate(self.style_tab + ' [id$="_unit"]', 'change', function() {
				var $id = $(this).prop('id').replace('_unit', '');
				$('#' + $id).trigger('keyup');
			});
			$(document).on('tfb.live_styling.after_init',function(){
                            setTimeout(function(){
                                    var self = ThemifyPageBuilder.liveStylingInstance;
                                    $(self.style_tab +' .style_apply_all_border:checked').each(function(){
                                            var $field =$(this).closest('.themify_builder_field').prevUntil('h4').last(),
                                                $input = $field.find('.style_border');
                                            if(!$input.val()){
                                                self.setApplyBorder($input.prop('id'),0,'width');
                                            }
                                            var $select = $field.find('select');
                                            self.setApplyBorder($select.prop('id'),$select.val(),'style');
                                    });
                            },900);
				
			});
			
		};

		ThemifyLiveStyling.prototype.bindRowWidthHeight = function() {
			var self = this;

			this.$context.on('change', 'input[name="row_width"],input[name="row_height"]', function() {
				var rowVal = self.getStylingVal('row_width'),
					val = $(this).val();
				if (val.length > 0) {
					if (rowVal.length > 0) {
						self.$liveStyledElmt.removeClass(rowVal);
					}
					self.setStylingVal($(this).prop('name'), val);
					self.$liveStyledElmt.addClass(val);
				} else {
					self.$liveStyledElmt.removeClass(rowVal);
				}
			});
		};

		ThemifyLiveStyling.prototype.removeAnimations = function(animationEffect, $elmt) {
			$elmt.removeClass(animationEffect + ' wow animated').css('animation-name', '');
		};

		ThemifyLiveStyling.prototype.addAnimation = function(animationEffect, $elmt) {
			$elmt.addClass(animationEffect + ' animated');
		};

		ThemifyLiveStyling.prototype.bindAnimation = function() {
			var self = this;

			this.$context.on('change', '#animation_effect', function() {
				var animationEffect = self.getStylingVal('animation_effect');

				if ($(this).val().length) {
					if (animationEffect.length) {
						self.removeAnimations(animationEffect, self.$liveStyledElmt);
					}

					animationEffect = $(this).val();

					self.setStylingVal('animation_effect', animationEffect);
					self.addAnimation(animationEffect, self.$liveStyledElmt);
				} else {
					self.removeAnimations(animationEffect, self.$liveStyledElmt);
				}
			});
		};

		ThemifyLiveStyling.prototype.bindAdditionalCSSClass = function() {
			var self = this;

			this.$context.on('keyup', '#custom_css_row, #custom_css_column, #add_css_text', function() {
				var id = this.id,
					className = self.getStylingVal(id);

				self.$liveStyledElmt.removeClass(className);

				className = $(this).val();

				self.setStylingVal(id, className);
				self.$liveStyledElmt.addClass(className);
			});
		};

		ThemifyLiveStyling.prototype.bindRowAnchor = function() {
			var self = this;

			this.$context.on('keyup', '#row_anchor', function() {
				var rowAnchor = self.getStylingVal('row_anchor');

				self.$liveStyledElmt.removeClass(self.getRowAnchorClass(rowAnchor));

				rowAnchor = $(this).val();

				self.setStylingVal('row_anchor', rowAnchor);
				self.$liveStyledElmt.addClass(self.getRowAnchorClass(rowAnchor));
			});
		};

		ThemifyLiveStyling.prototype.getRowAnchorClass = function(rowAnchor) {
			return rowAnchor.length > 0 ? 'tb_section-' + rowAnchor : '';
		};

		ThemifyLiveStyling.prototype.getStylingVal = function(stylingKey) {
			return this.currentStyleObj.hasOwnProperty(stylingKey) ? this.currentStyleObj[stylingKey] : '';
		};

		ThemifyLiveStyling.prototype.setStylingVal = function(stylingKey, val) {
			this.currentStyleObj[stylingKey] = val;
		};

		ThemifyLiveStyling.prototype.bindBackgroundMode = function() {
			var self = this;
			this.$context.on('change', '#background_repeat', function() {
				var previousVal = self.getStylingVal('background_repeat');

				var val = $(this).val();

				if (val.length > 0) {
					if (previousVal.length > 0) {
						self.$liveStyledElmt.removeClass(previousVal);
					}

					self.setStylingVal('background_repeat', val);
					self.$liveStyledElmt.addClass(val);
				} else {
					self.$liveStyledElmt.removeClass(previousVal);
				}
			});

		};

		ThemifyLiveStyling.prototype.bindBackgroundPosition = function() {
			var self = this;
			this.$context.on('change', '#background_position', function() {
				var previousVal = self.getStylingVal('background_position');

				var val = $(this).val();

				if (val.length > 0) {
					if (previousVal.length > 0) {
						self.$liveStyledElmt.removeClass(previousVal);
					}
					val = 'bg-position-' + val;
					self.setStylingVal('background_position', val);
					self.$liveStyledElmt.addClass(val);
				} else {
					self.$liveStyledElmt.removeClass(previousVal);
				}
			});

		};

		ThemifyLiveStyling.prototype.isWebSafeFont = function(fontFamily) {
			/**
			 *  Array containing the web safe fonts from the backend themify_get_web_safe_font_list().
			 *
			 * @type {Array}
			 */
			var webSafeFonts = themifyBuilder.webSafeFonts;

			return webSafeFonts.indexOf(fontFamily) !== -1;
		};

		ThemifyLiveStyling.prototype.bindBackgroundSlider = function() {
			function getBackgroundSlider(options) {
				return $.post(
					themifyBuilder.ajaxurl, {
						nonce: themifyBuilder.tfb_load_nonce,
						action: 'tfb_slider_live_styling',
						tfb_background_slider_data: options
					}
				);
			}

			var getOptions, insertBackgroundSliderToHTML, initBackgroundSlider;

			getOptions = function() {
				return {
					shortcode: encodeURIComponent($('#background_slider').val()),
					mode: $('#background_slider_mode').val(),
					size: $('#background_slider_size').val(),
					order: ThemifyBuilderCommon.getComponentOrder(this.$liveStyledElmt),
					type: ThemifyBuilderCommon.getComponentType(this.$liveStyledElmt)
				};
			}.bind(this);

			insertBackgroundSliderToHTML = function($backgroundSlider) {
				var liveStyledElmtType = ThemifyBuilderCommon.getComponentType(this.$liveStyledElmt);
				var bgCover = ThemifyLiveStyling.getComponentBgOverlay(this.$liveStyledElmt);

				if (bgCover.length) {
					bgCover.after($backgroundSlider);
				} else {
					if (liveStyledElmtType == 'row') {
						this.$liveStyledElmt.children('.themify_builder_row_top').after($backgroundSlider);
					} else {
						this.$liveStyledElmt.prepend($backgroundSlider);
					}
				}
			}.bind(this);

			initBackgroundSlider = function($bgSlider) {
				ThemifyBuilderModuleJs.backgroundSlider($bgSlider);
			};

			var self = this;

			this.$context.on('change', '#background_slider, #background_slider_mode,#background_slider_size', function() {
				ThemifyLiveStyling.removeBgSlider(self.$liveStyledElmt);

				if (!$('#background_slider').val().length) {
					return;
				}

				getBackgroundSlider(getOptions()).done(function(backgroundSlider) {
					if (backgroundSlider.length < 10) {
						return;
					}

					var $bgSlider = $(backgroundSlider);

					insertBackgroundSliderToHTML($bgSlider);
					initBackgroundSlider($($bgSlider.get(0)));
				});
			});
		};

		ThemifyLiveStyling.prototype.bindBackgroundTypeRadio = function() {
			var self = this;

			this.$context.on('change', 'input[name="background_type"]', function() {
				if (!self.isInit) {
					return;
				}

				var bgType = ThemifyBuilderCommon.getCheckedRadioInGroup($(this), self.$context).val();
				if (bgType === 'image' || bgType === 'gradient') {
					ThemifyLiveStyling.removeBgSlider(self.$liveStyledElmt);
					ThemifyLiveStyling.removeBgVideo(self.$liveStyledElmt);
                                        if(bgType === 'image'){
                                            self.setLiveStyle({
                                                    'background-image': 'none'
                                            }, ['']);
                                        }
                                        else{
                                            bgType+= '-gradient-angle';
                                        }
				} 
                                else if (bgType === 'video') {
					ThemifyLiveStyling.removeBgSlider(self.$liveStyledElmt);
                                } else {
					ThemifyLiveStyling.removeBgVideo(self.$liveStyledElmt);
					// remove bg image
					self.setLiveStyle({
						'background-image': 'none'
					}, ['']);
				}
				self.$context.find('#background_' + bgType).trigger('change');
			});

		};
                
		ThemifyLiveStyling.prototype.bindBackgroundGradient = function($id,$val,$return) {
			var self = this;
				if (self.isInit) {
					var $data = self.getValue($id);
					if ($data) {
						$val = $val.replace(/background-image:/ig,'').split(";");
						var $vendors = {'moz':0,'webkit':4,'o':2,'ms':3},
							$pref = getVendorPrefix(),
							$val = $vendors[$pref] && $val[$vendors[$pref]]?$val[$vendors[$pref]]:$val[4];
							if(!$return){
								self.setLiveStyle({[$data.prop]: $val}, $data.selector);
							}
							else{
								return $val;
							}
					}
				}
				
				function getVendorPrefix(){
					if ( typeof getVendorPrefix.pre === 'undefined' ) {
						
						var styles = window.getComputedStyle(document.documentElement, '');
						
						getVendorPrefix.pre = (Array.prototype.slice
						  .call(styles)
						  .join('')
						  .match(/-(moz|webkit|ms)-/) || (styles.OLink === '' && ['', 'o'])
						  )[1];
						
					}
					return getVendorPrefix.pre;
				}

		};
		/**
		 * Binds module layout + styling options to produce live styling on change.
		 */
		ThemifyLiveStyling.prototype.bindModuleLayout = function() {
			var self = this;

			var layoutStylingOptions = {
				'layout_accordion': '> ul.ui.module-accordion',
				'layout_callout': '',
				'layout_feature': '',
				'style_image': '',
				'layout_menu': 'ul.ui.nav:first',
				'layout_post': '> .builder-posts-wrap',
				'layout_tab': ''
			};

			// TODO: Optimize for speed by having one .on('click') handler
			Object.keys(layoutStylingOptions).forEach(function(layoutSelectorKey) {
				self.$context.on('click', '#' + layoutSelectorKey + ' > a', function() {
					var selectedLayout = $(this).attr('id');

					var $elmtToApplyTo = self.$liveStyledElmt;

					if (layoutStylingOptions[layoutSelectorKey] !== '') {
						$elmtToApplyTo = self.$liveStyledElmt.find(layoutStylingOptions[layoutSelectorKey]);
					}

					var prevLayout = self.getStylingVal(layoutSelectorKey);

					if (layoutSelectorKey === 'layout_feature') {
						selectedLayout = 'layout-' + selectedLayout;
						prevLayout = 'layout-' + prevLayout;
					}

					$elmtToApplyTo
						.removeClass(prevLayout)
						.addClass(selectedLayout);

					if (layoutSelectorKey === 'layout_feature') {
						selectedLayout = selectedLayout.substr(7);
					}

					self.setStylingVal(layoutSelectorKey, selectedLayout);
				});
			});

		};

		/**
		 * Binds module radio buttons to produce live styling on change.
		 */
		ThemifyLiveStyling.prototype.bindModuleRadio = function() {
			var self = this;

			var RadioStylingOptions = {
				'buttons_style': '> .module-buttons',
				'buttons_size': '> .module-buttons',
				'icon_style': '> .module-icon',
				'icon_size': '> .module-icon',
				'icon_arrangement': '> .module-icon'
			};

			Object.keys(RadioStylingOptions).forEach(function(radioSelectorKey) {
				self.$context.on('change', '#' + radioSelectorKey + ' input[type="radio"]', function() {
                                    if(self.$liveStyledElmt){
					var selectedRadio = $(this).val(),
						$elmtToApplyTo = RadioStylingOptions[radioSelectorKey] !== '' ?
						self.$liveStyledElmt.find(RadioStylingOptions[radioSelectorKey]) : self.$liveStyledElmt,
						prevLayout = self.getStylingVal(radioSelectorKey);

					$elmtToApplyTo.removeClass(prevLayout).addClass(selectedRadio);
					self.setStylingVal(radioSelectorKey, selectedRadio);
                                    }
				});
			});

		};

		ThemifyLiveStyling.prototype.bindModuleColor = function() {
			var self = this;

			/**
			 * A key-value pair.
			 * Key represents the ID of the element which should be listened to.
			 * Value represents the selector to the element which the live styling should be applied to.
			 */
			var colorStylingOptions = {
				'color_accordion': '> ul.ui.module-accordion',
				'color_box': '> .module-box-content.ui',
				'color_button': '> .ui.builder_button',
				'color_callout': '',
				'color_menu': 'ul.ui.nav:first',
				'mod_color_pricing_table': ['', '> .module-pricing-table-header', '.module-pricing-table-button'],
				'color_tab': '',
				'icon_color_bg': '> .module-icon i',
				'button_color_bg': '> .module-buttons a'
			};

			var colorStylingSelector = Object.keys(colorStylingOptions).reduce(function(selectors, selector, index) {
				var result = selectors;

				if (index !== 0) {
					result += ',';
				}

				result += '#' + selector + ' > a';

				return result;
			}, '');

			self.$context.on('click', colorStylingSelector, function() {
				var $this = $(this),
					colorSelectorKey = $this.parent().attr('id'),
					selectedColor = $(this).attr('id'),
					$builder = $this.closest('.themify_builder_row_js_wrapper');

				var elmtToApplyToSelector = colorStylingOptions[colorSelectorKey];

				if (!Array.isArray(elmtToApplyToSelector)) {
					elmtToApplyToSelector = [elmtToApplyToSelector];
				}

				var $elmtsToApplyTo = $([]);

				elmtToApplyToSelector.forEach(function(selector) {
					if (selector === '') {
						$elmtsToApplyTo = $elmtsToApplyTo.add(self.$liveStyledElmt);
					} else {
						$elmtsToApplyTo = $elmtsToApplyTo.add(
							self.$liveStyledElmt.find(selector)
						);
					}

				});

				if ($builder.length > 0) {
					var $index = $this.closest('.themify_builder_row').index(),
						realKey = colorSelectorKey;
					colorSelectorKey += '_' + $index;
					$elmtsToApplyTo = $($elmtsToApplyTo[$index]);
				}

				var prevColor = self.getStylingVal(colorSelectorKey);
				if (!prevColor && $builder.length > 0) {
					var $rows = self.getStylingVal($builder.attr('id'));
					if ($rows[$index] && $rows[$index][realKey]) {
						prevColor = $rows[$index][realKey];
					}
				}

				$elmtsToApplyTo
					.removeClass(prevColor)
					.addClass(selectedColor);

				self.setStylingVal(colorSelectorKey, selectedColor);
			});
		};		
		ThemifyLiveStyling.prototype.setApplyBorder = function(id,value,type) {
			var $data = this.getValue(id);
			if ($data) {
				
				this.setLiveStyle({
					['border-'+type]: type==='width'?(value>0?value+'px':'0'):value
				}, $data.selector);
			}
		};
		
		ThemifyLiveStyling.prototype.bindChangesEvent = function() {
			var self = this;
 
			$('body').delegate(self.style_tab + ' select,' + self.style_tab + ' input[type="radio"],' + self.style_tab + ' .themify-builder-uploader-input', 'change', function() {
				if(!self.isInit){
					return;
				}
			   
				var $id = $(this).is('select') || $(this).hasClass('themify-builder-uploader-input') ? $(this).prop('id') : $(this).parent('.tfb_lb_option').prop('id'),
					$data = self.getValue($id);
				if ($data) {
					var $val = $(this).val(),
						$selector = $data.selector;
					if( ! $val ) {
						return;
					}
					if ($(this).hasClass('font-family-select')) {
						if ($val !== 'default' && !self.isWebSafeFont($val)) {
							ThemifyBuilderCommon.loadGoogleFonts([$val.split(' ').join('+') + ':400,700:latin,latin-ext'], self.iframe);
						} else if ($val === 'default') {
							$val = '';
						}
					} else if ($(this).hasClass('themify-builder-uploader-input')) {
						if ($(this).closest('.themify_builder_input').find('.thumb_preview').length > 0) {
							$val = $val ? 'url(' + $val + ')' : 'none';
						} else {
							self.$liveStyledElmt.data('fullwidthvideo', $val);
							if ($val.length > 0) {
								ThemifyBuilderModuleJs.fullwidthVideo(self.$liveStyledElmt);
							} else {
								ThemifyLiveStyling.removeBgVideo(self.$liveStyledElmt);
							}
							return false;
						}
					}
					else if($(this).is('select') && $(this).find('[value="dashed"]').length>0){
						if(($val!=='none' && !parseInt($(this).closest('.themify_builder_input').find('.style_border').val())) || $(this).closest('.themify_builder_field').nextAll('.themify_builder_field').last().find('.style_apply_all_border').is(':checked')){
							return false;
						}
						
					}
					self.setLiveStyle({
						[$data.prop]: $val
					}, $selector);
				}
			});
		};
		ThemifyLiveStyling.prototype.getValue = function($id) {
			if (this.isInit) {
				var type = ThemifyBuilderCommon.getComponentType(this.$liveStyledElmt);
				if (!this.data[type]) {
					if (type === 'module-inner') {
						return false;
					}
					type = 'raw';
				}
				if (type === 'module-inner') {
					var $module = $(this.style_tab).data('module');
					return $module && this.data[type][$module] && this.data[type][$module][$id] ? this.data[type][$module][$id] : false;
				} else {
					return this.data[type] && this.data[type][$id] ? this.data[type][$id] : false; //raw, column
				}
			}
			return false;
		};

		ThemifyLiveStyling.prototype.bindModuleApppearance = function() {
			var self = this;

			var getSelectedAppearances = function(appearanceSelector) {
				var selectedAppearances = self.$context.find('#' + appearanceSelector + ' > input:checked')
					.map(function(i, checkbox) {
						return $(checkbox).val();
					})
					.toArray();

				return selectedAppearances.join(' ');
			};

			var appearanceStylingOptions = {
				'accordion_appearance_accordion': '> ul.ui.module-accordion',
				'appearance_box': '> .module-box-content.ui',
				'appearance_button': '> .ui.builder_button',
				'appearance_callout': '',
				'appearance_image': '',
				'according_style_menu': 'ul.ui.nav:first',
				'mod_appearance_pricing_table': ['', '> .module-pricing-table-header', '.module-pricing-table-button'],
				'tab_appearance_tab': ''
			};

			var appearanceStylingSelector = Object.keys(appearanceStylingOptions).reduce(
				function(selectors, selector, index) {
					var result = selectors;

					if (index !== 0) {
						result += ',';
					}

					result += '#' + selector + ' > input';

					return result;
				},
				'');

			self.$context.on('change', appearanceStylingSelector, function() {
				var $this = $(this);
				var appearanceSelectorKey = $this.parent().attr('id');

				var elmtToApplyToSelector = appearanceStylingOptions[appearanceSelectorKey];

				if (!Array.isArray(elmtToApplyToSelector)) {
					elmtToApplyToSelector = [elmtToApplyToSelector];
				}

				var $elmtsToApplyTo = $([]);

				elmtToApplyToSelector.forEach(function(selector) {
					if (selector === '') {
						$elmtsToApplyTo = $elmtsToApplyTo.add(self.$liveStyledElmt);
					} else {
						$elmtsToApplyTo = $elmtsToApplyTo.add(
							self.$liveStyledElmt.find(selector)
						);
					}

				});

				var prevAppearances = self.getStylingVal(appearanceSelectorKey)
					.split('|')
					.join(' ');

				var selectedAppearances = getSelectedAppearances(appearanceSelectorKey);

				if (appearanceSelectorKey === 'mod_appearance_pricing_table') {
					prevAppearances += ' ' + prevAppearances.split(' ').join('|');
					selectedAppearances += ' ' + selectedAppearances.split(' ').join('|');
				}

				$elmtsToApplyTo
					.removeClass(prevAppearances)
					.addClass(selectedAppearances);

				self.setStylingVal(
					appearanceSelectorKey,
					getSelectedAppearances(appearanceSelectorKey).split(' ').join('|')
				);
			});
		};

		ThemifyLiveStyling.prototype.bindLightboxForm = function() {

			// "Styling" tab live styling
			this.bindChangesEvent();
			this.bindColors();
			this.bindTextInputs();
			this.bindBackgroundMode();
			this.bindBackgroundPosition();
			this.bindAnimation();
			this.bindBackgroundSlider();
			this.bindBackgroundTypeRadio();
			this.overlayType();

			// "Module options tab" live styling
			this.bindModuleLayout();
			this.bindModuleColor();
			this.bindModuleApppearance();
			this.bindModuleRadio();
			this.bindRowAnchor();
			this.bindAdditionalCSSClass();
			this.bindRowWidthHeight();
		};

		/**
		 * Resets or removes all styling (both live and from server).
		 */
		ThemifyLiveStyling.prototype.resetStyling = function() {

			var selectorsWithTriggerRequired = [
				'#background_repeat',
				'#row_anchor',
				'#custom_css_row',
				'#custom_css_column',
				'#add_css_text',
				'#animation_effect',
				'input[name=row_height]',
				'input[name=row_width]'
			];

			$(selectorsWithTriggerRequired.join(','), this.$context).trigger('change');

			var $styleTag = ThemifyLiveStyling.getComponentStyleTag(this.$liveStyledElmt);
			$styleTag.remove();

			// Removes row overlay.
			this.addOrRemoveComponentOverlay('');

			this._removeAllLiveStyles();

			// TODO: removing bg slider needs more testing.
		};

		/**
		 * Returns component's background cover element wrapped in jQuery.
		 *
		 * @param {jQuery} $component
		 * @returns {jQuery}
		 */
		ThemifyLiveStyling.getComponentBgOverlay = function($component) {
			return $component.children('.builder_row_cover');
		};

		/**
		 * Returns component's background slider element wrapped in jQuery.
		 *
		 * @param {jQuery} $component
		 * @returns {jQuery}
		 */
		ThemifyLiveStyling.getComponentBgSlider = function($component) {
			return $component.children('.row-slider, .col-slider, .sub-col-slider');
		};

		/**
		 * Returns component's background video element wrapped in jQuery.
		 *
		 * @param {jQuery} $component
		 * @returns {jQuery}
		 */
		ThemifyLiveStyling.getComponentBgVideo = function($component) {
			return $component.children('.big-video-wrap');
		};

		/**
		 * Returns component's <style> tag.
		 *
		 * @param {jQuery} $component
		 * @returns {jQuery|null}
		 */
		ThemifyLiveStyling.getComponentStyleTag = function($component) {
			var type = ThemifyBuilderCommon.getComponentType($component);

			var $styleTag = null;

			if (type === 'row') {
				$styleTag = $component.find('.row_inner').children('style');
			} else if (type === 'col') {
				$styleTag = $component.find('.tb-column-inner').children('style');
			} else if (type === 'sub-col') {
				$styleTag = $component.children('style');
			} else if (type === 'module-inner') {
				$styleTag = $component.siblings('style');
			}

			return $styleTag;
		};

		/**
		 * Removes background slider if there is any in $component.
		 *
		 * @param {jQuery} $component
		 */
		ThemifyLiveStyling.removeBgSlider = function($component) {
			ThemifyLiveStyling.getComponentBgSlider($component)
				.add($component.children('.backstretch'))
				.remove();

			$component.css({
				'position': '',
				'background': '',
				'z-index': ''
			});
		};

		/**
		 * Removes background video if there is any in $component.
		 *
		 * @param {jQuery} $component
		 */
		ThemifyLiveStyling.removeBgVideo = function($component) {
			ThemifyLiveStyling.getComponentBgVideo($component).remove();
		};

		/**
		 * Removes live styling from the live styled element.
		 *
		 * @private
		 */
		ThemifyLiveStyling.prototype._removeAllLiveStyles = function() {
			var self = this;

			var selectors = this.getSpecialTextSelectors().concat(' a');

			selectors.forEach(function(selector) {
				// Remove styles for special selectors.
				jss.remove(self.elmtSelector + selector);
				self.frameJss.remove(self.elmtSelector + selector);
			});

			self.selectorQueue.forEach(function(selector) {
				// Remove styles for special selectors.
				jss.remove(selector);
				self.frameJss.remove(selector);
			});
			self.selectorQueue = []; // reset the selectors

			// Remove styles for the selector.
			jss.remove(this.elmtSelector);
			self.frameJss.remove(this.elmtSelector);
			ThemifyPageBuilder.responsiveFrame.doSync();
		};

		ThemifyLiveStyling.prototype.remove = function() {
			if (!this.isInit) {
				return;
			}

			this._removeAllLiveStyles();

			this.unsetLiveStyledElmtID();

			this.$liveStyledElmt = null;
			this.currentStyleObj = null;
			this.isInit = false;
		};

		return ThemifyLiveStyling;
	})(jQuery, jss);

	// Initialize Builder
	$('body').on('builderscriptsloaded.themify', function(e) {
			ThemifyPageBuilder.init();
			ThemifyPageBuilder.toggleFrontEdit(e);
			$('.toggle_tf_builder a:first').on('click', ThemifyPageBuilder.toggleFrontEdit);
		})
		.on('builderiframeloaded.themify', function(e) {
			ThemifyPageBuilder.responsiveFrame.init();
		});

}(jQuery, _, window, document));
