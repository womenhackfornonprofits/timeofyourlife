window.themifybuilderapp = window.themifybuilderapp || {};
(function($){

	'use strict';

	var api = themifybuilderapp = {
		activeModel : null, 
		Models: {}, 
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
		}
	});

	api.Models.Column = Backbone.Model.extend({
		defaults: {
			column_order: '',
			grid_class: '',
			modules: {},
			styling: {},
			component_name: 'column'
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
		}
	});

	api.vent = _.extend( {}, Backbone.Events );

	api.Views.register_module = function( type, args ) {

		if ( 'default' !== type )
			this.Modules[ type ] = this.Modules.default.extend( args );
	};

	api.Views.init_module = function( args, type ) {
		type = type || 'default';
		var model = new api.Models.Module( args ),
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
		var model = new api.Models.Column( args ),
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
		var model = new api.Models.Module( args ),
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
		var model = new api.Models.Row( args ),
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

	api.Views.Modules['default'] = Backbone.View.extend({
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
		initialize: function() {
			this.listenTo( this.model, 'change', this.render );
			this.listenTo( this.model, 'destroy', this.remove );
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
		remove: function() {
			this.$el.remove();
		},
		duplicate: function( event ) {
			event.preventDefault();
			api.vent.trigger('module:duplicate', this.$el, this.model);
		}
	});

	api.Views.Columns['default'] = Backbone.View.extend({
		tagName: 'div',
		attributes: function() {
			return {
				'class' : 'themify_builder_col ' + this.model.get('grid_class')
			};
		},
		template: wp.template('builder_column_item'),
		render: function() {
			this.$el.html( this.template( this.model.toJSON() ) );
			this.$el.find('.column-data-styling').attr('data-styling', JSON.stringify( this.model.get('styling') ) );

			// check if it has module
			if ( ! _.isEmpty( this.model.get('modules') ) ) {
				var container = document.createDocumentFragment();
				_.each( this.model.get('modules'), function( value, key ){
					var moduleView = value && _.isUndefined( value.cols ) ? api.Views.init_module( value ) : api.Views.init_subrow( value );

					container.appendChild( moduleView.view.render().el );
				});
				this.$el.find('.themify_module_holder').append( container );
			}
			return this;
		}
	});

	// SubRow view share same model as ModuleView
	api.Views.SubRows['default'] = Backbone.View.extend({
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
		}
	});

	api.Views.Rows['default'] = Backbone.View.extend({
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
		render: function() {
			this.$el.html( this.template( this.model.toJSON() ) );
			this.$el.find('.row-data-styling').attr('data-styling', JSON.stringify( this.model.get('styling') ) );
			var anchorname = ( _.isObject( this.model.get('styling') ) && ! _.isEmpty( this.model.get('styling').row_anchor ) ) ? '#' + this.model.get('styling').row_anchor : '';
			this.$el.find('.row-anchor-name').text( anchorname );
			
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
		}
	});
	
	$(function(){

	});

	// Run on WINDOW load
	$(window).load(function(){
	});
})(jQuery);