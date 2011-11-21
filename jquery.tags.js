/*
	--------------------------------
	Tags
	--------------------------------
	+ https://github.com/stijnd/tags
	+ version 1.0
	+ Copyright 2011 Stijn Debacker
	+ Licensed under the MIT license
	
	+ Documentation: http://stijnd.be/jquery-tags/
*/
// remember to change every instance of "pluginName" to the name of your plugin!
(function($) {

    // here it goes!
    $.fn.tags = function(method) {

        // public methods
        // to keep the $.fn namespace uncluttered, collect all of the plugin's methods in an object literal and call
        // them by passing the string name of the method to the plugin
        //
        // public methods can be called as
        // element.pluginName('methodName', arg1, arg2, ... argn)
        // where "element" is the element the plugin is attached to, "pluginName" is the name of your plugin and
        // "methodName" is the name of a function available in the "methods" object below; arg1 ... argn are arguments
        // to be passed to the method
        //
        // or, from inside the plugin:
        // methods.methodName(arg1, arg2, ... argn)
        // where "methodName" is the name of a function available in the "methods" object below
        var methods = {

            // this the constructor method that gets called when the object is created
            init : function(options) {

                // the plugin's final properties are the merged default and user-provided properties (if any)
                // this has the advantage of not polluting the defaults, making them re-usable
                this.tags.settings = $.extend({}, this.tags.defaults, options);

                // iterate through all the DOM elements we are attaching the plugin to
                return this.each(function() {

                    var $element = $(this), // reference to the jQuery version of the current DOM element
                        element = this;     // reference to the actual DOM element    
                    
                    $element.val('');
                    methods.setup($element);
                });

            },

            // a public method. for demonstration purposes only - remove it!
            setup: function($element) {

            	//check if jqueryui is installed
            	if(typeof $element.autocomplete == 'function')
                {
                	//add element to show/store list
                	$element.$autocomplete = $('<input type="text" name="'+$element.attr('name')+'_tags'+'" id="'+$element.attr('id')+'_tags'+'" />');
                    $element.list_element = $('<div class="tag-list"><ul></ul></div>');
					$element.after($element.$autocomplete, $element.list_element);
					$('label[for='+$element.attr('id')+']').attr('for', $element.attr('id')+'_tags');
					$element.hide();

					//add the autocomplete
					if(typeof $element.tags.settings.data !== undefined)
					{
						var data_src = $element.tags.settings.data;
						var min_length = $element.tags.settings.min_length;
						$element.tag_items = [];

						$element.$autocomplete.autocomplete({
							source: data_src,
							min_length: min_length,
							select: function( event, ui ){
								var item_in_list_already = false;

								//check if items isn't added already
								$.each($element.tag_items, function(){
									if(this.label == ui.item.label && this.value == ui.item.value)
									{
										item_in_list_already = true;
									}
								});

								if(item_in_list_already == false)
								{
									//add to the array
									$element.tag_items.push(ui.item);

									//Add the element to the list
									//add item to dom
									methods.add_item_to_dom($element, ui.item.label);

									//add element to a csv in the original element
									//if($element.val().length > 0) { $element.val($element.val()+','+ui.item.value); }else{ $element.val(ui.item.value); }
									methods.refill_textbox($element);

									if($element.tags.settings.keep_tags == false)
									{

										//remove the item from the list of the autocomplete
										$element.$autocomplete.autocomplete('option').source.splice($element.$autocomplete.autocomplete('option').source.indexOf(ui.item.label), 1);								
									}


									if(typeof $element.tags.settings.tag_added == 'function')
									{
										$element.tags.settings.tag_added();
									}
								}

								//clear the textbox and focus!
								$element.$autocomplete.val('').focus();

								//this will prevent the autocomplete of filling the box!
								return false;
							}
						});

						//enable the addition of new tags
						$element.$autocomplete.unbind('keypress').keypress(function(event){
							var keycode = (event.keyCode ? event.keyCode : event.which);
							if(keycode == '13'){
								//set vars
								var item_in_list_already = false;
								//get the value
								var entered_value = $(this).val();

								//check if items isn't added already
								$.each($element.tag_items, function(){
									if(String(this.label.toLowerCase()) == entered_value.toLowerCase() || String(this.value.toLowerCase()) == entered_value.toLowerCase())
									{
										item_in_list_already = true;
									}
								});

								if(entered_value != '' && item_in_list_already == false)
								{
									//add item to dom
									methods.add_item_to_dom($element, entered_value);

									//add to the array
									$element.tag_items.push({value: entered_value, label: entered_value});

									//add element to a csv in the original element
									//if($element.val().length > 0) { $element.val($element.val()+','+entered_value); }else{ $element.val(entered_value); }
									methods.refill_textbox($element);

									//clear the textbox and focus!
									$element.$autocomplete.val('').focus();

									if(typeof $element.tags.settings.tag_added == 'function')
									{
										$element.tags.settings.tag_added();
									}

									if(typeof $element.tags.settings.new_tag_added == 'function')
									{
										$element.tags.settings.new_tag_added(entered_value);
									}
								}

								//just terugn false
								return false;
							}
						});
					}
					else if($element.tags.settings.debug === true)
					{
						$.error('There was no data-source added to the settings - read the documentation on how to fix this.');
					}
				}
				else
				{
					$.error("Jquery ui's autocomplete is not available.");
				}
            },

            remove_list_item: function($obj, $element)
            {					
            	//get index of the value
				var i = 0;
				var index = -1;
				$.each($element.tag_items, function(){
					if(this.value == $obj.attr('data-value'))
					{
						index = i;
					}

					i++;
				});
				
				//splice the array to remove the item
				$element.tag_items.splice(index, 1);

				//remove item from CSV in original box
				methods.refill_textbox($element);

				//add again to autocomplete
				$element.$autocomplete.autocomplete('option').source.push($obj.parent().children('.label').text());

				//user callback
				if(typeof $element.tags.settings.tag_removed == 'function')
				{
					$element.tags.settings.tag_removed($obj.attr('data-value'));
				}

				//remove tag element from list
				if($element.tags.settings.animation_out != '')
				{
					$obj.parent('li').hide( $element.tags.settings.animation_out, $element.tags.settings.animation_out_options, $element.tags.settings.animation_out_speed, function(){
						$(this).remove();
					});
				}
				else
				{
					$obj.parent('li').remove();
				}
				
            },

            refill_textbox: function($element)
            {
            	var values_string = '';
				$.each($element.tag_items, function(index, item){
					if(index == 0)
					{
						values_string += item.label;
					}
					else
					{
						values_string += ','+item.label;
					}
				});

				$element.val(values_string);
            },

            add_item_to_dom: function($element, tag)
            {
            	//creat the item
				var list_item = $('<li><a href="#" class="remove" data-value="'+tag+'" data-index="'+$element.tag_items.length+'">x</a><span class="label">'+tag+'</span></li>');
				//add click action for removal
				$('a', list_item).click(function(e){
					//prevent default action of link
					e.preventDefault();

					//call the method
					methods.remove_list_item($(this), $element)
				});

				//Add the element to the list
				if($element.tags.settings.animation_in != '')
				{
					list_item.hide();
					$('ul', $element.list_element).append(list_item);

					list_item.show( $element.tags.settings.animation_in, $element.tags.settings.animation_in_options, $element.tags.settings.animation_in_speed);
				}
				else
				{
					$('ul', $element.list_element).append(list_item);
				}
            }

        }

        // private methods
        // these methods can be called only from inside the plugin
        //
        // private methods can be called as
        // helpers.methodName(arg1, arg2, ... argn)
        // where "methodName" is the name of a function available in the "helpers" object below; arg1 ... argn are
        // arguments to be passed to the method
        var helpers = {

            // a private method. for demonstration purposes only - remove it!
            debug: function($data) {

                // code goes here
                if(console && $(this).tags.settings.debug === true)
                {
                	console.log($data);
                }
                else if($(this).tags.settings.debug === true)
                {
                	alert($data);
                }
            }

        }

        // if a method as the given argument exists
        if (methods[method]) {

            // call the respective method
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));

        // if an object is given as method OR nothing is given as argument
        } else if (typeof method === 'object' || !method) {

            // call the initialization method
            return methods.init.apply(this, arguments);

        // otherwise
        } else {

            // trigger an error
            $.error( 'Method "' +  method + '" does not exist in pluginName plugin!');

        }

    }

    // plugin's default options
    $.fn.tags.defaults = {
    	debug: false,
    	min_length: 2,
    	animation_in: '',
		animation_in_options: {},
		animation_in_speed: 0,
		animation_out: '',
		animation_out_options: {},
		animation_out_speed: 0,
    	keep_tags: false,
    	tag_added: null,
    	new_tag_added: null
    }

    // this will hold the merged default and user-provided options
    // you will have access to these options like:
    // this.tags.settings.propertyName from inside the plugin or
    // element.tags.settings.propertyName from outside the plugin, where "element" is the element the
    // plugin is attached to;
    $.fn.tags.settings = {}

})(jQuery);