window.themifybuilderapp = window.themifybuilderapp || {};
(function($){

	'use strict';

	var api = themifybuilderapp = {
		activeModel : null, 
		Models: {}, 
		Collections: {},
		Mixins: {},
		Views: { Modules: {}, Rows: {}, SubRows: {}, Columns : {} }
	};

	api.Models.Module = Backbone.Model.extend({
		defaults: {
			mod_name: '',
			mod_settings: {}
		},
		toRenderData: function() {
			return {
				slug: this.get('mod_name'), 
				name: this.get('mod_name'),
				excerpt: this.getExcerpt()
			}
		},
		getExcerpt: function() {
			var excerpt = this.get('mod_settings').content_text || this.get('mod_settings').content_box || '';
			return this.limitString(excerpt, 100);
		},
		limitString: function (str, limit) {
			var new_str;
			str = this.stripHtml(str); // strip html tags

			if (str.toString().length > limit) {
				new_str = str.toString().substr(0, limit);
			}
			else {
				new_str = str.toString();
			}

			return new_str;
		},
		stripHtml: function(html) {
			var tmp = document.createElement("DIV");
			tmp.innerHTML = html;
			return tmp.textContent || tmp.innerText || "";
		},
		updateData: function( data ) {
			this.set( data, {silent: true});
			this.trigger('model-updated', this);
		}
	});

	api.Models.Column = Backbone.Model.extend({
		defaults: {
			column_order: '',
			grid_class: '',
			modules: {},
			styling: {},
			component_name: 'column'
		},
		updateData: function( data ) {
			this.set( data, {silent: true});
			this.trigger('model-updated', this);
		}
	});

	api.Models.Row = Backbone.Model.extend({
		defaults: {
			row_order: 0,
			gutter: 'gutter-default',
			equal_column_height: '',
			column_alignment: '',
			cols: {},
			styling: {}
		},
		updateData: function( data ) {
			this.set( data, {silent: true});
			this.trigger('model-updated', this);
		}
	});

	api.Collections.Rows = Backbone.Collection.extend({
		model: api.Models.Row
	});

	api.vent = _.extend( {}, Backbone.Events );

	api.Views.register_module = function( type, args ) {

		if ( 'default' !== type )
			this.Modules[ type ] = this.Modules.default.extend( args );
	};

	api.Views.init_module = function( args, type ) {
		type = type || 'default';
		var model = args instanceof api.Models.Module ? args : new api.Models.Module( args ),
			callback = this.get_module( type ),
			view = new callback( { model: model });

		return {
			model: model,
			view: view
		};
	}

	api.Views.get_module = function( type ) {
		type = type || 'default';
		if ( this.module_exists( type ) )
			return this.Modules[ type ];

		return this.Modules.default;
	};

	api.Views.unregister_module = function( type ) {

		if ( 'default' !== type && this.module_exists( type ) )
			delete this.Modules[ type ];
	};

	api.Views.module_exists = function( type ) {

		return this.Modules.hasOwnProperty( type );
	};

	// column
	api.Views.register_column = function( type, args ) {

		if ( 'default' !== type )
			this.Columns[ type ] = this.Columns.default.extend( args );
	};

	api.Views.init_column = function( args, type ) {
		type = type || 'default';
		var model = args instanceof api.Models.Column ? args : new api.Models.Column( args ),
			callback = this.get_column( type ),
			view = new callback( { model: model });
		
		return {
			model: model,
			view: view
		};
	}

	api.Views.get_column = function( type ) {
		type = type || 'default';
		if ( this.column_exists( type ) )
			return this.Columns[ type ];

		return this.Columns.default;
	};

	api.Views.unregister_column = function( type ) {

		if ( 'default' !== type && this.column_exists( type ) )
			delete this.Columns[ type ];
	};

	api.Views.column_exists = function( type ) {

		return this.Columns.hasOwnProperty( type );
	};

	// sub-row
	api.Views.register_subrow = function( type, args ) {

		if ( 'default' !== type )
			this.SubRows[ type ] = this.SubRows.default.extend( args );
	};

	api.Views.init_subrow = function( args, type ) {
		type = type || 'default';
		var model = args instanceof api.Models.Module ? args : new api.Models.Module( args ),
			callback = this.get_subrow( type ),
			view = new callback( { model: model });
		
		return {
			model: model,
			view: view
		};
	}

	api.Views.get_subrow = function( type ) {
		type = type || 'default';
		if ( this.subrow_exists( type ) )
			return this.SubRows[ type ];

		return this.SubRows.default;
	};

	api.Views.unregister_subrow = function( type ) {

		if ( 'default' !== type && this.subrow_exists( type ) )
			delete this.SubRows[ type ];
	};

	api.Views.subrow_exists = function( type ) {

		return this.SubRows.hasOwnProperty( type );
	};

	// Row
	api.Views.register_row = function( type, args ) {

		if ( 'default' !== type )
			this.Rows[ type ] = this.Rows.default.extend( args );
	};

	api.Views.init_row = function( args, type ) {
		type = type || 'default';
		var model = args instanceof api.Models.Row ? args : new api.Models.Row( args ),
			callback = this.get_row( type ),
			view = new callback( { model: model });
		
		return {
			model: model,
			view: view
		};
	}

	api.Views.get_row = function( type ) {
		type = type || 'default';
		if ( this.row_exists( type ) )
			return this.Rows[ type ];

		return this.Rows.default;
	};

	api.Views.unregister_row = function( type ) {

		if ( 'default' !== type && this.row_exists( type ) )
			delete this.Rows[ type ];
	};

	api.Views.row_exists = function( type ) {

		return this.Rows.hasOwnProperty( type );
	};

	api.Views.BaseElement = Backbone.View.extend({
		events: {
			'click .themify_builder_copy_component' : 'copy',
			'click .themify_builder_paste_component' : 'paste',
			'click .themify_builder_import_component' : 'import',
			'click .themify_builder_export_component' : 'export'
		},
		initialize: function() {
			this.listenTo( this.model, 'change:styling', this.renderInlineData );
			this.listenTo( this.model, 'model-updated', this.modelChange );
			this.listenTo( this.model, 'destroy', this.remove );
		},
		modelChange: function( model ) {
			this.$el.attr(_.extend({}, _.result(this, 'attributes')));
			this.render();
			console.log('re-render');
		},
		remove: function() {
			this.$el.remove();
		},
		renderInlineData: function() {}, // will be overwrited by sub-view
		copy: function( event ) {
			event.preventDefault();
			event.stopPropagation();
			console.log('copy');
			
			var $thisElem = $(event.currentTarget);
			var component = ThemifyBuilderCommon.detectBuilderComponent($thisElem);

			switch (component) {
				case 'row':
					var $selectedRow = $thisElem.closest('.themify_builder_row'),
						rowOrder = $selectedRow.index(),
						rowData = this._getRowSettings($selectedRow, rowOrder),
						rowDataInJson = JSON.stringify(rowData);

					console.log(rowData, 'rowData');

					ThemifyBuilderCommon.Clipboard.set('row', rowDataInJson);

					$selectedRow.find('.themify_builder_dropdown').hide();
					break;

				case 'sub-row':
					var $selectedSubRow = $thisElem.closest('.themify_builder_sub_row');

					var subRowOrder = $selectedSubRow.index();
					var subRowData = this._getSubRowSettings($selectedSubRow, subRowOrder);
					var subRowDataInJSON = JSON.stringify(subRowData);

					ThemifyBuilderCommon.Clipboard.set('sub-row', subRowDataInJSON);
					break;

				case 'module':
					var $selectedModule = $thisElem.closest('.themify_builder_module');

					var moduleName = $selectedModule.data('mod-name');
					var moduleData = JSON.parse($selectedModule.find('.themify_module_settings')
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
						rowData = 'sub-column' === component ? this._getSubRowSettings( $selectedRow, rowOrder ) : this._getRowSettings($selectedRow, rowOrder),
						columnOrder = $selectedColumn.index(),
						columnData = rowData.cols[ columnOrder ],
						columnDataInJson = JSON.stringify(columnData);

					ThemifyBuilderCommon.Clipboard.set(component, columnDataInJson);

					break;
			}
		},
		paste: function( event ) {
			event.preventDefault();
			event.stopPropagation();
			console.log('paste');
			
			var $thisElem = $(event.currentTarget);
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
				case 'column':
				case 'sub-column':
					var $selectedCol = $thisElem.closest('.themify_builder_col'),
						$selectedRow = 'column' === component ? $thisElem.closest('.themify_builder_row') : $thisElem.closest('.themify_builder_sub_row'),
						col_index = $selectedCol.index(),
						row_index = $selectedRow.index(),
						colDataPlainObject = JSON.parse(dataInJSON);

						colDataPlainObject['column_order'] = col_index;
						colDataPlainObject['grid_class'] = $selectedCol.prop('class').replace('themify_builder_col', '');

						if ( 'column' === component ) {
							colDataPlainObject['row_order'] = row_index;
						} else {
							colDataPlainObject['sub_row_order'] = row_index;
							colDataPlainObject['row_order'] = $selectedCol.closest('.themify_builder_row').index();
							colDataPlainObject['col_order'] = $selectedCol.parents('.themify_builder_col').index();
						}
						colDataPlainObject['component_name'] = component;

						this.model.updateData( colDataPlainObject );
						
						api.vent.trigger('dom:builder:change');
					break;

				default: 
					var dataPlainObject = JSON.parse(dataInJSON);
					this.model.updateData( dataPlainObject );
					
					api.vent.trigger('dom:builder:change');

				break;
			}
		},
		import: function( event ) {
			event.preventDefault();
			event.stopPropagation();
			console.log('import');
			
			var $thisElem = $(event.currentTarget);
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
					options.data.component = 'sub-row';

					ThemifyBuilderCommon.highlightSubRow($selectedSubRow);
					ThemifyBuilderCommon.Lightbox.open(options, null);
					break;

				case 'module':
					var $selectedModule = $thisElem.closest('.themify_builder_module');
					options.data.component = 'module';

					$('.themify_builder_module').removeClass('current_selected_module');
					$selectedModule.addClass('current_selected_module');

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
		export: function( event ) {
			event.preventDefault();
			event.stopPropagation();
			console.log('export');
			
			var self = this,
				$thisElem = $(event.currentTarget),
				component = ThemifyBuilderCommon.detectBuilderComponent($thisElem);

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

						var rowData = self._getRowSettings($selectedRow, rowOrder);
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
					var $selectedModule = $thisElem.closest('.themify_builder_module');
					options.data.component = 'module';

					var moduleCallback = function() {
						var moduleName = $selectedModule.data('mod-name');
						var moduleData = JSON.parse($selectedModule.find('.themify_module_settings')
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
						rowData = 'column' === component ? self._getRowSettings($selectedRow, rowOrder) : self._getSubRowSettings($selectedRow, rowOrder),
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
		}
	});

	api.Views.BaseElement.extend = function(child) {
		var self = this,
			view = Backbone.View.extend.apply(this, arguments);
		view.prototype.events = _.extend({}, this.prototype.events, child.events);
		view.prototype.initialize = function() {
			if ( _.isFunction(self.prototype.initialize) ) self.prototype.initialize.apply(this, arguments);
			if ( _.isFunction(child.initialize) ) child.initialize.apply(this, arguments);
		}
		return view;
	};

	api.Views.Modules['default'] = api.Views.BaseElement.extend({
		tagName: 'div',
		attributes: function() {
			return {
				'class' : 'themify_builder_module ' + this.model.get('mod_name') +' active_module',
				'data-mod-name' : this.model.get('mod_name')
			};
		},
		template: wp.template('builder_module_item'),
		events: {
			'dblclick' : 'edit',
			'click .themify_module_options' : 'edit',
			'click .themify_module_delete' : 'delete',
			'click .themify_module_duplicate': 'duplicate'
		},
		render: function() {
			this.$el.html( this.template( this.model.toRenderData() ) );
			this.$el.find('script[type="text/json"]').text(JSON.stringify(this.model.get('mod_settings')));
			return this;
		},
		edit: function( event ) {
			event.preventDefault();
			api.vent.trigger('module:edit', $(event.currentTarget), false, this.model);
		},
		delete: function( event ) {
			event.preventDefault();
			api.vent.trigger('module:delete', this.$el, this.model);
		},
		duplicate: function( event ) {
			event.preventDefault();
			api.vent.trigger('module:duplicate', this.$el, this.model);
		}
	});

	api.Views.Columns['default'] = api.Views.BaseElement.extend({
		tagName: 'div',
		attributes: function() {
			return {
				'class' : 'themify_builder_col ' + this.model.get('grid_class'),
				'style' : 'width:' + this.model.get('grid_width') + '%'
			};
		},
		template: wp.template('builder_column_item'),
		events: {
			'click .themify_builder_option_column' : 'edit'
		},
		render: function() {
			this.$el.html( this.template( this.model.toJSON() ) );
			this.renderInlineData();

			// check if it has module
			if ( ! _.isEmpty( this.model.get('modules') ) ) {
				var container = document.createDocumentFragment();
				_.each( this.model.get('modules'), function( value, key ){

					if ( _.isNull( value ) ) return true;

					var moduleView = value && _.isUndefined( value.cols ) ? api.Views.init_module( value ) : api.Views.init_subrow( value );

					container.appendChild( moduleView.view.render().el );
				});
				this.$el.find('.themify_module_holder').append( container );
			}
			return this;
		},
		renderInlineData: function() {
			this.$el.children('.column-data-styling').attr('data-styling', JSON.stringify( this.model.get('styling') ) );
		},
		edit: function( event ) {
			event.preventDefault();
			event.stopPropagation();

			api.vent.trigger('column:edit', this.$el, this.model);
		}
	});

	// SubRow view share same model as ModuleView
	api.Views.SubRows['default'] = api.Views.BaseElement.extend({
		tagName: 'div',
		attributes: function() {
			return {
				'class' : 'themify_builder_sub_row clearfix gutter-default',
				'data-column-alignment' : this.model.get('column_alignment'),
				'data-equal-column-height' : this.model.get('equal_column_height'),
				'data-gutter' : this.model.get('gutter')
			};
		},
		template: wp.template('builder_sub_row_item'),
		events: {
			'click .sub_row_delete' : 'delete',
			'click .sub_row_duplicate' : 'duplicate'
		},
		render: function() {
			this.$el.html( this.template( this.model.toJSON() ) );

			if ( ! _.isUndefined( this.model.get('cols') ) ) {
				var container = document.createDocumentFragment();
				_.each( this.model.get('cols'), function( value, key ) {
					value.component_name = 'sub-column';
					var columnView = api.Views.init_column( value );

					container.appendChild( columnView.view.render().el );
				});
				this.$el.find('.themify_builder_sub_row_content').append( container );
			}
			return this;
		},
		delete: function( event ) {
			event.preventDefault();
			event.stopPropagation();
			api.vent.trigger( 'subrow:delete', this.$el, this.model );
		},
		duplicate: function( event ) {
			event.preventDefault();
			event.stopPropagation();
			api.vent.trigger( 'subrow:duplicate', this.$el, this.model );
		}
	});

	api.Views.Rows['default'] = api.Views.BaseElement.extend({
		tagName: 'div',
		attributes: function() {
			return {
				'class' : 'themify_builder_row module_row clearfix gutter-default',
				'data-column-alignment' : this.model.get('column_alignment'),
				'data-equal-column-height' : this.model.get('equal_column_height'),
				'data-gutter' : this.model.get('gutter')
			};
		},
		template: wp.template('builder_row_item'),
		events: {
			'click .themify_builder_option_row' : 'edit',
			'click .themify_builder_style_row' : 'edit',
			'click .themify_builder_delete_row' : 'delete',
			'click .themify_builder_duplicate_row' : 'duplicate'
		},
		render: function() {
			this.$el.html( this.template( this.model.toJSON() ) );
			this.renderInlineData();
			
			if ( ! _.isEmpty( this.model.get('cols') ) ) {
				var container = document.createDocumentFragment();
				_.each( this.model.get('cols'), function( value, key ) {
					value.component_name = 'column';
					var columnView = api.Views.init_column( value );

					container.appendChild( columnView.view.render().el );
				});
				this.$el.find('.themify_builder_row_content').append( container );
			}
			return this;
		},
		renderInlineData: function() {
			this.$el.find('.row-data-styling').attr('data-styling', JSON.stringify( this.model.get('styling') ) );
			var anchorname = ( _.isObject( this.model.get('styling') ) && ! _.isEmpty( this.model.get('styling').row_anchor ) ) ? '#' + this.model.get('styling').row_anchor : '';
			this.$el.find('.row-anchor-name').first().text( anchorname );
		},
		edit: function( event ) {
			event.preventDefault();
			event.stopPropagation();
			if ( $(event.currentTarget).hasClass('themify_builder_style_row') ) { 
				this.model.set('styleClicked', true );
			} else {
				this.model.set('styleClicked', false );
			}
			api.vent.trigger('row:edit', this.$el, this.model);
		},
		delete: function( event ) {
			event.preventDefault();
			event.stopPropagation();
			api.vent.trigger( 'row:delete', this.$el, this.model );
		},
		duplicate: function( event ) {
			event.preventDefault();
			event.stopPropagation();
			api.vent.trigger( 'row:duplicate', this.$el, this.model );
		}
	});

	api.Views.Builder = Backbone.View.extend({
		initialize: function() {
			api.vent.on('dom:builder:change', this.tempEvents.bind(this));
		},
		render: function() {
			var container = document.createDocumentFragment();
			this.collection.each(function( row ) {
				var rowView = api.Views.init_row( row );
				container.appendChild(rowView.view.render().el);
			});
			this.el.appendChild(container);

			//api.vent.trigger('dom:builder:change');
			return this;
		},
		tempEvents: function() {
			ThemifyPageBuilder.newRowAvailable();
			ThemifyPageBuilder.moduleEvents();
		}
	});

	api.Mixins.Common = {
		clearClass: 'col6-1 col5-1 col4-1 col4-2 col4-3 col3-1 col3-2 col2-1 col-full',
		gridClass: ['col-full', 'col4-1', 'col4-2', 'col4-3', 'col3-1', 'col3-2', 'col6-1', 'col5-1'],
		_getRowSettings: function( $base, index ) {
			var self = this,
				option_data = {},
				cols = {};

			// cols
			$base.find('.themify_builder_row_content').children('.themify_builder_col').each(function (c) {
				var grid_class = self.filterClass($(this).attr('class')),
					modules = {};
				// mods
				$(this).find('.themify_module_holder').first().children().each(function (m) {
					if ($(this).hasClass('themify_builder_module')) {
						var mod_name = $(this).data('mod-name'),
							mod_elems = $(this).find('.themify_module_settings'),
							mod_settings = JSON.parse(mod_elems.find('script[type="text/json"]').text());
						modules[m] = {'mod_name': mod_name, 'mod_settings': mod_settings};
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
					var $data_styling = $.parseJSON( $(this).children('.column-data-styling').attr('data-styling') );
					if ('object' === typeof $data_styling)
						cols[ c ].styling = $data_styling;
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
				var $data_styling = $.parseJSON( $base.find('.row-data-styling').attr('data-styling') );
				if ('object' === typeof $data_styling)
					option_data.styling = $data_styling;
			}
			return option_data;
		},
		_getSubRowSettings: function( $subRow, subRowOrder ) {
			var self = this,
				sub_cols = {};
			$subRow.find('.themify_builder_col').each(function (sub_col) {
				var sub_grid_class = self.filterClass($(this).attr('class')),
					sub_modules = {};

				$(this).find('.active_module').each(function (sub_m) {
					var sub_mod_name = $(this).data('mod-name'),
							sub_mod_elems = $(this).find('.themify_module_settings'),
							sub_mod_settings = JSON.parse(sub_mod_elems.find('script[type="text/json"]').text());
					sub_modules[sub_m] = {'mod_name': sub_mod_name, 'mod_settings': sub_mod_settings};
				});

				sub_cols[ sub_col ] = {
					column_order: sub_col,
					grid_class: sub_grid_class,
					grid_width:$(this).prop('style').width?parseFloat($(this).prop('style').width):false,
					modules: sub_modules
				};

				// get sub-column styling
				if ($(this).children('.column-data-styling').length > 0) {
					var $data_styling = $.parseJSON( $(this).children('.column-data-styling').attr('data-styling') );
					if ('object' === typeof $data_styling)
						sub_cols[ sub_col ].styling = $data_styling;
				}
			});

			return {
				row_order: subRowOrder,
				gutter: $subRow.data('gutter'),
				equal_column_height: $subRow.data('equal-column-height'),
				column_alignment: $subRow.data('column-alignment'),
				cols: sub_cols
			};
		},
		filterClass: function (str) {
			var grid = this.gridClass.concat(['first', 'last']),
				n = str.split(' '),
				new_arr = [];

			for (var i = 0; i < n.length; i++) {
				if ($.inArray(n[i], grid) > -1) {
					new_arr.push(n[i]);
				}
			}

			return new_arr.join(' ');
		},
		_autoSelectInputField: function($inputField) {
			$inputField.trigger('focus').trigger('select');
		},
	};

	api.Mixins.Builder = {
		builderContainer: document.querySelector('.themify_builder_editor_wrapper'),
		elementEvents: function () {
			var self = this;

			console.log(this, 'elementEvents');

			this.$el.find('.row_menu .themify_builder_dropdown, .module_menu .themify_builder_dropdown').hide();
			this.$el.find('.themify_module_holder').each(function () {
				if ($(this).find('.themify_builder_module').length > 0) {
					$(this).find('.empty_holder_text').hide();
				} else {
					$(this).find('.empty_holder_text').show();
				}
			});

			/*$(".themify_builder_module_panel .themify_builder_module").not('.themify_is_premium_module').draggable({
				appendTo: "body",
				helper: "clone",
				revert: 'invalid',
				connectToSortable: ".themify_module_holder"
			});*/

			this.$el.find('.themify_module_holder').each(function(){
				var startValue = self.builderContainer.innerHTML, newValue;
				$(this).sortable({
					placeholder: 'themify_builder_ui_state_highlight',
					items: '.themify_builder_module, .themify_builder_sub_row',
					connectWith: '.themify_module_holder',
					cursor: 'move',
					revert: 100,
					sort: function (event, ui) {
						var placeholder_h = ui.item.outerHeight();
						$('.themify_module_holder .themify_builder_ui_state_highlight').height(placeholder_h);
					},
					receive: function (event, ui) {
						self.placeHoldDragger();
						$(this).parent().find('.empty_holder_text').hide();
					},
					stop: function (event, ui) {
						if (!ui.item.hasClass('active_module') && !ui.item.hasClass('themify_builder_sub_row')) {
							var moduleView = api.Views.init_module( { mod_name: ui.item.data('module-slug') } ),
								$newElems = moduleView.view.render().$el;

							$(this).parent().find(".empty_holder_text").hide();
							ui.item.replaceWith($newElems);
							api.vent.trigger('module:edit', $newElems, true, moduleView.model);
							api.vent.trigger('dom:builder:change');
						} else {
							// Make sub_row only can nested one level
							if (ui.item.hasClass('themify_builder_sub_row') && ui.item.parents('.themify_builder_sub_row').length) {
								var $clone_for_move = ui.item.find('.active_module').clone();
								$clone_for_move.insertAfter(ui.item);
								ui.item.remove();
							}

							api.vent.trigger('dom:builder:change');

							newValue = self.builderContainer.innerHTML;
							if ( startValue !== newValue ) {
								ThemifyBuilderCommon.undoManager.events.trigger('change', [startValue, newValue]);
							}
						}
						self.equalHeight();
					}
				});
			});
			
			var startValue = self.builderContainer.innerHTML;
			this.$el.sortable({
				items: '.themify_builder_row',
				handle: '.themify_builder_row_top',
				axis: 'y',
				placeholder: 'themify_builder_ui_state_highlight',
				sort: function (event, ui) {
					var placeholder_h = ui.item.height();
					$('.themify_builder_row_panel .themify_builder_ui_state_highlight').height(placeholder_h);
				},
				stop: function(event, ui) {
					var newValue = self.builderContainer.innerHTML;
					if ( startValue !== newValue ) {
						ThemifyBuilderCommon.undoManager.events.trigger('change', [startValue, newValue]);
					}
				}
			});

			// Column and Sub-Column sortable
			this.$el.find('.themify_builder_row_content, .themify_builder_sub_row_content').each(function(){
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

			var grid_menu_tmpl = wp.template('builder_grid_menu'),
					grid_menu_render = grid_menu_tmpl({});
			this.$el.find('.themify_builder_row_content').each(function () {
				$(this).children().each(function () {
					var $holder = $(this).find('.themify_module_holder').first();
					$holder.children('.themify_builder_module').each(function () {
						if ($(this).find('.grid_menu').length == 0) {
							$(this).append($(grid_menu_render));
						}
					});
				});
			});
		},
		placeHoldDragger: function () {
			this.$el.find('.themify_module_holder').each(function () {
				if ($(this).find('.themify_builder_module').length == 0) {
					$(this).find('.empty_holder_text').show();
				}
			});
		},
		newRowAvailable: function () {
			var self = this;

			this.$el.each(function () {
				var $container = $(this),
					$parent = $container.find('.themify_builder_row');

				$parent.each(function () {
					if ($(this).find('.themify_builder_module').length != 0) {
						return;
					}

					var removeThis = true;

					var column_data_styling = $(this).find('.column-data-styling');
					var data_styling = null;

					column_data_styling.each(function () {
						if (!removeThis) {
							return;
						}

						data_styling = $.parseJSON( $(this).attr('data-styling') );

						if ((typeof data_styling === 'array' && data_styling.length > 0) || !$.isEmptyObject(data_styling)) {
							removeThis = false;
						}
					});

					data_styling = $.parseJSON( $(this).find('.row-data-styling').attr('data-styling') );

					if (removeThis && (typeof data_styling === 'string' || $.isEmptyObject(data_styling))) {
						$(this).remove();
					}
				});

				if ($parent.find('.themify_builder_module').length > 0 || $container.find('.themify_builder_row').length == 0) {
					var rowDataPlainObject = {
							cols: [{ grid_class: 'col-full first last' }]
						},
						rowView = api.Views.init_row( rowDataPlainObject ),
						$template = rowView.view.render().$el;

					$template.appendTo($container);
					self._selectedGridMenu($template);
				}
			});
		},
		_selectedGridMenu: function (context) {
			context = context || document;
			$('.grid_menu', context).each(function () {
				var handle = $(this).data('handle'),
						grid_base = [], $base;
				if (handle == 'module')
					return;
				switch (handle) {
					case 'sub_row':
						$base = $(this).closest('.themify_builder_sub_row').find('.themify_builder_sub_row_content');
						break;

					default:
						$base = $(this).closest('.themify_builder_row').find('.themify_builder_row_content');
				}

				$base.children().each(function () {
					grid_base.push(ThemifyPageBuilder._getColClass($(this).prop('class').split(' ')));
				});

				var $selected = $(this).find('.grid-layout-' + grid_base.join('-'));
				$selected.closest('li').addClass('selected');

				// hide column 'alignment', 'equal column height' and 'gutter' when fullwidth column
				var $grid = $(this).find('.themify_builder_grid_list'),
					grid = $selected.data('grid');
				if (grid && grid[0] == '-full') {
					$grid.nextAll('.themify_builder_column_alignment').find('a:first').trigger('click');
					$grid.nextAll('.themify_builder_equal_column_height').find('input:checked').trigger('click');
					$grid.nextAll('.gutter_select').val('gutter-default').trigger('change');
					$grid.nextAll().hide();
				}
				else {
					$grid.nextAll().show();
				}
			});
		},
		makeEqual: function ($obj, target) {
			$obj.each(function () {
				var t = 0;
				$(this).find(target).children().each(function () {
					var $holder = $(this).find('.themify_module_holder').first();
					$holder.css('min-height', '');
					if ($holder.height() > t) {
						t = $holder.height();
					}
				});
				$(this).find(target).children().each(function () {
					$(this).find('.themify_module_holder').first().css('min-height', t + 'px');
				});
			});
		},
		equalHeight: function () {
			ThemifyPageBuilder.makeEqual(this.$el.find('.themify_builder_row:visible'), '.themify_builder_row_content:visible');
			ThemifyPageBuilder.makeEqual(this.$el.find('.themify_builder_sub_row:visible'), '.themify_builder_sub_row_content');
		},
	};

	_.extend( api.Views.BaseElement.prototype, api.Mixins.Common );
	_.extend( api.Views.Builder.prototype, api.Mixins.Builder );
	
	$(function(){

	});

	// Run on WINDOW load
	$(window).load(function(){
	});
})(jQuery);