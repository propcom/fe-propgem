/*
	propgem: developed by Anthony Armstrong
		updated by Nicholas Carter
		version: 1.1.0
		last modified: 2014-04-29
*/

(function($) {

	/**
 	* @object literal
	* @interface
 	* Defines publicly available methods
 	*/

	var public_methods = {
		'gallery' : {},
		'menu' : {},
		'events' : {}
	};

	/**
 	* @function
	* @jquery bootstrap
 	* The bootstrap for the plugin, matches a method to the given 'gem' via the 'public_methods' interface 
 	* and calls it. If an object is passed, it will intialize the given 'gem' on that object or throw an error.
 	*/

	$.fn.propgem = function(_gem) {

		// try and match a method against the given 'gem'
		if (public_methods[_gem][arguments[1]]) {

			// call the given method with any arguments that may have been passed in
			return public_methods[_gem][arguments[1]].apply(this, Array.prototype.slice.call(arguments, 1));

		// if an object has been passed in or no method...
		} else if (typeof arguments[1] === 'object' || !_gem) {

			// call the init method
			return bootstrap.init.call(this, arguments);

		} else {

			// throw an exception
			$.error('error: method ' + arguments[1] + ' does not exist on propgem/' + _gem);
		}

	};

	/**
 	* @static class
	* @internal bootstrap
 	* Object literal to instantiate the chosen 'gem'
 	*/

	var bootstrap = {

		init : function(args) {

			var type = args[0];
			var options = args[1];

			switch(type) {
				case 'gallery' :
					new GalleryViewer(this, options);
				break;
				case 'menu' :
					new MenuViewer(this, options);
				break;
				case 'events' :
					new EventViewer(this, options);
				break; 
			}
 
		}

	};

	/**
 	* @constructor
	* @dynamic class/object
 	* The constructor for the parent GemViewer object
 	*/

 	var GemViewer = function() {

 		// define properties
 		this.current_id;
 		this.default_id;
 		this.select_element;
 		this.loading_element;

 		// set known properties
 		this.page = 1;
 		this.item_offset = 0;
 		
 	};

 	GemViewer.prototype = {

 		next_page : function() {
			if ($('[id*=' + self.current_id + ']').not(':animated')) {
				this.page += 1;
				this.get_content();
			}
		},

		previous_page : function() {
			if ($('[id*=' + self.current_id + ']').not(':animated')) {
				this.page -= 1;
				this.get_content();
			}
		},

		build_selector : function(list_data) {

			var self = this;
			var selector = null;
			var first_val = null;
			
			if (self.select_element == 'select') {

				selector = $('<select />');
				
				for (var i in list_data) {
					selector.append('<option value="'+ list_data[i]._id +'">' + list_data[i]._name + '</option>');	
				}

				// bind change handler
				selector.bind('change', function(e) {
					self.page = 1;
		    		self.item_offset = 0;
		    		self.current_id = parseInt($(this).find(":selected").val());
		    		self.show_loader();
					self.get_content();
				});

				first_val = parseInt(selector.first().val());

				// give selected class to selected option
				if (self.default_id != null) {
					selector.val(self.default_id.toString());
				}


			}

			if (self.select_element == 'nav') {

				selector = $('<nav />');
				selector.addClass('galleries');
				var selected = null;
				
				for (var i in list_data) {
					selector.append('<a href="#' + list_data[i]._id + '" title="'+ list_data[i]._name +'">' + list_data[i]._name + '</a>');
					if (parseInt(list_data[i]._id) == self.default_id) {
						selected = i;
					}
				}

				// bind click handler
				selector.find('a').bind('click', function(e) {
					self.page = 1;
		    		self.item_offset = 0;
		    		self.current_id = parseInt($(this).attr('href').split('#')[1]);
		    		selector.find('a').removeClass('selected');
		    		$(this).addClass('selected');
		    		self.show_loader();
					self.get_content();
				});

				first_val = parseInt(selector.find('a:first-child').attr('href').split('#')[1]);

				// give selected class to selected a
				$(selector.find('a').get(selected)).addClass('selected');

			}

			// append to hook
			this.hook.append(selector);
			self.current_id = self.default_id != null ? self.default_id : first_val;
			self.get_content();

		},

		build_controls : function() {

			var self = this;

			// remove existing controls
			$('.gem-ctrl').remove();

			var next = $('<a href="#">Next</a>');

			next.attr({
				'id' : self.current_id + '-next',
				'title' : 'Next Page'
			});

			next.addClass('gem-ctrl');
			next.addClass('gem-ctrl--next');

			var prev = $('<a href="#">Prev</a>');

			prev.attr({
				'id' : self.current_id + '-prev',
				'title' : 'Previous Page'
			});

			prev.addClass('gem-ctrl');
			prev.addClass('gem-ctrl--prev');

			// add custom classes
			if (this.controls.classes != null && this.controls.classes.length > 0) {
				for (var x = 0; x < this.controls.classes.length; x++) {
					prev.addClass(this.controls.classes[x]);
					next.addClass(this.controls.classes[x]);
				} 
			}

			if (self.page != self.total_pages) {
				self.hook.append(prev);
				self.hook.append(next);
			}

			if (self.page == 1) {
				prev.remove();
			}

			if (self.page == self.total_pages - 1) {
				next.remove();
			}

			// event handlers
			next.bind('click', function(e) {
				e.preventDefault();

				// fade out images
				$('[id*=' + self.current_id + ']').fadeTo(300, 0, function() {

					// show loading div
					self.show_loader();

					if ($('[id*=' + self.current_id + ']').not(':animated')) {
						self.page += 1;
						self.get_content();
					}
				});

				
			});

			prev.bind('click', function(e) {
				e.preventDefault();

				// fade out images
				$('[id*=' + self.current_id + ']').fadeTo(300, 0, function() {

					// show loading div
					self.show_loader();

					if ($('[id*=' + self.current_id + ']').not(':animated')) {
						self.page -= 1;
						self.get_content();
					}
				});

				
			});

		},

		show_loader : function() {

			if (this.loading_element != null) {
				$(this.loading_element).fadeIn(300);
			}
		},

		hide_loader : function() {

			if (this.loading_element != null) {
				$(this.loading_element).fadeOut(300);
			}
		},

		// child objects must implement these functions...
		get_list : function() {},
		get_content : function() {}

 	};

 	/**
 	* @constructor
	* @dynamic class/object
 	* The constructor for the GalleryViewer object which extends GemViewer
 	*/

	var GalleryViewer = function($hook, options) {

		// private properties
		this.show_select = false;
		
		// combine user options with defaults
		this.settings = $.extend(true, {}, { 
	    	'default_id' : null,
	    	'items_per_page' : 25,
	    	'select_element' : 'select',
	    	'wrappers' : {
	    		'parent' : {
	    			'element' : 'ul',
	    			'classes' : []
	    		},
	    		'item' : {
	    			'element' : 'li',
	    			'classes' : []
	    		}
	    	},
	    	'controls' : {
	    		'enabled' : true,
	    		'classes' : null
	    	},
	    	'loading_element' : false,
	    	items_load : function(event){}
	    }, options, {'hook' : $hook});  

	    // attach settings to object
	    for (var key in this.settings) {
	    	this[key] = this.settings[key];
	    }

	    // add private properties
	    this.order = 'desc';
	   
	    // cleanup object
	    delete this.settings;

	    // init
	    this.init();

	};

	// set parent object
	GalleryViewer.prototype = new GemViewer();

	// specific fucntions to gallery viewer
	GalleryViewer.prototype.init = function() {

		// attach desired functions to public_methods object literal
		public_methods.gallery.next_page = this.next_page;
		public_methods.gallery.previous_page = this.previous_page;

		// request gallery data to build select box
		this.get_list();

	};

	GalleryViewer.prototype.get_list = function() {

		var self = this;

		// obtain gallery list
		$.ajax({
			url: 'propgem/gallery/list.json',
		  	dataType: 'json',
		  	async: true,
		  	success : function(data, status) {
		  		self.list = data.galleries;
		  		if (self.list.length > 0) {

		  			// change property names for consistancy in parent object
		  			for (var list_item in self.list) {
				    	self.list[list_item]._id   = self.list[list_item].cat_id;
				    	self.list[list_item]._name = self.list[list_item].cat_name;
				    	delete self.list[list_item].cat_id;
				    	delete self.list[list_item].cat_name;
				    }

					self.build_selector(self.list);
				}
		  	},
		  	error : function(jq_xhr, status, error) {
		  		$.error('error: something went wrong trying to obtain the gallery list' + error);
		  	}
		});
	};

	GalleryViewer.prototype.get_content = function() {

		var self = this;

		// get new offset
		self.item_offset = this.items_per_page * this.page;

		var params = {
			'id' : self.current_id,
			'offset' : self.item_offset,
			'count' : self.items_per_page,
			'desc' : false
		};

		// pull out max images for the correct gallery
  		var image_count = 0;
  		for (var i in self.list) {
  			if (parseInt(self.list[i]._id) == self.current_id) {
  				image_count = self.list[i].cat_image_count;
			}	
  		}

  		// get total pages
  		self.total_pages = Math.ceil(image_count / self.items_per_page);
  		if (self.controls.enabled) {
  			self.build_controls(self.current_id);
  		}

		// make request for images
		$.ajax({
			url: 'propgem/gallery/images.json?',
			data: params,
		  	dataType: 'json',
		  	async: true,
		  	beforeSend : function() {
		  		//console.log('before');


		  	},
		  	success : function(data, status) {
		  		//console.log('response');
		  		if (data.error) {
		  			// clear previous...
					$(self.wrappers.parent.element + '.gem-gallery').remove();
					$('p.error').remove();
					self.hook.append('<p class="error">' + data.error + '</p>');
					self.hide_loader();
		  		} else {
		  			self.build_gallery_images(data.paths, self.current_id);
		  		}
		  	},
		  	error : function(jq_xhr, status, error) {
		  		self.hide_loader();
		  		$.error('error: something went wrong trying to obtain the gallery images' + error);
		  	},
		  	complete: function() {
		  		//console.log('complete');
		  		// wait for images to load
		  		var image_count = $('#gem-gallery-' + self.current_id + ' img').size();
		  		var index = 0;
		  		$('#gem-gallery-' + self.current_id + ' img').load(function() {
		  			index++;
		  			if (index == image_count) {
			  			self.hide_loader();
		  				$('#gem-gallery-' + self.current_id).fadeTo(300, 1);
		  				self.items_load.call($('a[rel="' + self.current_id + '"]'));
		  			}
	  			});
		  	}
		});

	};

	GalleryViewer.prototype.build_gallery_images = function(arr_paths) {

		// clear previous...
		$(this.wrappers.parent.element + '.gem-gallery').remove();
		$('p.error').remove();

		// build wrapper and add desired classes
		var wrapper = $('<' + this.wrappers.parent.element + ' />');
		wrapper.attr('id', 'gem-gallery-' + this.current_id);
		wrapper.addClass('gem-gallery');
		wrapper.css('display', 'none');

		if (this.wrappers.parent.classes.length > 0) {
			for (var i = 0; i < this.wrappers.parent.classes.length; i++) {
				wrapper.addClass(this.wrappers.parent.classes[i]);
			} 
		}

		// for each image
		for (var i in arr_paths) {

			// build wrapper and add desired classes
			var item_wrap = null;
			if (this.wrappers.item.element != null) {
				item_wrap = $('<' + this.wrappers.item.element + '/>');
				if (this.wrappers.item.classes.length > 0) {
					for (var x = 0; x < this.wrappers.item.classes.length; x++) {
						item_wrap.addClass(this.wrappers.item.classes[x]);
					} 
				}
			}

			// always will be an anchor with an image inside
			var anchor = $('<a href="' + arr_paths[i].large + '" title=""></a>');
			anchor.attr('rel', this.current_id);
			anchor.append('<img src="' + arr_paths[i].small + '" alt="" />');

			if (item_wrap != null) {
				item_wrap.append(anchor);
				wrapper.append(item_wrap);
			} else {
				wrapper.append(anchor);
			}

		}

		this.hook.append(wrapper);
	};

	/**
 	* @constructor
	* @dynamic class/object
 	* The constructor for the MenuViewer object which extends GemViewer
 	*/

	var MenuViewer = function($hook, options) {

		// combine user options with defaults
		this.settings = $.extend(true, {}, { 
	    	'default_menu' : null,
		 	'select_element' : 'select',
		 	'layout' : 'tables',
		 	'wrappers' : {
		 		'parent' : {
		 			'classes' : [],
		 			'element' : 'div'
		 		},
		 		'category' : {
		 			'classes' : [],
		 			'element' : 'div'
		 		},
		 		'item' : {
		 			'classes' : [],
		 			'element' : 'div'
		 		}
		 	},
		 	'loading_element' : false,
	    }, options, {'hook' : $hook});  

	    // attach settings to object
	    for (var key in this.settings) {
	    	this[key] = this.settings[key];
	    }

	    // cleanup object
	    delete this.settings;

	    // init
	    this.init();

	};

	// set parent object
	MenuViewer.prototype = new GemViewer();

	// specific menu functions
	MenuViewer.prototype.init = function() {

		// attach desired functions to public_methods object literal
		public_methods.menu.next_cat = this.next_cat;
		public_methods.menu.prev_cat = this.prev_cat;

		// get handle
		var self = this;

		// fetch list
		self.get_list();

	};

	MenuViewer.prototype.get_list = function() {

		// get handle
		var self = this;

		// request data on available menus
		$.ajax({
		 	url: '/propgem/menu/list.json',
		 	dataType: 'json',
		 	async: true,
		 	success : function(data, status) {
		  		self.list = data.menus;
		  		if (self.list.length > 0) {

		  			// change property names for consistancy in parent object
		  			for (var list_item in self.list) {
				    	self.list[list_item]._id   = self.list[list_item].menu_id;
				    	self.list[list_item]._name = self.list[list_item].menu_name;
				    	delete self.list[list_item].menu_id;
				    	delete self.list[list_item].menu_name;
				    }

					self.build_selector(self.list);
				}
		  	},
		  	error : function(jq_xhr, status, error) {
		  		$.error('error: something went wrong trying to obtain the menu list' + error);
		  	}
		});


	};

	MenuViewer.prototype.get_content = function() {

		var self = this;

		var params = {
			'id' : self.current_id
		};

		// make request for images
		$.ajax({
			url: 'propgem/menu/content.json?',
			data: params,
		  	dataType: 'json',
		  	async: true,
		  	success : function(data, status) {
		  		
		  		if (data.error) {
		  			// clear previous...
					$(self.wrappers.category.element + '.gem-menu').remove();
					$('p.error').remove();
					self.hook.append('<p class="error">' + data.error + '</p>');
					self.hide_loader();
		  		} else {
		  			
		  			self.build_menu_subcats(data);
		  			
		  		}
		  	},
		  	error : function(jq_xhr, status, error) {
		  		self.hide_loader();
		  		$.error('error: something went wrong trying to obtain the menu data' + error);
		  	},
		  	complete: function() {
	  			self.hide_loader();
  				$('#gem-menu-' + self.current_id).fadeTo(300, 1);	
		  	}
		});

	};

	MenuViewer.prototype.build_menu_subcats = function(data) {

		// clear previous...
		$(this.wrappers.parent.element + '.gem-menu').remove();
		$('p.error').remove();

		// build wrapper and add desired classes
		var $wrapper = $('<' + this.wrappers.parent.element + ' />');
		$wrapper.attr('id', 'gem-menu-' + this.current_id);
		$wrapper.addClass('gem-menu');
		$wrapper.css('display', 'none');

		if (this.wrappers.parent.classes.length > 0) {
			for (var i = 0; i < this.wrappers.parent.classes.length; i++) {
				wrapper.addClass(this.wrappers.parent.classes[i]);
			} 
		}

		// if using tables
		if (this.layout == 'tables') {

			// for each subcategory
			for (var subcategory in data.menu.menu_categories) {

				// set up table
				var $table = $('<table />');
				$table.attr({
					'cellspacing' : 0,
					'cellpadding' : 0,
				});

				$table.addClass('menu-subcategory ' + subcategory.toString().replace(/\s/g, '-'));
				var $tbody = $('<tbody />');
				$tbody.appendTo($table);

				// setup cat header
				var $header_wrap = $('<tr />');
				$header_wrap.html('<th> ' + subcategory + '</th>');
				$header_wrap.appendTo($tbody);

				// for each item in subcategory
				for (var item in data.menu.menu_categories[subcategory]) {
					var row_data = data.menu.menu_categories[subcategory][item];
					
					// 1st row has headers
					var $row_wrap = $('<tr />');

					// for each col in row...
					for (var col in row_data) {
						var $col_wrap = $('<td />');
						$col_wrap.addClass(col);
						$col_wrap.html(row_data[col]);
						$col_wrap.appendTo($row_wrap);
					}

					$row_wrap.appendTo($tbody);
				}

				$table.appendTo($wrapper);

			}

		}

		this.hook.append($wrapper);
	};

	/**
 	* @constructor
	* @dynamic class/object
 	* The constructor for the EventViewer object which extends GemViewer
 	*/

	var EventViewer = function($hook, options) {

		// date object
		var d = new Date();
		var now = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getFullYear();
	
		// combine user options with defaults
		this.settings = $.extend(true, {}, { 
	    	'default_date' : now,
		 	'select_element' : 'nav',
		 	'wrappers' : {
		 		'parent' : {
		 			'classes' : [],
		 			'element' : 'section'
		 		},
		 		'item' : {
		 			'classes' : [],
		 			'element' : 'article'
		 		}
		 	},
		 	'loading_element' : false,
		 	'date' : 'all'
	    }, options, {'hook' : $hook});  

	    // attach settings to object
	    for (var key in this.settings) {
	    	this[key] = this.settings[key];
	    }

	    // cleanup object
	    delete this.settings;

	    // init
	    this.init();

	};

	// set parent object
	EventViewer.prototype = new GemViewer();

	// specific event functions
	EventViewer.prototype.init = function() {

		// attach desired functions to public_methods object literal
		public_methods.events.next_page = this.next_page;
		public_methods.events.previous_page = this.previous_page;

		// request gallery data to build select box
		this.get_list();

	};


	EventViewer.prototype.get_list = function() {

		// get handle
		var self = this;

		// data to send
		var data = {

		};

		// request data on available menus
		$.ajax({
		 	url: '/propgem/event/months.json',
		 	dataType: 'json',
		 	async: true,
		 	success : function(data, status) {
		  		self.list = data.months;
		  		if (self.list.length > 0) {

		  			// change property names for consistancy in parent object
		  			for (var list_item in self.list) {
				    	self.list[list_item]._id   = self.list[list_item].month_id;
				    	self.list[list_item]._name = self.list[list_item].month_name;
				    	delete self.list[list_item].month_id;
				    	delete self.list[list_item].month_name;
				    }

					self.build_selector(self.list);
				}
		  	},
		  	error : function(jq_xhr, status, error) {
		  		$.error('error: something went wrong trying to obtain the event month list' + error);
		  	}
		});

	};

	EventViewer.prototype.get_content = function() {

		var self = this;

		var params = {
			'm' : self.current_id
		};

		// make request for images
		$.ajax({
			url: 'propgem/event/month.json?',
			data: params,
		  	dataType: 'json',
		  	async: true,
		  	success : function(data, status) {
		  		
		  		if (data.error) {
		  			// clear previous...
					$(self.wrappers.parent.element + '.gem-event').remove();
					$('p.error').remove();
					self.hook.append('<p class="error">' + data.error + '</p>');
					self.hide_loader();
		  		} else {
		  			self.build_events(data);
		  		}
		  	},
		  	error : function(jq_xhr, status, error) {
		  		self.hide_loader();
		  		$.error('error: something went wrong trying to obtain the events data' + error);
		  	},
		  	complete: function() {
	  			self.hide_loader();
  				$('#gem-event-' + self.current_id).fadeTo(300, , function(){
  					$(".main-content").tinyscrollbar_update();
  				});	
		  	}
		});

	};

	EventViewer.prototype.build_events = function(data) {

		// clear previous...
		$(this.wrappers.parent.element + '.gem-event').remove();
		$('p.error').remove();

		// build wrapper and add desired classes
		var $wrapper = $('<' + this.wrappers.parent.element + ' />');
		$wrapper.attr('id', 'gem-event-' + this.current_id);
		$wrapper.addClass('gem-event');
		$wrapper.css('display', 'none');

		if (this.wrappers.parent.classes.length > 0) {
			for (var i = 0; i < this.wrappers.parent.classes.length; i++) {
				$wrapper.addClass(this.wrappers.parent.classes[i]);
			} 
		}

		// for each event item
		for (var event_date in data.events) {

			var events_in_date = data.events[event_date];

			for (var i in events_in_date) {

				var event_data = events_in_date[i];

				if (event_data.event_live == 'yes') {

					// build wrapper and add desired classes
					var $item_wrap = null;
					if (this.wrappers.item.element != null) {
						$item_wrap = $('<' + this.wrappers.item.element + '/>');
						$item_wrap.attr('id', 'event-' + event_data.event_id);
						$item_wrap.addClass('event');
						if (this.wrappers.item.classes.length > 0) {
							for (var x = 0; x < this.wrappers.item.classes.length; x++) {
								$item_wrap.addClass(this.wrappers.item.classes[x]);
							} 
						}
					}

					if (this.date === 'upcoming') {
						var currentDate = new Date();
						var day = currentDate.getDate();
						var month = currentDate.getMonth() + 1;

						if (event_data.event_month == month) {
							if (event_data.event_day < day) {

							} else {
								// build up event body
								$event_title = $('<h1 class="title">' + event_data.event_name + '</h1>');
								$event_date = $('<small class="date">' + event_data.event_day + '/' + event_data.event_month + '/' + event_data.event_year + '</small>');
								$event_desc = $('<p class="description">' + event_data.event_desc + '</p>');
								$event_flyer = null;

								if (event_data.event_flyer != null) {
									if (event_data.event_flyer.length > 0) {
										$event_flyer = $('<img />');
									}
								}

								$item_wrap.append($event_title, $event_date, $event_desc);

								if ($event_flyer != null) {
									$event_flyer.attr({
										'src': 'http://crmx.propeller.me.uk/event_flyers/' + event_data.event_flyer,
										'alt': event_data.event_name,
										'class': 'flyer'
									});

									$item_wrap.append($event_flyer);
								}

								$wrapper.append($item_wrap);

							}
						} else if (event_data.event_month > month) {
							// build up event body
							$event_title = $('<h1 class="title">' + event_data.event_name + '</h1>');
							$event_date = $('<small class="date">' + event_data.event_day + '/' + event_data.event_month + '/' + event_data.event_year + '</small>');
							$event_desc = $('<p class="description">' + event_data.event_desc + '</p>');
							$event_flyer = null;
							if (event_data.event_flyer != null) {
								if (event_data.event_flyer.length > 0) {
									$event_flyer = $('<img />');
								}
							}
						}
					}
								


					$item_wrap.append($event_title, $event_date, $event_desc);

					if ($event_flyer != null) {
						$event_flyer.attr({
							'src' : 'http://crmx.propeller.me.uk/event_flyers/' + event_data.event_flyer,
							'alt' : event_data.event_name,
							'class' : 'flyer'
						});
						$item_wrap.append($event_flyer);
					}
					$wrapper.append($item_wrap);
				}
			}
		}
		this.hook.append($wrapper);
	};
})(jQuery);