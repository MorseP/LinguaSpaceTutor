/* NUGET: BEGIN LICENSE TEXT
 *
 * Microsoft grants you the right to use these script files for the sole
 * purpose of either: (i) interacting through your browser with the Microsoft
 * website or online service, subject to the applicable licensing or use
 * terms; or (ii) using the files as included with a Microsoft product subject
 * to that product's license terms. Microsoft reserves all other rights to the
 * files not expressly granted by Microsoft, whether by implication, estoppel
 * or otherwise. Insofar as a script file is dual licensed under GPL,
 * Microsoft neither took the code under GPL nor distributes it thereunder but
 * under the terms set out in this paragraph. All notices and licenses
 * below are for informational purposes only.
 *
 * NUGET: END LICENSE TEXT */
/*
* This file has been commented to support Visual Studio Intellisense.
* You should not use this file at runtime inside the browser--it is only
* intended to be used only for design-time IntelliSense.  Please use the
* standard jQuery library for all production use.
*
* Comment version: 1.11.1
*/

/*
* Note: While Microsoft is not the author of this file, Microsoft is
* offering you a license subject to the terms of the Microsoft Software
* License Terms for Microsoft ASP.NET Model View Controller 3.
* Microsoft reserves all other rights. The notices below are provided
* for informational purposes only and are not the license terms under
* which Microsoft distributed this file.
*
* jQuery Validation Plugin - v1.11.1 - 2/4/2013
* https://github.com/jzaefferer/jquery-validation
* Copyright (c) 2013 Jörn Zaefferer; Licensed MIT
*
*/

(function($) {

$.extend($.fn, {
	// http://docs.jquery.com/Plugins/Validation/validate
	validate: function( options ) {
		/// <summary>
		/// Validates the selected form. This method sets up event handlers for submit, focus,
		/// keyup, blur and click to trigger validation of the entire form or individual
		/// elements. Each one can be disabled, see the onxxx options (onsubmit, onfocusout,
		/// onkeyup, onclick). focusInvalid focuses elements when submitting a invalid form.
		/// </summary>
		/// <param name="options" type="Object">
		/// A set of key/value pairs that configure the validate. All options are optional.
		/// </param>

		// if nothing is selected, return nothing; can't chain anyway
		if (!this.length) {
			options && options.debug && window.console && console.warn( "nothing selected, can't validate, returning nothing" );
			return;
		}

		// check if a validator for this form was already created
		var validator = $.data(this[0], 'validator');
		if ( validator ) {
			return validator;
		}
		
		validator = new $.validator( options, this[0] );
		$.data(this[0], 'validator', validator); 
		
		if ( validator.settings.onsubmit ) {
		
			// allow suppresing validation by adding a cancel class to the submit button
			this.find("input, button").filter(".cancel").click(function() {
				validator.cancelSubmit = true;
			});
			
			// when a submitHandler is used, capture the submitting button
			if (validator.settings.submitHandler) {
				this.find("input, button").filter(":submit").click(function() {
					validator.submitButton = this;
				});
			}
		
			// validate the form on submit
			this.submit( function( event ) {
				if ( validator.settings.debug )
					// prevent form submit to be able to see console output
					event.preventDefault();
					
				function handle() {
					if ( validator.settings.submitHandler ) {
						if (validator.submitButton) {
							// insert a hidden input as a replacement for the missing submit button
							var hidden = $("<input type='hidden'/>").attr("name", validator.submitButton.name).val(validator.submitButton.value).appendTo(validator.currentForm);
						}
						validator.settings.submitHandler.call( validator, validator.currentForm );
						if (validator.submitButton) {
							// and clean up afterwards; thanks to no-block-scope, hidden can be referenced
							hidden.remove();
						}
						return false;
					}
					return true;
				}
					
				// prevent submit for invalid forms or custom submit handlers
				if ( validator.cancelSubmit ) {
					validator.cancelSubmit = false;
					return handle();
				}
				if ( validator.form() ) {
					if ( validator.pendingRequest ) {
						validator.formSubmitted = true;
						return false;
					}
					return handle();
				} else {
					validator.focusInvalid();
					return false;
				}
			});
		}
		
		return validator;
	},
	// http://docs.jquery.com/Plugins/Validation/valid
	valid: function() {
		/// <summary>
		/// Checks if the selected form is valid or if all selected elements are valid.
		/// validate() needs to be called on the form before checking it using this method.
		/// </summary>
		/// <returns type="Boolean" />

        if ( $(this[0]).is('form')) {
            return this.validate().form();
        } else {
            var valid = true;
            var validator = $(this[0].form).validate();
            this.each(function() {
				valid &= validator.element(this);
            });
            return valid;
        }
    },
	// attributes: space seperated list of attributes to retrieve and remove
	removeAttrs: function(attributes) {
		/// <summary>
		/// Remove the specified attributes from the first matched element and return them.
		/// </summary>
		/// <param name="attributes" type="String">
		/// A space-seperated list of attribute names to remove.
		/// </param>

		var result = {},
			$element = this;
		$.each(attributes.split(/\s/), function(index, value) {
			result[value] = $element.attr(value);
			$element.removeAttr(value);
		});
		return result;
	},
	// http://docs.jquery.com/Plugins/Validation/rules
	rules: function(command, argument) {
		/// <summary>
		/// Return the validations rules for the first selected element.
		/// </summary>
		/// <param name="command" type="String">
		/// Can be either "add" or "remove".
		/// </param>
		/// <param name="argument" type="">
		/// A list of rules to add or remove.
		/// </param>

		var element = this[0];
		
		if (command) {
			var settings = $.data(element.form, 'validator').settings;
			var staticRules = settings.rules;
			var existingRules = $.validator.staticRules(element);
			switch(command) {
			case "add":
				$.extend(existingRules, $.validator.normalizeRule(argument));
				staticRules[element.name] = existingRules;
				if (argument.messages)
					settings.messages[element.name] = $.extend( settings.messages[element.name], argument.messages );
				break;
			case "remove":
				if (!argument) {
					delete staticRules[element.name];
					return existingRules;
				}
				var filtered = {};
				$.each(argument.split(/\s/), function(index, method) {
					filtered[method] = existingRules[method];
					delete existingRules[method];
				});
				return filtered;
			}
		}
		
		var data = $.validator.normalizeRules(
		$.extend(
			{},
			$.validator.metadataRules(element),
			$.validator.classRules(element),
			$.validator.attributeRules(element),
			$.validator.staticRules(element)
		), element);
		
		// make sure required is at front
		if (data.required) {
			var param = data.required;
			delete data.required;
			data = $.extend({required: param}, data);
		}
		
		return data;
	}
});

// Custom selectors
$.extend($.expr[":"], {
	// http://docs.jquery.com/Plugins/Validation/blank
	blank: function(a) {return !$.trim("" + a.value);},
	// http://docs.jquery.com/Plugins/Validation/filled
	filled: function(a) {return !!$.trim("" + a.value);},
	// http://docs.jquery.com/Plugins/Validation/unchecked
	unchecked: function(a) {return !a.checked;}
});

// constructor for validator
$.validator = function( options, form ) {
	this.settings = $.extend( true, {}, $.validator.defaults, options );
	this.currentForm = form;
	this.init();
};

$.validator.format = function(source, params) {
	/// <summary>
	/// Replaces {n} placeholders with arguments.
	/// One or more arguments can be passed, in addition to the string template itself, to insert
	/// into the string.
	/// </summary>
	/// <param name="source" type="String">
	/// The string to format.
	/// </param>
	/// <param name="params" type="String">
	/// The first argument to insert, or an array of Strings to insert
	/// </param>
	/// <returns type="String" />

	if ( arguments.length == 1 ) 
		return function() {
			var args = $.makeArray(arguments);
			args.unshift(source);
			return $.validator.format.apply( this, args );
		};
	if ( arguments.length > 2 && params.constructor != Array  ) {
		params = $.makeArray(arguments).slice(1);
	}
	if ( params.constructor != Array ) {
		params = [ params ];
	}
	$.each(params, function(i, n) {
		source = source.replace(new RegExp("\\{" + i + "\\}", "g"), n);
	});
	return source;
};

$.extend($.validator, {
	
	defaults: {
		messages: {},
		groups: {},
		rules: {},
		errorClass: "error",
		validClass: "valid",
		errorElement: "label",
		focusInvalid: true,
		errorContainer: $( [] ),
		errorLabelContainer: $( [] ),
		onsubmit: true,
		ignore: [],
		ignoreTitle: false,
		onfocusin: function(element) {
			this.lastActive = element;
				
			// hide error label and remove error class on focus if enabled
			if ( this.settings.focusCleanup && !this.blockFocusCleanup ) {
				this.settings.unhighlight && this.settings.unhighlight.call( this, element, this.settings.errorClass, this.settings.validClass );
				this.addWrapper(this.errorsFor(element)).hide();
			}
		},
		onfocusout: function(element) {
			if ( !this.checkable(element) && (element.name in this.submitted || !this.optional(element)) ) {
				this.element(element);
			}
		},
		onkeyup: function(element) {
			if ( element.name in this.submitted || element == this.lastElement ) {
				this.element(element);
			}
		},
		onclick: function(element) {
			// click on selects, radiobuttons and checkboxes
			if ( element.name in this.submitted )
				this.element(element);
			// or option elements, check parent select in that case
			else if (element.parentNode.name in this.submitted)
				this.element(element.parentNode);
		},
		highlight: function( element, errorClass, validClass ) {
			$(element).addClass(errorClass).removeClass(validClass);
		},
		unhighlight: function( element, errorClass, validClass ) {
			$(element).removeClass(errorClass).addClass(validClass);
		}
	},

	// http://docs.jquery.com/Plugins/Validation/Validator/setDefaults
	setDefaults: function(settings) {
		/// <summary>
		/// Modify default settings for validation.
		/// Accepts everything that Plugins/Validation/validate accepts.
		/// </summary>
		/// <param name="settings" type="Options">
		/// Options to set as default.
		/// </param>

		$.extend( $.validator.defaults, settings );
	},

	messages: {
		required: "This field is required.",
		remote: "Please fix this field.",
		email: "Please enter a valid email address.",
		url: "Please enter a valid URL.",
		date: "Please enter a valid date.",
		dateISO: "Please enter a valid date (ISO).",
		number: "Please enter a valid number.",
		digits: "Please enter only digits.",
		creditcard: "Please enter a valid credit card number.",
		equalTo: "Please enter the same value again.",
		accept: "Please enter a value with a valid extension.",
		maxlength: $.validator.format("Please enter no more than {0} characters."),
		minlength: $.validator.format("Please enter at least {0} characters."),
		rangelength: $.validator.format("Please enter a value between {0} and {1} characters long."),
		range: $.validator.format("Please enter a value between {0} and {1}."),
		max: $.validator.format("Please enter a value less than or equal to {0}."),
		min: $.validator.format("Please enter a value greater than or equal to {0}.")
	},
	
	autoCreateRanges: false,
	
	prototype: {
		
		init: function() {
			this.labelContainer = $(this.settings.errorLabelContainer);
			this.errorContext = this.labelContainer.length && this.labelContainer || $(this.currentForm);
			this.containers = $(this.settings.errorContainer).add( this.settings.errorLabelContainer );
			this.submitted = {};
			this.valueCache = {};
			this.pendingRequest = 0;
			this.pending = {};
			this.invalid = {};
			this.reset();
			
			var groups = (this.groups = {});
			$.each(this.settings.groups, function(key, value) {
				$.each(value.split(/\s/), function(index, name) {
					groups[name] = key;
				});
			});
			var rules = this.settings.rules;
			$.each(rules, function(key, value) {
				rules[key] = $.validator.normalizeRule(value);
			});
			
			function delegate(event) {
				var validator = $.data(this[0].form, "validator"),
					eventType = "on" + event.type.replace(/^validate/, "");
				validator.settings[eventType] && validator.settings[eventType].call(validator, this[0] );
			}
			$(this.currentForm)
				.validateDelegate(":text, :password, :file, select, textarea", "focusin focusout keyup", delegate)
				.validateDelegate(":radio, :checkbox, select, option", "click", delegate);

			if (this.settings.invalidHandler)
				$(this.currentForm).bind("invalid-form.validate", this.settings.invalidHandler);
		},

		// http://docs.jquery.com/Plugins/Validation/Validator/form
		form: function() {
			/// <summary>
			/// Validates the form, returns true if it is valid, false otherwise.
			/// This behaves as a normal submit event, but returns the result.
			/// </summary>
			/// <returns type="Boolean" />

			this.checkForm();
			$.extend(this.submitted, this.errorMap);
			this.invalid = $.extend({}, this.errorMap);
			if (!this.valid())
				$(this.currentForm).triggerHandler("invalid-form", [this]);
			this.showErrors();
			return this.valid();
		},
		
		checkForm: function() {
			this.prepareForm();
			for ( var i = 0, elements = (this.currentElements = this.elements()); elements[i]; i++ ) {
				this.check( elements[i] );
			}
			return this.valid(); 
		},
		
		// http://docs.jquery.com/Plugins/Validation/Validator/element
		element: function( element ) {
			/// <summary>
			/// Validates a single element, returns true if it is valid, false otherwise.
			/// This behaves as validation on blur or keyup, but returns the result.
			/// </summary>
			/// <param name="element" type="Selector">
			/// An element to validate, must be inside the validated form.
			/// </param>
			/// <returns type="Boolean" />

			element = this.clean( element );
			this.lastElement = element;
			this.prepareElement( element );
			this.currentElements = $(element);
			var result = this.check( element );
			if ( result ) {
				delete this.invalid[element.name];
			} else {
				this.invalid[element.name] = true;
			}
			if ( !this.numberOfInvalids() ) {
				// Hide error containers on last error
				this.toHide = this.toHide.add( this.containers );
			}
			this.showErrors();
			return result;
		},

		// http://docs.jquery.com/Plugins/Validation/Validator/showErrors
		showErrors: function(errors) {
			/// <summary>
			/// Show the specified messages.
			/// Keys have to refer to the names of elements, values are displayed for those elements, using the configured error placement.
			/// </summary>
			/// <param name="errors" type="Object">
			/// One or more key/value pairs of input names and messages.
			/// </param>

			if(errors) {
				// add items to error list and map
				$.extend( this.errorMap, errors );
				this.errorList = [];
				for ( var name in errors ) {
					this.errorList.push({
						message: errors[name],
						element: this.findByName(name)[0]
					});
				}
				// remove items from success list
				this.successList = $.grep( this.successList, function(element) {
					return !(element.name in errors);
				});
			}
			this.settings.showErrors
				? this.settings.showErrors.call( this, this.errorMap, this.errorList )
				: this.defaultShowErrors();
		},
		
		// http://docs.jquery.com/Plugins/Validation/Validator/resetForm
		resetForm: function() {
			/// <summary>
			/// Resets the controlled form.
			/// Resets input fields to their original value (requires form plugin), removes classes
			/// indicating invalid elements and hides error messages.
			/// </summary>

			if ( $.fn.resetForm )
				$( this.currentForm ).resetForm();
			this.submitted = {};
			this.prepareForm();
			this.hideErrors();
			this.elements().removeClass( this.settings.errorClass );
		},
		
		numberOfInvalids: function() {
			/// <summary>
			/// Returns the number of invalid fields.
			/// This depends on the internal validator state. It covers all fields only after
			/// validating the complete form (on submit or via $("form").valid()). After validating
			/// a single element, only that element is counted. Most useful in combination with the
			/// invalidHandler-option.
			/// </summary>
			/// <returns type="Number" />

			return this.objectLength(this.invalid);
		},
		
		objectLength: function( obj ) {
			var count = 0;
			for ( var i in obj )
				count++;
			return count;
		},
		
		hideErrors: function() {
			this.addWrapper( this.toHide ).hide();
		},
		
		valid: function() {
			return this.size() == 0;
		},
		
		size: function() {
			return this.errorList.length;
		},
		
		focusInvalid: function() {
			if( this.settings.focusInvalid ) {
				try {
					$(this.findLastActive() || this.errorList.length && this.errorList[0].element || [])
					.filter(":visible")
					.focus()
					// manually trigger focusin event; without it, focusin handler isn't called, findLastActive won't have anything to find
					.trigger("focusin");
				} catch(e) {
					// ignore IE throwing errors when focusing hidden elements
				}
			}
		},
		
		findLastActive: function() {
			var lastActive = this.lastActive;
			return lastActive && $.grep(this.errorList, function(n) {
				return n.element.name == lastActive.name;
			}).length == 1 && lastActive;
		},
		
		elements: function() {
			var validator = this,
				rulesCache = {};
			
			// select all valid inputs inside the form (no submit or reset buttons)
			// workaround $Query([]).add until http://dev.jquery.com/ticket/2114 is solved
			return $([]).add(this.currentForm.elements)
			.filter(":input")
			.not(":submit, :reset, :image, [disabled]")
			.not( this.settings.ignore )
			.filter(function() {
				!this.name && validator.settings.debug && window.console && console.error( "%o has no name assigned", this);
			
				// select only the first element for each name, and only those with rules specified
				if ( this.name in rulesCache || !validator.objectLength($(this).rules()) )
					return false;
				
				rulesCache[this.name] = true;
				return true;
			});
		},
		
		clean: function( selector ) {
			return $( selector )[0];
		},
		
		errors: function() {
			return $( this.settings.errorElement + "." + this.settings.errorClass, this.errorContext );
		},
		
		reset: function() {
			this.successList = [];
			this.errorList = [];
			this.errorMap = {};
			this.toShow = $([]);
			this.toHide = $([]);
			this.currentElements = $([]);
		},
		
		prepareForm: function() {
			this.reset();
			this.toHide = this.errors().add( this.containers );
		},
		
		prepareElement: function( element ) {
			this.reset();
			this.toHide = this.errorsFor(element);
		},
	
		check: function( element ) {
			element = this.clean( element );
			
			// if radio/checkbox, validate first element in group instead
			if (this.checkable(element)) {
			    element = this.findByName(element.name).not(this.settings.ignore)[0];
			}
			
			var rules = $(element).rules();
			var dependencyMismatch = false;
			for (var method in rules) {
				var rule = { method: method, parameters: rules[method] };
				try {
					var result = $.validator.methods[method].call( this, element.value.replace(/\r/g, ""), element, rule.parameters );
					
					// if a method indicates that the field is optional and therefore valid,
					// don't mark it as valid when there are no other rules
					if ( result == "dependency-mismatch" ) {
						dependencyMismatch = true;
						continue;
					}
					dependencyMismatch = false;
					
					if ( result == "pending" ) {
						this.toHide = this.toHide.not( this.errorsFor(element) );
						return;
					}
					
					if( !result ) {
						this.formatAndAdd( element, rule );
						return false;
					}
				} catch(e) {
					this.settings.debug && window.console && console.log("exception occured when checking element " + element.id
						 + ", check the '" + rule.method + "' method", e);
					throw e;
				}
			}
			if (dependencyMismatch)
				return;
			if ( this.objectLength(rules) )
				this.successList.push(element);
			return true;
		},
		
		// return the custom message for the given element and validation method
		// specified in the element's "messages" metadata
		customMetaMessage: function(element, method) {
			if (!$.metadata)
				return;
			
			var meta = this.settings.meta
				? $(element).metadata()[this.settings.meta]
				: $(element).metadata();
			
			return meta && meta.messages && meta.messages[method];
		},
		
		// return the custom message for the given element name and validation method
		customMessage: function( name, method ) {
			var m = this.settings.messages[name];
			return m && (m.constructor == String
				? m
				: m[method]);
		},
		
		// return the first defined argument, allowing empty strings
		findDefined: function() {
			for(var i = 0; i < arguments.length; i++) {
				if (arguments[i] !== undefined)
					return arguments[i];
			}
			return undefined;
		},
		
		defaultMessage: function( element, method) {
			return this.findDefined(
				this.customMessage( element.name, method ),
				this.customMetaMessage( element, method ),
				// title is never undefined, so handle empty string as undefined
				!this.settings.ignoreTitle && element.title || undefined,
				$.validator.messages[method],
				"<strong>Warning: No message defined for " + element.name + "</strong>"
			);
		},
		
		formatAndAdd: function( element, rule ) {
			var message = this.defaultMessage( element, rule.method ),
				theregex = /\$?\{(\d+)\}/g;
			if ( typeof message == "function" ) {
				message = message.call(this, rule.parameters, element);
			} else if (theregex.test(message)) {
				message = jQuery.format(message.replace(theregex, '{$1}'), rule.parameters);
			}			
			this.errorList.push({
				message: message,
				element: element
			});
			
			this.errorMap[element.name] = message;
			this.submitted[element.name] = message;
		},
		
		addWrapper: function(toToggle) {
			if ( this.settings.wrapper )
				toToggle = toToggle.add( toToggle.parent( this.settings.wrapper ) );
			return toToggle;
		},
		
		defaultShowErrors: function() {
			for ( var i = 0; this.errorList[i]; i++ ) {
				var error = this.errorList[i];
				this.settings.highlight && this.settings.highlight.call( this, error.element, this.settings.errorClass, this.settings.validClass );
				this.showLabel( error.element, error.message );
			}
			if( this.errorList.length ) {
				this.toShow = this.toShow.add( this.containers );
			}
			if (this.settings.success) {
				for ( var i = 0; this.successList[i]; i++ ) {
					this.showLabel( this.successList[i] );
				}
			}
			if (this.settings.unhighlight) {
				for ( var i = 0, elements = this.validElements(); elements[i]; i++ ) {
					this.settings.unhighlight.call( this, elements[i], this.settings.errorClass, this.settings.validClass );
				}
			}
			this.toHide = this.toHide.not( this.toShow );
			this.hideErrors();
			this.addWrapper( this.toShow ).show();
		},
		
		validElements: function() {
			return this.currentElements.not(this.invalidElements());
		},
		
		invalidElements: function() {
			return $(this.errorList).map(function() {
				return this.element;
			});
		},
		
		showLabel: function(element, message) {
			var label = this.errorsFor( element );
			if ( label.length ) {
				// refresh error/success class
				label.removeClass().addClass( this.settings.errorClass );
			
				// check if we have a generated label, replace the message then
				label.attr("generated") && label.html(message);
			} else {
				// create label
				label = $("<" + this.settings.errorElement + "/>")
					.attr({"for":  this.idOrName(element), generated: true})
					.addClass(this.settings.errorClass)
					.html(message || "");
				if ( this.settings.wrapper ) {
					// make sure the element is visible, even in IE
					// actually showing the wrapped element is handled elsewhere
					label = label.hide().show().wrap("<" + this.settings.wrapper + "/>").parent();
				}
				if ( !this.labelContainer.append(label).length )
					this.settings.errorPlacement
						? this.settings.errorPlacement(label, $(element) )
						: label.insertAfter(element);
			}
			if ( !message && this.settings.success ) {
				label.text("");
				typeof this.settings.success == "string"
					? label.addClass( this.settings.success )
					: this.settings.success( label );
			}
			this.toShow = this.toShow.add(label);
		},
		
		errorsFor: function(element) {
			var name = this.idOrName(element);
    		return this.errors().filter(function() {
				return $(this).attr('for') == name;
			});
		},
		
		idOrName: function(element) {
			return this.groups[element.name] || (this.checkable(element) ? element.name : element.id || element.name);
		},

		checkable: function( element ) {
			return /radio|checkbox/i.test(element.type);
		},
		
		findByName: function( name ) {
			// select by name and filter by form for performance over form.find("[name=...]")
			var form = this.currentForm;
			return $(document.getElementsByName(name)).map(function(index, element) {
				return element.form == form && element.name == name && element  || null;
			});
		},
		
		getLength: function(value, element) {
			switch( element.nodeName.toLowerCase() ) {
			case 'select':
				return $("option:selected", element).length;
			case 'input':
				if( this.checkable( element) )
					return this.findByName(element.name).filter(':checked').length;
			}
			return value.length;
		},
	
		depend: function(param, element) {
			return this.dependTypes[typeof param]
				? this.dependTypes[typeof param](param, element)
				: true;
		},
	
		dependTypes: {
			"boolean": function(param, element) {
				return param;
			},
			"string": function(param, element) {
				return !!$(param, element.form).length;
			},
			"function": function(param, element) {
				return param(element);
			}
		},
		
		optional: function(element) {
			return !$.validator.methods.required.call(this, $.trim(element.value), element) && "dependency-mismatch";
		},
		
		startRequest: function(element) {
			if (!this.pending[element.name]) {
				this.pendingRequest++;
				this.pending[element.name] = true;
			}
		},
		
		stopRequest: function(element, valid) {
			this.pendingRequest--;
			// sometimes synchronization fails, make sure pendingRequest is never < 0
			if (this.pendingRequest < 0)
				this.pendingRequest = 0;
			delete this.pending[element.name];
			if ( valid && this.pendingRequest == 0 && this.formSubmitted && this.form() ) {
				$(this.currentForm).submit();
				this.formSubmitted = false;
			} else if (!valid && this.pendingRequest == 0 && this.formSubmitted) {
				$(this.currentForm).triggerHandler("invalid-form", [this]);
				this.formSubmitted = false;
			}
		},
		
		previousValue: function(element) {
			return $.data(element, "previousValue") || $.data(element, "previousValue", {
				old: null,
				valid: true,
				message: this.defaultMessage( element, "remote" )
			});
		}
		
	},
	
	classRuleSettings: {
		required: {required: true},
		email: {email: true},
		url: {url: true},
		date: {date: true},
		dateISO: {dateISO: true},
		dateDE: {dateDE: true},
		number: {number: true},
		numberDE: {numberDE: true},
		digits: {digits: true},
		creditcard: {creditcard: true}
	},
	
	addClassRules: function(className, rules) {
		/// <summary>
		/// Add a compound class method - useful to refactor common combinations of rules into a single
		/// class.
		/// </summary>
		/// <param name="name" type="String">
		/// The name of the class rule to add
		/// </param>
		/// <param name="rules" type="Options">
		/// The compound rules
		/// </param>

		className.constructor == String ?
			this.classRuleSettings[className] = rules :
			$.extend(this.classRuleSettings, className);
	},
	
	classRules: function(element) {
		var rules = {};
		var classes = $(element).attr('class');
		classes && $.each(classes.split(' '), function() {
			if (this in $.validator.classRuleSettings) {
				$.extend(rules, $.validator.classRuleSettings[this]);
			}
		});
		return rules;
	},
	
	attributeRules: function(element) {
		var rules = {};
		var $element = $(element);

		for (var method in $.validator.methods) {
			var value = $element.attr(method);
			if (value) {
				rules[method] = value;
			}
		}
		
		// maxlength may be returned as -1, 2147483647 (IE) and 524288 (safari) for text inputs
		if (rules.maxlength && /-1|2147483647|524288/.test(rules.maxlength)) {
			delete rules.maxlength;
		}
		
		return rules;
	},
	
	metadataRules: function(element) {
		if (!$.metadata) return {};
		
		var meta = $.data(element.form, 'validator').settings.meta;
		return meta ?
			$(element).metadata()[meta] :
			$(element).metadata();
	},
	
	staticRules: function(element) {
		var rules = {};
		var validator = $.data(element.form, 'validator');
		if (validator.settings.rules) {
			rules = $.validator.normalizeRule(validator.settings.rules[element.name]) || {};
		}
		return rules;
	},
	
	normalizeRules: function(rules, element) {
		// handle dependency check
		$.each(rules, function(prop, val) {
			// ignore rule when param is explicitly false, eg. required:false
			if (val === false) {
				delete rules[prop];
				return;
			}
			if (val.param || val.depends) {
				var keepRule = true;
				switch (typeof val.depends) {
					case "string":
						keepRule = !!$(val.depends, element.form).length;
						break;
					case "function":
						keepRule = val.depends.call(element, element);
						break;
				}
				if (keepRule) {
					rules[prop] = val.param !== undefined ? val.param : true;
				} else {
					delete rules[prop];
				}
			}
		});
		
		// evaluate parameters
		$.each(rules, function(rule, parameter) {
			rules[rule] = $.isFunction(parameter) ? parameter(element) : parameter;
		});
		
		// clean number parameters
		$.each(['minlength', 'maxlength', 'min', 'max'], function() {
			if (rules[this]) {
				rules[this] = Number(rules[this]);
			}
		});
		$.each(['rangelength', 'range'], function() {
			if (rules[this]) {
				rules[this] = [Number(rules[this][0]), Number(rules[this][1])];
			}
		});
		
		if ($.validator.autoCreateRanges) {
			// auto-create ranges
			if (rules.min && rules.max) {
				rules.range = [rules.min, rules.max];
				delete rules.min;
				delete rules.max;
			}
			if (rules.minlength && rules.maxlength) {
				rules.rangelength = [rules.minlength, rules.maxlength];
				delete rules.minlength;
				delete rules.maxlength;
			}
		}
		
		// To support custom messages in metadata ignore rule methods titled "messages"
		if (rules.messages) {
			delete rules.messages;
		}
		
		return rules;
	},
	
	// Converts a simple string to a {string: true} rule, e.g., "required" to {required:true}
	normalizeRule: function(data) {
		if( typeof data == "string" ) {
			var transformed = {};
			$.each(data.split(/\s/), function() {
				transformed[this] = true;
			});
			data = transformed;
		}
		return data;
	},
	
	// http://docs.jquery.com/Plugins/Validation/Validator/addMethod
	addMethod: function(name, method, message) {
		/// <summary>
		/// Add a custom validation method. It must consist of a name (must be a legal javascript 
		/// identifier), a javascript based function and a default string message.
		/// </summary>
		/// <param name="name" type="String">
		/// The name of the method, used to identify and referencing it, must be a valid javascript
		/// identifier
		/// </param>
		/// <param name="method" type="Function">
		/// The actual method implementation, returning true if an element is valid
		/// </param>
		/// <param name="message" type="String" optional="true">
		/// (Optional) The default message to display for this method. Can be a function created by 
		/// jQuery.validator.format(value). When undefined, an already existing message is used 
		/// (handy for localization), otherwise the field-specific messages have to be defined.
		/// </param>

		$.validator.methods[name] = method;
		$.validator.messages[name] = message != undefined ? message : $.validator.messages[name];
		if (method.length < 3) {
			$.validator.addClassRules(name, $.validator.normalizeRule(name));
		}
	},

	methods: {

		// http://docs.jquery.com/Plugins/Validation/Methods/required
		required: function(value, element, param) {
			// check if dependency is met
			if ( !this.depend(param, element) )
				return "dependency-mismatch";
			switch( element.nodeName.toLowerCase() ) {
			case 'select':
				// could be an array for select-multiple or a string, both are fine this way
				var val = $(element).val();
				return val && val.length > 0;
			case 'input':
				if ( this.checkable(element) )
					return this.getLength(value, element) > 0;
			default:
				return $.trim(value).length > 0;
			}
		},
		
		// http://docs.jquery.com/Plugins/Validation/Methods/remote
		remote: function(value, element, param) {
			if ( this.optional(element) )
				return "dependency-mismatch";
			
			var previous = this.previousValue(element);
			if (!this.settings.messages[element.name] )
				this.settings.messages[element.name] = {};
			previous.originalMessage = this.settings.messages[element.name].remote;
			this.settings.messages[element.name].remote = previous.message;
			
			param = typeof param == "string" && {url:param} || param; 
			
			if ( this.pending[element.name] ) {
				return "pending";
			}
			if ( previous.old === value ) {
				return previous.valid;
			}

			previous.old = value;
			var validator = this;
			this.startRequest(element);
			var data = {};
			data[element.name] = value;
			$.ajax($.extend(true, {
				url: param,
				mode: "abort",
				port: "validate" + element.name,
				dataType: "json",
				data: data,
				success: function(response) {
					validator.settings.messages[element.name].remote = previous.originalMessage;
					var valid = response === true;
					if ( valid ) {
						var submitted = validator.formSubmitted;
						validator.prepareElement(element);
						validator.formSubmitted = submitted;
						validator.successList.push(element);
						validator.showErrors();
					} else {
						var errors = {};
						var message = response || validator.defaultMessage(element, "remote");
						errors[element.name] = previous.message = $.isFunction(message) ? message(value) : message;
						validator.showErrors(errors);
					}
					previous.valid = valid;
					validator.stopRequest(element, valid);
				}
			}, param));
			return "pending";
		},

		// http://docs.jquery.com/Plugins/Validation/Methods/minlength
		minlength: function(value, element, param) {
			return this.optional(element) || this.getLength($.trim(value), element) >= param;
		},
		
		// http://docs.jquery.com/Plugins/Validation/Methods/maxlength
		maxlength: function(value, element, param) {
			return this.optional(element) || this.getLength($.trim(value), element) <= param;
		},
		
		// http://docs.jquery.com/Plugins/Validation/Methods/rangelength
		rangelength: function(value, element, param) {
			var length = this.getLength($.trim(value), element);
			return this.optional(element) || ( length >= param[0] && length <= param[1] );
		},
		
		// http://docs.jquery.com/Plugins/Validation/Methods/min
		min: function( value, element, param ) {
			return this.optional(element) || value >= param;
		},
		
		// http://docs.jquery.com/Plugins/Validation/Methods/max
		max: function( value, element, param ) {
			return this.optional(element) || value <= param;
		},
		
		// http://docs.jquery.com/Plugins/Validation/Methods/range
		range: function( value, element, param ) {
			return this.optional(element) || ( value >= param[0] && value <= param[1] );
		},
		
		// http://docs.jquery.com/Plugins/Validation/Methods/email
		email: function(value, element) {
			// contributed by Scott Gonzalez: http://projects.scottsplayground.com/email_address_validation/
			return this.optional(element) || /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i.test(value);
		},
	
		// http://docs.jquery.com/Plugins/Validation/Methods/url
		url: function(value, element) {
			// contributed by Scott Gonzalez: http://projects.scottsplayground.com/iri/
			return this.optional(element) || /^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(value);
		},
        
		// http://docs.jquery.com/Plugins/Validation/Methods/date
		date: function(value, element) {
			return this.optional(element) || !/Invalid|NaN/.test(new Date(value));
		},
	
		// http://docs.jquery.com/Plugins/Validation/Methods/dateISO
		dateISO: function(value, element) {
			return this.optional(element) || /^\d{4}[\/-]\d{1,2}[\/-]\d{1,2}$/.test(value);
		},
	
		// http://docs.jquery.com/Plugins/Validation/Methods/number
		number: function(value, element) {
			return this.optional(element) || /^-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/.test(value);
		},
	
		// http://docs.jquery.com/Plugins/Validation/Methods/digits
		digits: function(value, element) {
			return this.optional(element) || /^\d+$/.test(value);
		},
		
		// http://docs.jquery.com/Plugins/Validation/Methods/creditcard
		// based on http://en.wikipedia.org/wiki/Luhn
		creditcard: function(value, element) {
			if ( this.optional(element) )
				return "dependency-mismatch";
			// accept only digits and dashes
			if (/[^0-9-]+/.test(value))
				return false;
			var nCheck = 0,
				nDigit = 0,
				bEven = false;

			value = value.replace(/\D/g, "");

			for (var n = value.length - 1; n >= 0; n--) {
				var cDigit = value.charAt(n);
				var nDigit = parseInt(cDigit, 10);
				if (bEven) {
					if ((nDigit *= 2) > 9)
						nDigit -= 9;
				}
				nCheck += nDigit;
				bEven = !bEven;
			}

			return (nCheck % 10) == 0;
		},
		
		// http://docs.jquery.com/Plugins/Validation/Methods/accept
		accept: function(value, element, param) {
			param = typeof param == "string" ? param.replace(/,/g, '|') : "png|jpe?g|gif";
			return this.optional(element) || value.match(new RegExp(".(" + param + ")$", "i")); 
		},
		
		// http://docs.jquery.com/Plugins/Validation/Methods/equalTo
		equalTo: function(value, element, param) {
			// bind to the blur event of the target in order to revalidate whenever the target field is updated
			// TODO find a way to bind the event just once, avoiding the unbind-rebind overhead
			var target = $(param).unbind(".validate-equalTo").bind("blur.validate-equalTo", function() {
				$(element).valid();
			});
			return value == target.val();
		}
		
	}
	
});

// deprecated, use $.validator.format instead
$.format = $.validator.format;

})(jQuery);

// ajax mode: abort
// usage: $.ajax({ mode: "abort"[, port: "uniqueport"]});
// if mode:"abort" is used, the previous request on that port (port can be undefined) is aborted via XMLHttpRequest.abort() 
;(function($) {
	var pendingRequests = {};
		// Use a prefilter if available (1.5+)
	if ( $.ajaxPrefilter ) {
		$.ajaxPrefilter(function(settings, _, xhr) {
		    var port = settings.port;
		    if (settings.mode == "abort") {
			    if ( pendingRequests[port] ) {
				    pendingRequests[port].abort();
			    }				pendingRequests[port] = xhr;
		    }
	    });
	} else {
		// Proxy ajax
		var ajax = $.ajax;
		$.ajax = function(settings) {
			var mode = ( "mode" in settings ? settings : $.ajaxSettings ).mode,
				port = ( "port" in settings ? settings : $.ajaxSettings ).port;
			if (mode == "abort") {
				if ( pendingRequests[port] ) {
					pendingRequests[port].abort();
				}

			    return (pendingRequests[port] = ajax.apply(this, arguments));
		    }
		    return ajax.apply(this, arguments);
	    };
    }
})(jQuery);

// provides cross-browser focusin and focusout events
// IE has native support, in other browsers, use event caputuring (neither bubbles)

// provides delegate(type: String, delegate: Selector, handler: Callback) plugin for easier event delegation
// handler is only called when $(event.target).is(delegate), in the scope of the jquery-object for event.target 
;(function($) {
	// only implement if not provided by jQuery core (since 1.4)
	// TODO verify if jQuery 1.4's implementation is compatible with older jQuery special-event APIs
	if (!jQuery.event.special.focusin && !jQuery.event.special.focusout && document.addEventListener) {
		$.each({
			focus: 'focusin',
			blur: 'focusout'	
		}, function( original, fix ){
			$.event.special[fix] = {
				setup:function() {
					this.addEventListener( original, handler, true );
				},
				teardown:function() {
					this.removeEventListener( original, handler, true );
				},
				handler: function(e) {
					arguments[0] = $.event.fix(e);
					arguments[0].type = fix;
					return $.event.handle.apply(this, arguments);
				}
			};
			function handler(e) {
				e = $.event.fix(e);
				e.type = fix;
				return $.event.handle.call(this, e);
			}
		});
	};
	$.extend($.fn, {
		validateDelegate: function(delegate, type, handler) {
			return this.bind(type, function(event) {
				var target = $(event.target);
				if (target.is(delegate)) {
					return handler.apply(target, arguments);
				}
			});
		}
	});
})(jQuery);

// SIG // Begin signature block
// SIG // MIInWAYJKoZIhvcNAQcCoIInSTCCJ0UCAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // DVqhCazyZ/I9ukuXZXzRGNXEWGSayWACbUkRcllNMBag
// SIG // ggzPMIIGCjCCA/KgAwIBAgITMwAAAf7+iki1zsRg8QAA
// SIG // AAAB/jANBgkqhkiG9w0BAQsFADBXMQswCQYDVQQGEwJV
// SIG // UzEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBvcmF0aW9u
// SIG // MSgwJgYDVQQDEx9NaWNyb3NvZnQgQ29kZSBTaWduaW5n
// SIG // IFBDQSAyMDI0MB4XDTI2MDQxNjE4NTg1MloXDTI3MDQx
// SIG // NTE4NTg1MlowgYgxCzAJBgNVBAYTAlVTMRMwEQYDVQQI
// SIG // EwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4w
// SIG // HAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xMjAw
// SIG // BgNVBAMTKU1pY3Jvc29mdCAzcmQgUGFydHkgQXBwbGlj
// SIG // YXRpb24gQ29tcG9uZW50MIIBIjANBgkqhkiG9w0BAQEF
// SIG // AAOCAQ8AMIIBCgKCAQEAv1RjgRSjfl8SE93CFRZLi4N7
// SIG // hmn0IkvQqsfJc1+80zFVHlZnA2HGF7IpvPeqinp4SBpe
// SIG // dfM69fqNJ+id+q8ZhHP6OsW2//iI3bQED00ekouNByvJ
// SIG // H2QcqJATkcgsxjOPVYj4SOqcfR16iGU3KMpNZvydzu/Z
// SIG // eOxbpZnfl0mcLmeqDdjexv5f0w8dieu9Jh26TIL1zv7o
// SIG // Sd0St8Y1eZFQCZeIce5m6jGgRdho0LoIHtdLfR3a9giZ
// SIG // KYzuHiLmOh3W6uu7kwf24wiRsdRtU0yp2QsjaWGgrdpX
// SIG // VRMwyzaKvi4OMNJENmSFzOCZcGMBQHen5QRXas4T2mx3
// SIG // EmZEByYdYQIDAQABo4IBmzCCAZcwDgYDVR0PAQH/BAQD
// SIG // AgeAMB8GA1UdJQQYMBYGCisGAQQBgjdMEQEGCCsGAQUF
// SIG // BwMDMB0GA1UdDgQWBBQmGTbv1kPrIUXGSzs97yJZtFaq
// SIG // FTBFBgNVHREEPjA8pDowODEeMBwGA1UECxMVTWljcm9z
// SIG // b2Z0IENvcnBvcmF0aW9uMRYwFAYDVQQFEw0yMzE1MjIr
// SIG // NTA3NTMxMB8GA1UdIwQYMBaAFH9ZP1Qh2q1P7wXl5qPX
// SIG // LQaUEggxMGAGA1UdHwRZMFcwVaBToFGGT2h0dHA6Ly93
// SIG // d3cubWljcm9zb2Z0LmNvbS9wa2lvcHMvY3JsL01pY3Jv
// SIG // c29mdCUyMENvZGUlMjBTaWduaW5nJTIwUENBJTIwMjAy
// SIG // NC5jcmwwbQYIKwYBBQUHAQEEYTBfMF0GCCsGAQUFBzAC
// SIG // hlFodHRwOi8vd3d3Lm1pY3Jvc29mdC5jb20vcGtpb3Bz
// SIG // L2NlcnRzL01pY3Jvc29mdCUyMENvZGUlMjBTaWduaW5n
// SIG // JTIwUENBJTIwMjAyNC5jcnQwDAYDVR0TAQH/BAIwADAN
// SIG // BgkqhkiG9w0BAQsFAAOCAgEAHOf/iJrPCpgPWpNTX6BF
// SIG // WYi9rR5/fn97/d+ZHac+/R/2bPc++JzQ4EfFVt6bM0Zb
// SIG // 4EphOAzJQI9B+yltQST/qG0oVMpAUIs8vJgBRbimu/r0
// SIG // OMhZZbRkWfYsKK31vac0B3PSRhkj/0pN/8gApEuATBsp
// SIG // NT6VPZB0SfQ4rg/U/sohdvtoRIYqrP1P+kBwWeQUthaM
// SIG // oOVl5nI8upWghZZMeCj6kx4OeXAPp6zzYlK5mEnoCW4J
// SIG // awcxoaqhFhtJTVaEWWDK5vkjGeBbNbvwkK4e3/16gGW+
// SIG // 8WklZtzg10KPhqX0jRV0bG4IiItEPUqUQyRj2aN2EACH
// SIG // FJeJBstrSc5BSp9vnmRcvdnrnnwGf2NSPiR1193Lx/0W
// SIG // LhlJkscqM7Qv2Dsu6feXS5xLLIPRUEKPCA0Y5xJq1+f7
// SIG // JXB1WxQxAxVKZq6tT1X28pe99xIGiyQYtiP1PSy0TqMJ
// SIG // ePWicHUEIYtWn9KifSvZKA/LrlKCqiG2Yg5zSeZ+Ezvi
// SIG // Q3bLHQy43Mog2KtfArR4R+ZertkNoDe7w9LNUjwPvV2H
// SIG // kYFY4FjXNFZBLLaDdECMu79XQVoC5ANGzb7VnTM1plM5
// SIG // rN1+suCJ8ygMo7rUa1/Vi2zRlYuyfZB7WnAZUknCAUI1
// SIG // kFEJexnmZXQYBV+dokvoirtl6k4/Uu5NDOuryxqYFZFc
// SIG // Nyswgga9MIIEpaADAgECAhMzAAAAOTu2Nxm/Bh1nAAAA
// SIG // AAA5MA0GCSqGSIb3DQEBDAUAMIGIMQswCQYDVQQGEwJV
// SIG // UzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMH
// SIG // UmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBv
// SIG // cmF0aW9uMTIwMAYDVQQDEylNaWNyb3NvZnQgUm9vdCBD
// SIG // ZXJ0aWZpY2F0ZSBBdXRob3JpdHkgMjAxMTAeFw0yNDA4
// SIG // MDgyMDU0MThaFw0zNjAzMjIyMjEzMDRaMFcxCzAJBgNV
// SIG // BAYTAlVTMR4wHAYDVQQKExVNaWNyb3NvZnQgQ29ycG9y
// SIG // YXRpb24xKDAmBgNVBAMTH01pY3Jvc29mdCBDb2RlIFNp
// SIG // Z25pbmcgUENBIDIwMjQwggIiMA0GCSqGSIb3DQEBAQUA
// SIG // A4ICDwAwggIKAoICAQDYAZwe4zjHqpUWBzWtuub+CGPX
// SIG // x/EyoXph3zyDXtYKS2ld3YYN9uFsB9Oi3B26Z7AbpAgz
// SIG // Yra8qNHbUvxFuiP8hC/2y0mPISqW30LlrrAT6/ams2HA
// SIG // 8Qlv6p42+SbCNbPGzToN21QE70FS+LXH9N2k8nLM/EHg
// SIG // nTNJf8h0TmyfUKmszNa+lTxDieyy/rhBG+98OkArobPP
// SIG // Wtbr9c3qzmDJ7J3kUcAm6cltdSHIIFNHESgw6taY1Scy
// SIG // GyBevqIl120XjrIHiPM7tRckHytH1ZGsmvEplR0P7Tn9
// SIG // t5meFvZNEYttkFvad1IEguTlA5LSscXAphi+rVy3zhkl
// SIG // hyCFeGK0yU0+jzbcuURKIxybmRwK5BfVZx0xEVqE4wM3
// SIG // yN5D/uW+GpVHYYAGe7bTrtW1Z13x2qj2Jdqz7NtI4tNy
// SIG // zlVrIf62nYBNe3rOYS/repVdHlR61YbLLETlibs9jFzA
// SIG // re4sO5RTxvS1yho7JqJ59oKLRnRyLhIOSZyTCVZosXeS
// SIG // 0ZZJoGEWSs4cUgsMqBiKtD4WgO2PlT3LeaQh5Io3CCA5
// SIG // tJ5ZCvtCsnqaJXKhptE/xmEETIRyZRjjplUKKd+sFFVG
// SIG // JJVMvvrw1nhIBKOLO4cTepiG39jEiEP4iHzGYCcQuvaL
// SIG // pDFFwqzgt0pBP8SJIKX5dtjDNYrZGd+ZzV5DKJVNZQID
// SIG // AQABo4IBTjCCAUowDgYDVR0PAQH/BAQDAgGGMBAGCSsG
// SIG // AQQBgjcVAQQDAgEAMB0GA1UdDgQWBBR/WT9UIdqtT+8F
// SIG // 5eaj1y0GlBIIMTAZBgkrBgEEAYI3FAIEDB4KAFMAdQBi
// SIG // AEMAQTAPBgNVHRMBAf8EBTADAQH/MB8GA1UdIwQYMBaA
// SIG // FHItOgIxkEO5FAVO4eqnxzHRI4k0MFoGA1UdHwRTMFEw
// SIG // T6BNoEuGSWh0dHA6Ly9jcmwubWljcm9zb2Z0LmNvbS9w
// SIG // a2kvY3JsL3Byb2R1Y3RzL01pY1Jvb0NlckF1dDIwMTFf
// SIG // MjAxMV8wM18yMi5jcmwwXgYIKwYBBQUHAQEEUjBQME4G
// SIG // CCsGAQUFBzAChkJodHRwOi8vd3d3Lm1pY3Jvc29mdC5j
// SIG // b20vcGtpL2NlcnRzL01pY1Jvb0NlckF1dDIwMTFfMjAx
// SIG // MV8wM18yMi5jcnQwDQYJKoZIhvcNAQEMBQADggIBABSU
// SIG // HzgoT+6J5+nyyDCq0pTdVmCsAxYAHXcpjlDtxazPHewf
// SIG // 1v4kOg8V7A5+w+VuMDMGHi8rLXBKn5I8+DVEUYGs8jLu
// SIG // ckc0IeC6owOLUrU3CYdaKRMaO55+T7jwWJ27tPkx0rlR
// SIG // 03tFU0z1YYpcv6Yhaw6N2sUPT+AvjpecnrftoE33pCAk
// SIG // ucUvnGH0iL4J9CZLFQVTGFSOUBbv6oZy4bBBRFMxvH77
// SIG // 9IY4JDvpZKVfbcuhpDeL3Z3e8mukOmkfct+GojNapsWs
// SIG // QYujlJ8jZen5Lrp/3YkxZ2Ay06aTpK/5oOVknwog1TDQ
// SIG // sbY+MDyguTph5tQ0CLfzDaJG2x91BrBT9UG87C6HLkqi
// SIG // wrx9PSKN3wz05rHEfWO+RuKl+0U1/AHQT6NCOjhKI39/
// SIG // c7hWbdKjh5uuWFkBOvXGTNrnhNTAdOXTTYByvYExO8yr
// SIG // yv34PAdqo1vPDE/1heVebr2RramvRUi9kWswKwPqwz7n
// SIG // +iRmM+B6YDGRweEurM1kimAb9FYrAs38YHlPnarl1vW3
// SIG // dGrmJTgefAz3DmCnXN0nveIPsS+KXBIWweeCToAJMGE7
// SIG // v/XS3h9qQ6niWQAAVQ1kUAml3zuS4MisCgi2F6YoK2WA
// SIG // o1EgXK/lXvDxVjIVU0JdL+KvCfwFJkDeVuJ9dNXGNi+A
// SIG // Oxk0BtYd9hxwL30BElj9MYIZ4TCCGd0CAQEwbjBXMQsw
// SIG // CQYDVQQGEwJVUzEeMBwGA1UEChMVTWljcm9zb2Z0IENv
// SIG // cnBvcmF0aW9uMSgwJgYDVQQDEx9NaWNyb3NvZnQgQ29k
// SIG // ZSBTaWduaW5nIFBDQSAyMDI0AhMzAAAB/v6KSLXOxGDx
// SIG // AAAAAAH+MA0GCWCGSAFlAwQCAQUAoIGuMBkGCSqGSIb3
// SIG // DQEJAzEMBgorBgEEAYI3AgEEMBwGCisGAQQBgjcCAQsx
// SIG // DjAMBgorBgEEAYI3AgEVMC8GCSqGSIb3DQEJBDEiBCCj
// SIG // NYGTsNmzyNXqpNvfGcwqI30XfV4jKNZ4aniHbXlmgDBC
// SIG // BgorBgEEAYI3AgEMMTQwMqAUgBIATQBpAGMAcgBvAHMA
// SIG // bwBmAHShGoAYaHR0cDovL3d3dy5taWNyb3NvZnQuY29t
// SIG // MA0GCSqGSIb3DQEBAQUABIIBADp+MPgx4ZmqJxW7zX1Y
// SIG // IcmKP1L/sZWdU2Kh9Vtdo5BSTQ1PprsfCLYCV8hPYdp5
// SIG // GBjqJO8IOLQ2O1CLGOQZ2FX7XI74LMXqGjtBytOOCtLK
// SIG // egc6A2EwXNQNpcVBjCw0IDLOGXZ7veSxfNKboxSDH0lD
// SIG // +d9e7VBV3PIdBbkqjx5xZjdvXNTOPUInYQKIxZBx/A4m
// SIG // hKpBLtyEEdQzIReBPinSNXuSp5CYcwHAK86Lv75klOvS
// SIG // cqJoZrpx3EBFizxVFeWtsxvpNloYbhqAzdGEzSV/75YL
// SIG // +qBUOO5PP/cxi6xjyrRq8ch6gX6a3YnZyhiOv7GqUY7O
// SIG // V99gwgM97rQ+e/mhgheTMIIXjwYKKwYBBAGCNwMDATGC
// SIG // F38wghd7BgkqhkiG9w0BBwKgghdsMIIXaAIBAzEPMA0G
// SIG // CWCGSAFlAwQCAQUAMIIBUQYLKoZIhvcNAQkQAQSgggFA
// SIG // BIIBPDCCATgCAQEGCisGAQQBhFkKAwEwMTANBglghkgB
// SIG // ZQMEAgEFAAQgf4aLz83USM3djgqTPkyGF7N31SRZKIgl
// SIG // Wp9Yzw295qUCBmoXS8DK6xgSMjAyNjA1MjkwMDQyNDAu
// SIG // NDVaMASAAgH0oIHRpIHOMIHLMQswCQYDVQQGEwJVUzET
// SIG // MBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVk
// SIG // bW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBvcmF0
// SIG // aW9uMSUwIwYDVQQLExxNaWNyb3NvZnQgQW1lcmljYSBP
// SIG // cGVyYXRpb25zMScwJQYDVQQLEx5uU2hpZWxkIFRTUyBF
// SIG // U046OTIwMC0wNUUwLUQ5NDcxJTAjBgNVBAMTHE1pY3Jv
// SIG // c29mdCBUaW1lLVN0YW1wIFNlcnZpY2WgghHqMIIHIDCC
// SIG // BQigAwIBAgITMwAAAiNP2WAkU8/+KwABAAACIzANBgkq
// SIG // hkiG9w0BAQsFADB8MQswCQYDVQQGEwJVUzETMBEGA1UE
// SIG // CBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEe
// SIG // MBwGA1UEChMVTWljcm9zb2Z0IENvcnBvcmF0aW9uMSYw
// SIG // JAYDVQQDEx1NaWNyb3NvZnQgVGltZS1TdGFtcCBQQ0Eg
// SIG // MjAxMDAeFw0yNjAyMTkxOTM5NTdaFw0yNzA1MTcxOTM5
// SIG // NTdaMIHLMQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2Fz
// SIG // aGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UE
// SIG // ChMVTWljcm9zb2Z0IENvcnBvcmF0aW9uMSUwIwYDVQQL
// SIG // ExxNaWNyb3NvZnQgQW1lcmljYSBPcGVyYXRpb25zMScw
// SIG // JQYDVQQLEx5uU2hpZWxkIFRTUyBFU046OTIwMC0wNUUw
// SIG // LUQ5NDcxJTAjBgNVBAMTHE1pY3Jvc29mdCBUaW1lLVN0
// SIG // YW1wIFNlcnZpY2UwggIiMA0GCSqGSIb3DQEBAQUAA4IC
// SIG // DwAwggIKAoICAQCK6Q2nk5WUdKzSCSafp+UjUARsWxHK
// SIG // S63rJhFC/zSabFumTBuaJ0QNrmqevub5Db7fSj5qtwwK
// SIG // njIO92+HXF67192fujL7DFot5WEj/AtEZ/XrzFHimKlN
// SIG // 1h6gEQwP5I67wizaPW5ZzSBNpaLBg5oHvASPOZtwdNUo
// SIG // Z+DQKF3hJl1KZuoIlVK+qi7cLjgak6s5oOZcRCMrKnuC
// SIG // 3aoVa6wRDbYvKUuj7rkFx9KO0PsHJ/k+LnZMggRheh4A
// SIG // Vdawyh+oOzKPjlQGUNfSeWUgym2U9CLa8tt0mQX4DxDz
// SIG // 6+ram50gj1oAfyQ6TQ7r96PADFOKBgaU7+cpHnaZG89d
// SIG // TegQ6ydBRGIycOw1dRX2eKDRRzziK3cn0WaIm/7OeGsy
// SIG // QKjIzEQuUTDv0Jj/9zQ7truLOOpJD98BJVOK7je84Sz2
// SIG // hb3HvUST7j1j2N8peD6olkpFHR/1Z8Jz4F+mkrUF7MmP
// SIG // AirYHRzunbIg3HrDMNwFYN7yBkDA4/VMo9CY0y9oGUoq
// SIG // 2yjbCwTibz9VYl93nB3QQiTCT9nW3M+TOWB+PMrZpExq
// SIG // 1BSHmKPzIqehKqrUDoM33PK+dEKwpYLET6uXq4HuQRMX
// SIG // WT//sPubUnQAaaUMfQhAZSy23HtxwtN3eK9+T4wCav2w
// SIG // QFt57eUOwUW5/DCzMF9tua5He1hNvgcAXaiG1wIDAQAB
// SIG // o4IBSTCCAUUwHQYDVR0OBBYEFNbAh89v29nPY9bwQb1Q
// SIG // YCzxVgeXMB8GA1UdIwQYMBaAFJ+nFV0AXmJdg/Tl0mWn
// SIG // G1M1GelyMF8GA1UdHwRYMFYwVKBSoFCGTmh0dHA6Ly93
// SIG // d3cubWljcm9zb2Z0LmNvbS9wa2lvcHMvY3JsL01pY3Jv
// SIG // c29mdCUyMFRpbWUtU3RhbXAlMjBQQ0ElMjAyMDEwKDEp
// SIG // LmNybDBsBggrBgEFBQcBAQRgMF4wXAYIKwYBBQUHMAKG
// SIG // UGh0dHA6Ly93d3cubWljcm9zb2Z0LmNvbS9wa2lvcHMv
// SIG // Y2VydHMvTWljcm9zb2Z0JTIwVGltZS1TdGFtcCUyMFBD
// SIG // QSUyMDIwMTAoMSkuY3J0MAwGA1UdEwEB/wQCMAAwFgYD
// SIG // VR0lAQH/BAwwCgYIKwYBBQUHAwgwDgYDVR0PAQH/BAQD
// SIG // AgeAMA0GCSqGSIb3DQEBCwUAA4ICAQCHQwe7z5tp4NZw
// SIG // Af1cB+4c9J4svw3P6WqGBMxtqznS6DdzUzStXHCaPZhM
// SIG // 41g1iKHNnmcnLjwLujOEaNjhSnUDiAZqQjW5ZapOBxgc
// SIG // 7Egghh9k+r78qWAe3rJ4QohBbhSGdZtKivTRaeRqmnhy
// SIG // 8+ThrKhzCeEwaarXJimZwSpdQQUDbheWHeyAxASqultd
// SIG // 5KO0m/UFvO03tfepqGXA4tCg/WGECwKqOjJzpRAfPIB6
// SIG // y1HyVrk+vmL5rpEbTwwLOtX7WxFGG8+cYLk9HjaDkxra
// SIG // A/HYlKQRx1sdza+w/gulLwgOnByRJKF2rr8M7FNIlwoi
// SIG // 6ywFpaNc8A7HewaGjgw/tfcE260I1XekGluANI9HnONO
// SIG // YWlI7BKBQbWE2teo6vsQ1Vg8B8rTZSePVdmXL1PPqqs3
// SIG // KVdFKM5kYocPCDM+6VL32IV96sESf2T7DjxanpCg2D2U
// SIG // Yj4Z1i7cy8U1LLDGg55KWs4af2RRBjH2MulHgAmW5obK
// SIG // xiZCDQjRaroJ2XElXUhigE9BzvhCFbT/HDY2vpVpl5Hn
// SIG // SpcCSxmL5i5lIT/xbAQMI7Luh75Xrm+IslfFWOGOGMlC
// SIG // p+24qEJEglXEP7xwsolNdBNndXihhyIefVGlI1DR7xGE
// SIG // LiJrk8ifVWYo9XEbEXv/lbvp6F2R2UsnweWckvq0y1HW
// SIG // nLHDqH6dPjCCB3EwggVZoAMCAQICEzMAAAAVxedrngKb
// SIG // SZkAAAAAABUwDQYJKoZIhvcNAQELBQAwgYgxCzAJBgNV
// SIG // BAYTAlVTMRMwEQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYD
// SIG // VQQHEwdSZWRtb25kMR4wHAYDVQQKExVNaWNyb3NvZnQg
// SIG // Q29ycG9yYXRpb24xMjAwBgNVBAMTKU1pY3Jvc29mdCBS
// SIG // b290IENlcnRpZmljYXRlIEF1dGhvcml0eSAyMDEwMB4X
// SIG // DTIxMDkzMDE4MjIyNVoXDTMwMDkzMDE4MzIyNVowfDEL
// SIG // MAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24x
// SIG // EDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jv
// SIG // c29mdCBDb3Jwb3JhdGlvbjEmMCQGA1UEAxMdTWljcm9z
// SIG // b2Z0IFRpbWUtU3RhbXAgUENBIDIwMTAwggIiMA0GCSqG
// SIG // SIb3DQEBAQUAA4ICDwAwggIKAoICAQDk4aZM57RyIQt5
// SIG // osvXJHm9DtWC0/3unAcH0qlsTnXIyjVX9gF/bErg4r25
// SIG // PhdgM/9cT8dm95VTcVrifkpa/rg2Z4VGIwy1jRPPdzLA
// SIG // EBjoYH1qUoNEt6aORmsHFPPFdvWGUNzBRMhxXFExN6AK
// SIG // OG6N7dcP2CZTfDlhAnrEqv1yaa8dq6z2Nr41JmTamDu6
// SIG // GnszrYBbfowQHJ1S/rboYiXcag/PXfT+jlPP1uyFVk3v
// SIG // 3byNpOORj7I5LFGc6XBpDco2LXCOMcg1KL3jtIckw+DJ
// SIG // j361VI/c+gVVmG1oO5pGve2krnopN6zL64NF50ZuyjLV
// SIG // wIYwXE8s4mKyzbnijYjklqwBSru+cakXW2dg3viSkR4d
// SIG // Pf0gz3N9QZpGdc3EXzTdEonW/aUgfX782Z5F37ZyL9t9
// SIG // X4C626p+Nuw2TPYrbqgSUei/BQOj0XOmTTd0lBw0gg/w
// SIG // EPK3Rxjtp+iZfD9M269ewvPV2HM9Q07BMzlMjgK8Qmgu
// SIG // EOqEUUbi0b1qGFphAXPKZ6Je1yh2AuIzGHLXpyDwwvoS
// SIG // CtdjbwzJNmSLW6CmgyFdXzB0kZSU2LlQ+QuJYfM2BjUY
// SIG // hEfb3BvR/bLUHMVr9lxSUV0S2yW6r1AFemzFER1y7435
// SIG // UsSFF5PAPBXbGjfHCBUYP3irRbb1Hode2o+eFnJpxq57
// SIG // t7c+auIurQIDAQABo4IB3TCCAdkwEgYJKwYBBAGCNxUB
// SIG // BAUCAwEAATAjBgkrBgEEAYI3FQIEFgQUKqdS/mTEmr6C
// SIG // kTxGNSnPEP8vBO4wHQYDVR0OBBYEFJ+nFV0AXmJdg/Tl
// SIG // 0mWnG1M1GelyMFwGA1UdIARVMFMwUQYMKwYBBAGCN0yD
// SIG // fQEBMEEwPwYIKwYBBQUHAgEWM2h0dHA6Ly93d3cubWlj
// SIG // cm9zb2Z0LmNvbS9wa2lvcHMvRG9jcy9SZXBvc2l0b3J5
// SIG // Lmh0bTATBgNVHSUEDDAKBggrBgEFBQcDCDAZBgkrBgEE
// SIG // AYI3FAIEDB4KAFMAdQBiAEMAQTALBgNVHQ8EBAMCAYYw
// SIG // DwYDVR0TAQH/BAUwAwEB/zAfBgNVHSMEGDAWgBTV9lbL
// SIG // j+iiXGJo0T2UkFvXzpoYxDBWBgNVHR8ETzBNMEugSaBH
// SIG // hkVodHRwOi8vY3JsLm1pY3Jvc29mdC5jb20vcGtpL2Ny
// SIG // bC9wcm9kdWN0cy9NaWNSb29DZXJBdXRfMjAxMC0wNi0y
// SIG // My5jcmwwWgYIKwYBBQUHAQEETjBMMEoGCCsGAQUFBzAC
// SIG // hj5odHRwOi8vd3d3Lm1pY3Jvc29mdC5jb20vcGtpL2Nl
// SIG // cnRzL01pY1Jvb0NlckF1dF8yMDEwLTA2LTIzLmNydDAN
// SIG // BgkqhkiG9w0BAQsFAAOCAgEAnVV9/Cqt4SwfZwExJFvh
// SIG // nnJL/Klv6lwUtj5OR2R4sQaTlz0xM7U518JxNj/aZGx8
// SIG // 0HU5bbsPMeTCj/ts0aGUGCLu6WZnOlNN3Zi6th542DYu
// SIG // nKmCVgADsAW+iehp4LoJ7nvfam++Kctu2D9IdQHZGN5t
// SIG // ggz1bSNU5HhTdSRXud2f8449xvNo32X2pFaq95W2KFUn
// SIG // 0CS9QKC/GbYSEhFdPSfgQJY4rPf5KYnDvBewVIVCs/wM
// SIG // nosZiefwC2qBwoEZQhlSdYo2wh3DYXMuLGt7bj8sCXgU
// SIG // 6ZGyqVvfSaN0DLzskYDSPeZKPmY7T7uG+jIa2Zb0j/aR
// SIG // AfbOxnT99kxybxCrdTDFNLB62FD+CljdQDzHVG2dY3RI
// SIG // LLFORy3BFARxv2T5JL5zbcqOCb2zAVdJVGTZc9d/HltE
// SIG // AY5aGZFrDZ+kKNxnGSgkujhLmm77IVRrakURR6nxt67I
// SIG // 6IleT53S0Ex2tVdUCbFpAUR+fKFhbHP+CrvsQWY9af3L
// SIG // wUFJfn6Tvsv4O+S3Fb+0zj6lMVGEvL8CwYKiexcdFYmN
// SIG // cP7ntdAoGokLjzbaukz5m/8K6TT4JDVnK+ANuOaMmdbh
// SIG // IurwJ0I9JZTmdHRbatGePu1+oDEzfbzL6Xu/OHBE0ZDx
// SIG // yKs6ijoIYn/ZcGNTTY3ugm2lBRDBcQZqELQdVTNYs6Fw
// SIG // ZvKhggNNMIICNQIBATCB+aGB0aSBzjCByzELMAkGA1UE
// SIG // BhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24xEDAOBgNV
// SIG // BAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBD
// SIG // b3Jwb3JhdGlvbjElMCMGA1UECxMcTWljcm9zb2Z0IEFt
// SIG // ZXJpY2EgT3BlcmF0aW9uczEnMCUGA1UECxMeblNoaWVs
// SIG // ZCBUU1MgRVNOOjkyMDAtMDVFMC1EOTQ3MSUwIwYDVQQD
// SIG // ExxNaWNyb3NvZnQgVGltZS1TdGFtcCBTZXJ2aWNloiMK
// SIG // AQEwBwYFKw4DAhoDFQA4RWFs+kTiZnoZiAj1BtYj8zCN
// SIG // aqCBgzCBgKR+MHwxCzAJBgNVBAYTAlVTMRMwEQYDVQQI
// SIG // EwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4w
// SIG // HAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xJjAk
// SIG // BgNVBAMTHU1pY3Jvc29mdCBUaW1lLVN0YW1wIFBDQSAy
// SIG // MDEwMA0GCSqGSIb3DQEBCwUAAgUA7cMbkDAiGA8yMDI2
// SIG // MDUyODE5NTI0OFoYDzIwMjYwNTI5MTk1MjQ4WjB0MDoG
// SIG // CisGAQQBhFkKBAExLDAqMAoCBQDtwxuQAgEAMAcCAQAC
// SIG // AgZWMAcCAQACAhJuMAoCBQDtxG0QAgEAMDYGCisGAQQB
// SIG // hFkKBAIxKDAmMAwGCisGAQQBhFkKAwKgCjAIAgEAAgMH
// SIG // oSChCjAIAgEAAgMBhqAwDQYJKoZIhvcNAQELBQADggEB
// SIG // AHUPE5evYwTF+tlYy99YfNWF3vQv30OFcrhZxRbxMVIC
// SIG // BtFWYbSxHEZcEprIYTcwoN/un64O84pAh1ebzpseadrf
// SIG // 8UyZg/Cqa7j56GPE77ixXZLKfy7uajhOV3dp6o8bHtDU
// SIG // zR2lKPL7dPGi8C02AuZqej/EmqtnPwfSpwO1NAmiPQwX
// SIG // x5KvJUHl3iDAw5wMUi88iGKHwGoRVJdoWQFZA7TVqlZR
// SIG // w0mXdezBrvR4T4YTxHr+lWrOXIWHxif7FcgksBISUF+6
// SIG // 9ud2c78VXZ3O5nu+DGB5bYcPiYTgXazZJiiFUGdqwi++
// SIG // pO3Bh9+s5rDzQTYovJooUenTiCPyhVpS8xgxggQNMIIE
// SIG // CQIBATCBkzB8MQswCQYDVQQGEwJVUzETMBEGA1UECBMK
// SIG // V2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwG
// SIG // A1UEChMVTWljcm9zb2Z0IENvcnBvcmF0aW9uMSYwJAYD
// SIG // VQQDEx1NaWNyb3NvZnQgVGltZS1TdGFtcCBQQ0EgMjAx
// SIG // MAITMwAAAiNP2WAkU8/+KwABAAACIzANBglghkgBZQME
// SIG // AgEFAKCCAUowGgYJKoZIhvcNAQkDMQ0GCyqGSIb3DQEJ
// SIG // EAEEMC8GCSqGSIb3DQEJBDEiBCCfHK15zbbunJ/nUA9A
// SIG // BYNDJ0kRTvUQOgniBOkyBrWiWDCB+gYLKoZIhvcNAQkQ
// SIG // Ai8xgeowgecwgeQwgb0EIJbwMywRbvcGiynjnwjAqcaD
// SIG // 47yYvebKZRAvtEAR5u6zMIGYMIGApH4wfDELMAkGA1UE
// SIG // BhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24xEDAOBgNV
// SIG // BAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBD
// SIG // b3Jwb3JhdGlvbjEmMCQGA1UEAxMdTWljcm9zb2Z0IFRp
// SIG // bWUtU3RhbXAgUENBIDIwMTACEzMAAAIjT9lgJFPP/isA
// SIG // AQAAAiMwIgQggGfo8usIX5IAG4lvDUgCzDiGU0iNqS/C
// SIG // e4dz2/Q0rTowDQYJKoZIhvcNAQELBQAEggIACMTWxfIM
// SIG // O9H32PtqkSqYHxCjw5N9WAc1M1fWNceAlGBJU/owiVb5
// SIG // 93s3qLEnOH027eOnjFbLPkQi7uaQyN7HMu92MOzqmcYW
// SIG // EQ4T6Ne2afsOd0GDi/IcIUh4A8O/DhYhW/N0zJDt0D2N
// SIG // GTdm7COq05ZKEVG6qbcUxXTjw5o5auujyYhW6FAAdUhZ
// SIG // 63oyszYRz/Nd9i0JR26kecYNKNHjlOtv/GLOBt2mzJ0l
// SIG // nYOyJ/ZGmknvz6FY9QLvf86Y4gLawJ0O0ILtdxO4wq7b
// SIG // rkd676HbrirJ523mEAs5/09g6hK4pDC9VQLMbLt7HbC7
// SIG // F3ZQ1RAqezomnqr69LemyrexNMUKnR9Ggf4DnytbKdx7
// SIG // IvLXkJfXrS9x6ZVZTkNTR9uHUdwrFM+wHUX8OPaUi7or
// SIG // iClXJf+cwUEXST164oMwuWezDrt50m9HgHflelIiGaRt
// SIG // kcAoUG5bCFgFe+AnBuab3OffpWd65h3vp44ZG6Zr5129
// SIG // 9ssvF3cyrr9tCe8vmjejVQcd8iftnbnBYF7uLTOGjkxc
// SIG // ROdldpDEM3qHsHyLtH+FPfhvy38o2LWdIySJVCm54NQw
// SIG // RxSXx7nU5cMirddIxHM3vCQ5ReKO+ZddjHQ0vitP1Bip
// SIG // MPMY5hQhRAx0DnkVntc0tUIFG3pKS8RJ3xKyFJFzne96
// SIG // t5aAxrxbVof5Mic=
// SIG // End signature block
