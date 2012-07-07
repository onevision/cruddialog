/**
 * jQuery CRUD Dialog Plugin
 * http://www.onevisionconsulting.co.uk/jquery-cruddialog
 * 
 * Copyright (c) 2012 One Vision Consulting Limited
 * 
 * Version 0.4
 */

(function($, undefined) {

	var CrudDialog = {
		options : {
			height : 250,
			width : 390,
			success : function(data) {
				alert("Update complete");
			},
			error : function() {
				alert("An error has occurred. Please press the brower refresh button and try again");
			},
			preloadSource : undefined,
			onLoad : function(json) {
			},
			onLoadInput : function(name, json) {
				return null;
			},
			fieldNameMappings : {}
		},

		_overlay : undefined,

		_create : function() {
			var self = this;
			this.element.dialog({
				autoOpen : false,
				height : self.options.height,
				width : self.options.width,
				modal : true,
				resizable : false,
				buttons : {
					"Ok" : function() {
						var valid = true;

						var showError = function(element, message) {
							element.addClass("ui-state-error");
							var tips = self.element.find(".cp-validatetips");
							tips.text(message).addClass("ui-state-highlight");
							setTimeout(function() {
								tips.removeClass("ui-state-highlight", 1500);
							}, 500);
						};
						
						// Check required fields
						jQuery(this).find("form .cd-required").each(function(i) {
							var name = jQuery(this).attr('name');
							if (self.options.fieldNameMappings[name] != undefined) {
								name = self.options.fieldNameMappings[name];
							}
							var value = jQuery(this).val();
							if (valid == true && (value == null || value == "")) {
								showError(jQuery(this), "Please enter a " + name);
								valid = false;
							}
						});
						if (valid) {
							// Check time fields
							jQuery(this).find("form .cd-time").each(function(i) {
								var name = jQuery(this).attr('name');
								if (self.options.fieldNameMappings[name] != undefined) {
									name = self.options.fieldNameMappings[name];
								}
								var value = jQuery(this).val();
								if (valid == true && !value.match(/^\d{1,2}[:]\d{1,2}$/)) {
									showError(jQuery(this), "Please enter a valid time");
									valid = false;
								}
							});
						}
						if (valid) {
							var dialogform = self.element.find("form");
							dialogform.ajaxSubmit({
								success : function(data) {
									self.options.success(data);
								},
								error : function() {
									self.options.error();
								}
							});
							jQuery(this).dialog("close");
						}
					},
					Cancel : function() {
						jQuery(this).dialog("close");
					}
				},
				close : function() {
					var tips = jQuery(this).find(".cp-validatetips");
					jQuery(this).find("select").not(".cd-immutable").removeClass("ui-state-error");
					jQuery(this).find("select").not(".cd-immutable").val('');
					jQuery(this).find("form input").not(".cd-immutable").removeClass("ui-state-error");
					jQuery(this).find("form input").not(".cd-immutable").val('');
					jQuery(this).find("form textarea").not(".cd-immutable").val('');
					jQuery(this).find("form textarea").not(".cd-immutable").removeClass("ui-state-error");
					tips.text('Please enter details.');
					self._isOpen = false;
				}
			});
		},

		_showOverlay : function() {
			this._overlay = $('<div class="ui-widget-overlay"><div class="loader"></div></div>').hide().appendTo('body');
			$('.ui-widget-overlay').show();
			$('.ui-widget-overlay').width($(document).width());
			$('.ui-widget-overlay').height($(document).height());
		},

		_hideOverlay : function() {
			this._overlay.hide();
			this._overlay.remove();
		},

		open : function(id) {
			if (this._isOpen) {
				return;
			}
			this._showOverlay();
			this.element.find(':input[name="id"]').val(id);
			var self = this;
			var okToOpen = true;
			if (self.options.preloadSource != undefined && id != undefined) {
				if (self.options.preloadSource.indexOf("{id}") == -1) {
					this._hideOverlay();
					okToOpen = false;
					alert("Error, preloadSource must contain the pattern {id}");
				} else {
					var url = self.options.preloadSource.replace("{id}", id);

					jQuery.ajax({
						url : url,
						dataType : 'json',
						// async : false,
						context : self,
						success : function(json) {
							var self = this;
							self.options.onLoad(json);
							self.element.find(':input').each(function(i) {
								var name = jQuery(this).attr('name');
								var value = self.options.onLoadInput(name, json);
								if (value == null || value == "") {
									value = json[name];
								}
								if (value != null && value != "") {
									jQuery(this).val(value);
								}
							});
							this._hideOverlay();
							this.element.dialog("open");
							this._isOpen = true;
						},
						error : function() {
							this._hideOverlay();
							okToOpen = false;
							alert("An error has occurred. Please refresh your browser and try again");
						}
					});
				}
			} else {
				if (okToOpen) {
					this._hideOverlay();
					self.element.dialog("open");
					self._isOpen = true;
				}
			}
			return self;
		},
		destroy : function() {
			this.element.dialog.destroy();
			return this;
		}
	};
	$.widget("ui.cruddialog", CrudDialog);
}(jQuery));
