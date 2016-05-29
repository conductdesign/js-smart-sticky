/**
 * A Vanilla JS HTML5 Fixed Sidebar 
 * Version: 1.0
 * 
 * Author: Chris Freeman <
 * Author URL: http://www.conductdesign.com
 *
 * Description:
 * A pure JS plugin to offset a sidebar element using fixed and relative positioning with top/bottom offsets, i.e. keeps the sidebar in view. 
 * The code is an adaptation of a similar module included in WordPress's 'Twenty Fifteen' theme by Takashi Irie and a host of contributors.
 *
 * License:
 * License URL: 
 *
 * Options: 
 * sidebarID  : The ID of the element to be positioned. Must be, obviously, a unique ID. (Default: false – uses first <aside> in DOM) 
 * breakpoint : Set breakpoint (px) for responsive mobile layout. Plugin functionality is disabled for window widths below this value. (Default: false)
 * adminbarID : The ID of an admin- or controlbar element, e.g. 'wpadminbar' for the WordPress crowd. (Default: false)

 */
 

(function() {
	
	this.Sticker = function () {
		
		// Define option defaults
    var defaults = {
      	sidebarID 	: false,
      	breakpoint	: false,	
				adminbarID	: false
    }
		
		// Create options by extending defaults with the passed in arugments
    if (arguments[0] && typeof arguments[0] === "object") {
      this.options = extendDefaults(defaults, arguments[0]);
    }
		console.log(this.options);
		// some global properties for the getBoundingClientRect function below
		this.window = window;
		this.body = document.body;
		this.docElem = document.documentElement;
		this.clientTop = this.docElem.clientTop || this.body.clientTop || 0;

		this.el = document.getElementById(this.options.sidebarID) || document.getElementsByTagName('aside')[0];
		if (this.el === null) {return};
		
		this.parent = this.el.offsetParent;
		
		// check for adminbar element
		if (this.options.adminbarID) { 
			this.adminbar = document.getElementById(this.options.adminbarID);

			if ( ! this.adminbar ) { 
				console.log('Cannot find element with ID "' + this.options.adminbarID + '". Remember to remove leading hash symbol.');
			}
		}
		
		// set global flag for the scroll handler
		this.lastWindowPos = pageYOffset || (this.docElem.clientHeight ? this.docElem.scrollTop : this.body.scrollTop); // accounts for page reloads
		this.top = false;
		this.bottom = false;
		this.fixed = false;
		
		// only add listeners if the sliding element has room to slide.
		if ( getRect.call(this, this.parent).height > getRect.call(this, this.el).height ) { bindEvents.call(this) };
		
		// fire the resize handler to get/set more initial values.
		resizeHandler.call(this);
		
	}
	
	// Public Methods
	
	
	// Private Methods
	
	function bindEvents () {
		window.addEventListener("resize", resizeHandler.bind(this));
		window.addEventListener("scroll", scrollHandler.bind(this));
	}
	
	
	function resizeHandler () {

		// get window height and width. Used to determine bottom of screen and responsive breakpoint
		this.windowHeight = this.window.innerHeight || this.docElem.offsetHeight || this.body.offsetHeight;
		this.windowWidth  = this.window.innerWidth || this.docElem.offsetWidth || this.body.offsetWidth;            
		
		// check the admin bar height with each resize.
		this.adminbarOffset = (this.adminbar) ? getRect.call(this, this.adminbar).height : 0;
		console.log(this.adminbarOffset);
		// reset element CSS and top/bottom flags
		this.el.style.cssText = '';
		this.top = this.bottom = this.fixed = false;
		
		// Get element width AFTER resetting css in order to get accurate width
		this.elWidth = getRect.call(this, this.el).width;
		
		// If window is narrower than breakpoint, remove scrollhandler. 
		// Assumes sidebar content will be positioned under main content in smaller windows.
		if ( this.options.breakpoint && this.windowWidth < this.options.breakpoint) {
			window.removeEventListener("scroll", scrollHandler);
		} else {
			
			// run the scrollhandler once to adjust element after resize
			scrollHandler.call(this);
		}
	}
	
	
	function scrollHandler () {
		
		console.log('top:'+this.top);
		console.log('bottom:'+this.bottom);
		console.log('fixed:'+this.fixed);
				
		// check sliding element (e.g. sidebar) position.
		var elBounds  = getRect.call(this, this.el);
		this.elTop 	  = elBounds.top;
		this.elBottom = elBounds.bottom;
		this.elHeight = elBounds.height;
		
		// Re-evaluate track variables 
		// (incase of expanded dropdowns or slow-loading (ajax) DOM elements)
		var trackBounds	 = getRect.call(this, this.parent);
		this.trackTop 	 = trackBounds.top;
		this.trackBottom = trackBounds.bottom;
		this.trackHeight = trackBounds.height;
		
		
		// Get window position
		var windowPos = pageYOffset || (this.docElem.clientHeight ? this.docElem.scrollTop : this.body.scrollTop);
		var windowBottom = windowPos + this.windowHeight;
		
		if (this.elHeight > this.windowHeight) {
			
			if (windowPos > this.lastWindowPos) { // scrolling down
				
				if (this.top ) {
					this.top = false;
					topOffset = ( this.elTop > 0 ) ? this.elTop - this.trackTop - this.adminbarOffset : 0;
					this.el.style.cssText = 'top:' + topOffset + 'px';
				
				} else if ( ! this.bottom && windowBottom > this.elBottom  && this.elHeight < this.trackHeight ) { 
					this.bottom = true;
					this.el.style.cssText = 'position:fixed; bottom:0; width:' + this.elWidth + 'px';
				
				} else if (this.bottom && windowBottom >= this.trackBottom + this.adminbarOffset) {
					this.el.style.cssText = 'top:' + (this.trackBottom - this.elHeight - this.trackTop) + 'px';
				}
			   
			} else if (windowPos < this.lastWindowPos) { // scrolling up
			
				if ( this.bottom ) {
					this.bottom = false;
					topOffset = ( this.elTop > 0 ) ? this.elTop - this.trackTop - this.adminbarOffset : 0;
					this.el.style.cssText = 'top:' + topOffset + 'px';
				
				} else if ( ! this.top && windowPos + this.adminbarOffset < this.elTop && windowPos > this.trackTop) {
					this.top = true;
					this.el.style.cssText = 'position:fixed; top:' + this.adminbarOffset + 'px; width:' + this.elWidth + 'px';
				
				} else if (this.top && windowPos <= this.trackTop) {
					this.el.style.cssText = '';
				}
				
			} else { // no scroll, but probably a resize
				this.top = this.bottom = false;
				
				if (windowPos + this.elHeight < this.trackBottom && windowPos > this.trackTop) {
					this.top = true;
					this.el.style.cssText = 'position:fixed; top:' + this.adminbarOffset + 'px; width:' + this.elWidth + 'px';
				
				} else if (windowBottom >= this.trackBottom) {
					this.bottom = true;
					this.el.style.cssText = 'top:' + (this.trackBottom - this.elHeight - this.trackTop) + 'px';
				
				} else {
					this.top = true;
					this.el.style.cssText = '';
					console.log("test");
				}
				
			}		
			
		} else if ( ! this.top ) { // cases where the sidebar is smaller than the window
			
			if (windowPos > this.lastWindowPos) { // scrolling down
				
				if (!this.fixed && windowPos + this.adminbarOffset > this.elTop && this.elBottom < this.trackBottom) {
					this.fixed = true;
					this.el.style.cssText = 'position:fixed; top:' + this.adminbarOffset + 'px; width:' + this.elWidth + 'px';

				} else if (this.fixed && this.elBottom - this.adminbarOffset >= this.trackBottom) {
					this.fixed = false;
					this.el.style.cssText = 'top:' + (this.trackBottom - this.elHeight - this.trackTop) + 'px';
				} 	
				
			} else if (windowPos < this.lastWindowPos) { // scrolling up
				
				if (this.fixed && windowPos <= this.trackTop) {
					this.fixed = false;
					this.el.style.cssText = '';

				} else if (!this.fixed && windowPos < this.elTop - this.adminbarOffset && windowPos > this.trackTop) {
					this.fixed = true;
					this.el.style.cssText = 'position:fixed; top:' + this.adminbarOffset + 'px; width:' + this.elWidth + 'px';
				}
				
			} else { // no scroll, but probably a resize
				this.fixed = false;
				if (windowPos + this.elHeight + this.adminbarOffset < this.trackBottom && windowPos > this.trackTop) {
					this.fixed = true;
					this.el.style.cssText = 'position:fixed; top:0; width:' + this.elWidth + 'px';
				
				} else if (windowBottom >=this.trackBottom) {
					this.el.style.cssText = 'top:' + (this.trackBottom - this.elHeight - this.trackTop) + 'px';
				
				} else {
					this.el.style.cssText = '';
				}
			}
		}
		
		this.lastWindowPos = windowPos;
	}
	
	
	function getRect (elem) {
		var rect, 
				top, 
				bottom, 
				width,
				height,
				scrollTop = window.pageYOffset || this.docElem.scrollTop || this.body.scrollTop,
				scrollLeft = window.pageXOffset || this.docElem.scrollLeft || this.body.scrollLeft;
				
		if (elem.getBoundingClientRect) { // Internet Explorer, Firefox 3+, Google Chrome, Opera 9.5+, Safari 4+
			rect		= elem.getBoundingClientRect();
			top			= rect.top + scrollTop - this.clientTop;
			bottom	= rect.bottom + scrollTop - this.clientTop;
			width		= rect.right - rect.left;
			height	= rect.bottom - rect.top;
		} else {
			console.log("Error: cannot use getBoundingClientRect()");
		}
		
		return { top: Math.round(top), bottom: Math.round(bottom), width: Math.round(width), height: Math.round(height) };	
	}
	
	
	function extendDefaults(source, properties) {
		var property;
		for (property in properties) {
			if (properties.hasOwnProperty(property)) {
				source[property] = properties[property];
			}
		}
		return source;
	}
	
	
}());	