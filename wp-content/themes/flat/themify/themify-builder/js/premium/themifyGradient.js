/*!
 * ThemifyGradient
 * Enhanced version of ClassyGradient, with RGBA support
 *
 * Original script written by Marius Stanciu - Sergiu <marius@vox.space>
 * Licensed under the MIT license https://vox.SPACE/LICENSE-MIT
 * Version 1.1.1
 *
 */

(function($) {
	$.ThemifyGradient = function(element, options) {
		var defaults = {
			gradient: '0% rgba(0,0,0, 1)|100% rgba(255,255,255,1)',
			width: 200,
			height: 15,
			point: 8,
			angle : 180,
                        circle:false,
			type : 'linear', // [linear / radial]
			onChange: function() {
			},
			onInit: function() {
			}
		};
		var $element = $(element), _container, _canvas, $pointsContainer, $pointsInfos;
		var $pointsInfosContent, $pointColor, $pointPosition, $btnPointDelete, _context, _selPoint;
		var points = new Array();
		this.settings = {};
		this.__constructor = function() {
			this.settings = $.extend({}, defaults, options);
			this.update();
			this.settings.onInit();
			return this;
		};
		this.update = function() {
			this._setupPoints();
			this._setup();
			this._render();
		};
		this.getCSS = function() {
			var def = this.getCSSvalue();
			var out = 'background-image: ' + '-moz-' + def + ';' + '\n';
			out += 'background-image: ' + '-webkit-' + def + ';' + '\n';
			out += 'background-image: ' + '-o-' + def + ';' + '\n';
			out += 'background-image: ' + '-ms-' + def + ';' + '\n';
			out += 'background-image: ' + def + ';' + '\n';
			return out;
		};
		this.getCSSvalue = function() {
			var defDir =  this.settings.angle + 'deg,';
			if( this.settings.type === 'radial' ) {
				defDir = this.settings.circle?'circle,':''; /* Radial gradients don't have angle */
			}
			var defCss = [];
			$.each(points, function(i, el) {
				defCss.push( el[1] + ' ' + el[0] );
			});

			return this.settings.type + '-gradient(' + defDir + defCss.join( ', ' ) + ')';
		};
		this.getArray = function() {
			return points;
		};
		this.getString = function() {
			var out = '';
			$.each(points, function(i, el) {
				out += el[0] + ' ' + el[1] + '|';
			});
			out = out.substr(0, out.length - 1);
			return out;
		};
		this.setType = function( type ) {
			this.settings.type = type;
			this.settings.onChange(this.getString(), this.getCSS(), this.getArray());
		};
		this.setAngle = function( angle ) {
			this.settings.angle = angle;
			this.settings.onChange(this.getString(), this.getCSS(), this.getArray());
		};
                this.setRadialCircle = function( circle ) {
			this.settings.circle = circle;
			this.settings.onChange(this.getString(), this.getCSS(), this.getArray());
		};
		this._setupPoints = function() {
			points = new Array();
			if ($.isArray(this.settings.gradient)) {
				points = this.settings.gradient;
			}
			else {
				points = this._getGradientFromString(this.settings.gradient);
			}
		};
		this._setup = function() {
			var self = this;
			$element.empty();
			_container = $('<div class="ThemifyGradient"></div>');
			_canvas = $('<canvas class="canvas" width="' + this.settings.width + '" height="' + this.settings.height + '"></canvas>');
			_container.append(_canvas);
			_context = _canvas.get(0).getContext('2d');
			$pointsContainer = $('<div class="points"></div>');
			$pointsContainer.css('width', (this.settings.width) + Math.round(this.settings.point / 2 + 1) + 'px');
			_container.append($pointsContainer);
			$pointsInfos = $('<div class="gradient-pointer-info"></div>');
			$pointsInfos.append('<div class="gradient-pointer-arrow"></div>');
			_container.append($pointsInfos);
			$pointsInfosContent = $('<div class="content"></div>');
			$pointsInfos.append($pointsInfosContent);
			$element.hover(function() {
				$element.addClass('hover');
			}, function() {
				$element.removeClass('hover');
			});
			$pointColor = $('<div class="point-color"><div style="background-color: #00ff00"></div></div>');
			$pointPosition = $('<input type="text" class="point-position"/>');
			$btnPointDelete = $('<a href="#" class="gradient-point-delete"><i class="ti ti-close"></i></a>');
			$pointsInfosContent.append($pointColor,'<span class="gradient_delimiter"></span>', $pointPosition,'<span class="gradient_percent">%</span>', $btnPointDelete);
			$element.append(_container);

			$(document).bind('click', function() {
				if (!$element.is('.hover')) {
					$pointsInfos.hide('fast');
				}
			});
			_canvas.unbind('click').bind('click', function(e) {
				var offset = _canvas.offset(), clickPosition = e.pageX - offset.left;
				clickPosition = Math.round((clickPosition * 100) / self.settings.width);
				var defaultColor = 'rgba(0,0,0, 1)', minDist = 999999999999;
				$.each(points, function(i, el) {
					if ((parseInt(el[0]) < clickPosition) && (clickPosition - parseInt(el[0]) < minDist)) {
						minDist = clickPosition - parseInt(el[0]);
						defaultColor = el[1];
					}
					else if ((parseInt(el[0]) > clickPosition) && (parseInt(el[0]) - clickPosition < minDist)) {
						minDist = parseInt(el[0]) - clickPosition;
						defaultColor = el[1];
					}
				});
				points.push([clickPosition + '%', defaultColor]);
				points.sort(self._sortByPosition);
				self._render();
				$.each(points, function(i, el) {
					if (el[0] == clickPosition + '%') {
						self._selectPoint($pointsContainer.find('.point:eq(' + i + ')'),false);
					}
				});
			});
                        this.pointEvents();
		};
                this.pointEvents = function(){
                    var self = this;
                    $element.delegate('.themify-color-picker','keyup',function(){
                        var $v = $(this).val();
                        if(!$v){
                            $v ='fff';
                        }
                        var rgb = self.hexToRgb( $v );
                        if(rgb){
                            var opacity = $(this).data('opacity');
                            if(typeof opacity==='undefined'){
                                opacity = 1;
                            }
                            $(this).closest('.ThemifyGradient').find('.themify_current_point').css('backgroundColor', 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',' + opacity + ')' );
                            self._renderCanvas();
                        }
                    });
                    $element.find('.point-position').bind('keyup focusout',function(e){
                        var $val = parseInt($.trim($(this).val()));
                            if(isNaN($val)){
                                $val = 0;
                               
                            }
                            else if($val<0){
                                $val = Math.abs($val);
                            }
                            else if($val>=98){
                                $val = 98;
                            }
                        if(e.type!=='focusout'){
                            $val = Math.round(($val* self.settings.width)/100);
                            $(this).closest('.ThemifyGradient').find('.themify_current_point').css('left',$val);
                            self._renderCanvas();
                        }   
                        else{
                             $(this).val($val);
                        }
                    });
                };
		this._render = function() {
			this._initGradientPoints();
			this._renderCanvas();
                       
		};
		this._initGradientPoints = function() {
			var self = this;
			$pointsContainer.empty();
			$.each(points, function(i, el) {
				$pointsContainer.append('<div class="point" style="background-color: ' + el[1] + '; left:' + (parseInt(el[0]) * self.settings.width) / 100 + 'px;"></div>');
			});
			$pointsContainer.find('.point').css('width', this.settings.point + 'px').css('height', this.settings.point + 'px').mouseup(function() {
				self._selectPoint(this,false);
			}).draggable({
				axis: 'x',
				containment: 'parent',
                                start:function(event, ui){
                                    var $item = $(ui.helper[0]);
                                    $item.find('.minicolors-swatch').trigger('mousedown.minicolors');
                                },
                                stop:function(event, ui){
                                    var $item = $(ui.helper[0]);
                                    $item.find('.minicolors-swatch').trigger('mousedown.minicolors');
                                },
				drag: function(event, ui) {
                                    self._selectPoint(this,true);
                                    self._renderCanvas();
				}
			});
		};
		this.hexToRgb = function(hex) {
			// Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
			var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
			hex = hex.replace(shorthandRegex, function(m, r, g, b) {
				return r + r + g + g + b + b;
			});

			var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
			return result ? {
				r: parseInt(result[1], 16),
				g: parseInt(result[2], 16),
				b: parseInt(result[3], 16)
			} : null;
		};
		this._selectPoint = function(el,is_drag) {
			var self = this;
			_selPoint = $(el);
                        _selPoint.parent().children().removeClass('themify_current_point');
                        _selPoint.addClass('themify_current_point');
			var color = _selPoint.css('backgroundColor'), position = parseInt(_selPoint.css('left'));
			position = Math.round((position / this.settings.width) * 100);
			color = color.substr(4, color.length);
			color = color.substr(0, color.length - 1);
			$element.find('.point-color div').remove();

			// create the color picker element
			var $input = $pointColor.find( '.themify-color-picker' );
			if( $input.length < 1 ) {
				$input = $( '<input type="text" class="themify-color-picker" />' );
				$input.appendTo( $pointColor ).minicolors( {
					opacity : true,
					change: function( value, opacity ) {
						var rgb = self.hexToRgb( value );
						_selPoint.css('backgroundColor', 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',' + opacity + ')' );
						self._renderCanvas();
					}
				} );
			}
			var rgb = _selPoint.css( 'backgroundColor' ).replace(/^rgba?\(|\s+|\)$/g,'').split(','),
                            opacity = rgb.length === 4 ? rgb.pop(): 1; // opacity is the last item in the array
                    //
			// set the color for colorpicker
			$input.val( this._rgbToHex( rgb ) ).attr( 'data-opacity', opacity ).minicolors( 'settings', { value: this._rgbToHex( rgb ) } );
			$pointPosition.val(position);
			$btnPointDelete.unbind('click').bind('click', function() {
				if (points.length > 1) {
                                    points.splice(_selPoint.index(), 1);
                                    self._render();
                                    $element.find('.gradient-pointer-info').hide('fast');
				}
				return false;
			});
			$element.find('.gradient-pointer-info').css('marginLeft', parseInt(_selPoint.css('left')) - 30 + 'px').show('fast',function(){
                            if(!is_drag){
                                $input.prev('.minicolors-swatch').trigger('mousedown.minicolors');
                            }
                        });
		};
		this._renderCanvas = function() {
			var self = this;
			points = new Array();
			$element.find('.point').each(function(i, el) {
				var position = Math.round((parseInt($(el).css('left')) / self.settings.width) * 100);
				var color = $(el).css('backgroundColor');
				points.push([position + '%', color]);
			});
			points.sort(self._sortByPosition);
			this._renderToCanvas();
			this.settings.onChange(this.getString(), this.getCSS(), this.getArray());
		};
		this._renderToCanvas = function() {
			var gradient = _context.createLinearGradient(0, 0, this.settings.width, 0);
			$.each(points, function(i, el) {
				gradient.addColorStop(parseInt(el[0]) / 100, el[1]);
			});
			_context.clearRect(0, 0, this.settings.width, this.settings.height);
			_context.fillStyle = gradient;
			_context.fillRect(0, 0, this.settings.width, this.settings.height);
			this.settings.onChange(this.getString(), this.getCSS(), this.getArray());
		};
		this._getGradientFromString = function(gradient) {
			var arr = new Array(), _t = gradient.split('|');
			$.each(_t, function(i, el) {
				var position;
				if ((el.substr(el.indexOf('%') - 3, el.indexOf('%')) == '100') || (el.substr(el.indexOf('%') - 3, el.indexOf('%')) == '100%')) {
					position = '100%';
				}
				else if (el.indexOf('%') > 1) {
					position = parseInt(el.substr(el.indexOf('%') - 2, el.indexOf('%')));
					position += '%';
				}
				else {
					position = parseInt(el.substr(el.indexOf('%') - 1, el.indexOf('%')));
					position += '%';
				}
				var color = el.replace( position, '' ); // subtract "position" from the color point
				arr.push([position, color]);
			});
			return arr;
		};
		this._rgbToHex = function(rgb) {
			var R = rgb[0], G = rgb[1], B = rgb[2];
			function toHex(n) {
				n = parseInt(n, 10);
				if (isNaN(n))
					return "00";
				n = Math.max(0, Math.min(n, 255));
				return "0123456789ABCDEF".charAt((n - n % 16) / 16) + "0123456789ABCDEF".charAt(n % 16);
			}
			return '#' + toHex(R) + toHex(G) + toHex(B);
		};
		this._sortByPosition = function(data_A, data_B) {
			if (parseInt(data_A[0]) < parseInt(data_B[0])) {
				return -1;
			}
			if (parseInt(data_A[0]) > parseInt(data_B[0])) {
				return 1;
			}
			return 0;
		};
		this._base64 = function(input) {
			var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=", output = "", chr1, chr2, chr3, enc1, enc2, enc3, enc4, i = 0;
			while (i < input.length) {
				chr1 = input.charCodeAt(i++);
				chr2 = input.charCodeAt(i++);
				chr3 = input.charCodeAt(i++);
				enc1 = chr1 >> 2;
				enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
				enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
				enc4 = chr3 & 63;
				if (isNaN(chr2)) {
					enc3 = enc4 = 64;
				}
				else if (isNaN(chr3)) {
					enc4 = 64;
				}
				output += keyStr.charAt(enc1) + keyStr.charAt(enc2) + keyStr.charAt(enc3) + keyStr.charAt(enc4);
			}
			return output;
		};
		return this.__constructor();
	};
	$.fn.ThemifyGradient = function(options) {
		return this.each(function() {
			if ($(this).data('ThemifyGradient') === undefined) {
				var plugin = new $.ThemifyGradient(this, options);
				$(this).data('ThemifyGradient', plugin);
			}
		});
	};
})(jQuery);