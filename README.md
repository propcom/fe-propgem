propgem v1.0
============

A jQuery Plugin with a restful back-end to provide easy implement of AJAX Galleries, Events and Menus

What this plugin does
---------------------

- Provides a simple way of implementing AJAX Galleries, Events and Menus
- Includes built in 'Viewers' for each of the aformentioned

Dependencies
------------

- fuel-propgem https://github.com/propcom/fuel-propgem (FuelPHP Module to support jQuery)
- fuel-dbprocs https://github.com/propcom/fuel-dbprocs (FuelPHP Package)
- fancybox (for the gallery) http://fancybox.net/

Features
--------

- Easy implementation (compared to coding from scratch)
- Stops people using that shitty code I wrote a long time ago


Usage 
-------------------------

- How you initialize propgrm depends on which 'GEM' you are using...

Gallery Viewer
--------------

<pre>
  $('div#wrapping-element').propgem('gallery');
</pre>

This will set a gallery with the default options and will include a gallery selector drop down.

- Or you can set some options and callbacks like so.

<pre>
  $('div#wrapping-element').propgem('gallery', {
    'default_id'      : 4926,                             
    'items_per_page'  : 25,                              
    'select_element'  : 'select',
    'wrappers'    : {
      'parent' : {
        'element' : 'ul',
        'classes' : ['twelve', 'columns']
      },
      'item'   : {
        'element' : 'li',
        'classes' : ['two', 'columns', 'thumb']
      }
    },
    'controls'    : {
      'enabled' : true,
      'classes' : ['btn', 'btn--standard']
    },
    'loading_element'  : '.loading-element-selector',
    items_load : function() {
      $(this).fancybox();
    }
  });
</pre>


Options
-----------------------

  - **default_id**      : *int*    | the default gallery id to show when the plugin initializes 
  - **items_per_page**  : *int*    | how many images to show per page 
  - **select_element**  : *string* | which selector to display, currently 'select' or 'nav'
  - **wrappers**
  - - - **parent**
  - - - - - **element** : *string* | the element type to wrap the gallery in e.g. 'ul'
  - - - - - **classes** : *array*  | an array of class names to add to the parent wrapper
  - - - **item**
  - - - - - **element** : *string* | the element type of each item e.g. 'li'
  - - - - - **classes** : *array*  | an array of class names to add to each item
  - **controls**
  - - - *enabled* : *bool*  | show or hide the gallery pagination controls
  - - - *classes* : *array* | an array of class names to add to the pagination controls
  - **loading_element** : *string* | the selector of the element to use a preloader element  
  
Callbacks
-----------------------
 
**items_load** : fires when a new page nas been navigated and all the images in the new page have successfully loaded
 
  - the *this* keyword is a reference to the images loaded (you can use this to re-init fancybox)
    

Events Viewer
--------------

<pre>
  $('div#wrapping-element').propgem('events');
</pre>

This will set events with the default options and will include a month nav.

- Or you can set some options and callbacks like so.

<pre>
  $('div#wrapping-element').propgem('events', {
    'select_element'  : 'nav',
    'wrappers'    : {
      'parent' : {
        'element' : 'section',
        'classes' : ['twelve', 'columns']
      },
      'item'   : {
        'element' : 'article',
        'classes' : ['six', 'columns', 'event']
      }
    },
    'loading_element'  : '.loading-element-selector'
  });
</pre>


Options
-----------------------

  - **select_element**  : *string* | which selector to display, currently 'select' or 'nav'
  - **wrappers**
  - - - **parent**
  - - - - - **element** : *string* | the element type to wrap the events in e.g. 'section'
  - - - - - **classes** : *array*  | an array of class names to add to the parent wrapper
  - - - **item**
  - - - - - **element** : *string* | the element type of each item e.g. 'article'
  - - - - - **classes** : *array*  | an array of class names to add to each event
  - **loading_element** : *string* | the selector of the element to use a preloader element  


Menu Viewer
--------------

<pre>
  $('div#wrapping-element').propgem('menu');
</pre>

This will set menus with the default options and will include a menu drop down selector.

- Or you can set some options and callbacks like so.

<pre>
  $('div#wrapping-element').propgem('menu', {
    'default_menu'  : 4013,
    'select_element' : 'select',
    'loading_element'  : '.loading-element-selector'
  });
</pre>


Options
-----------------------

  - **default_menu**    : *string* | the default menu to display when plugin initializes
  - **select_element**  : *string* | which selector to display, currently 'select' or 'nav'
  - **loading_element** : *string* | the selector of the element to use a preloader element  
  

All files contained within this repository are subject to the GNU GPL v3, please follow this link for a description:-
http://opensource.org/licenses/gpl-3.0
