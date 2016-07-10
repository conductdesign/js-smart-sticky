/**
 * JS HTML5 Fixed Sidebar 
 * Version: 0.3
 * 
 * Author: Chris Freeman
 * Author URL: http://www.conductdesign.com
 *
 * Description:
 * A pure JS plugin to offset a sidebar element using fixed and relative positioning with top/bottom offsets, i.e. keeps the sidebar in view. 
 * The code is an adaptation of a similar module included in WordPress's 'Twenty Fifteen' theme by Takashi Irie and a host of contributors.
 *
 * License: GNU GPL 3.0
 * License URL: http://www.gnu.org/licenses/gpl-3.0.html
 *
 * Options: 
 * sidebarID  : String. The ID of the element to be positioned. Must be, obviously, a unique ID. (Default: false – uses first <aside> in DOM) 
 * parentID   : String. If, for whatever reason, the parent is not the sidebar's immediate container. (Default: false – uses parentElement of the sidebar) 
 * minWidth		: Number. Set breakpoint (px) for responsive mobile layout. Plugin functionality is disabled for window widths below this value. (Default: false)
 * topOffsetIDs : Array. The ID or IDs of any FIXED (position:fixed) elements, such as a masthead or admin- or controlbar element, e.g. array('wpadminbar', 'masthead'). (Default: empty array())
 * bottomOffsetIDs : Array. The ID or IDs of any FIXED (position:fixed) footer elements, such as a site footer or cookies warning, e.g. array('colophon'). (Default: empty array())
 */
 

(function() {
	
	this.Sticker = function () {
		
		// Define option defaults
    var defaults = {
      	sidebarID 	: false,
				parentID		: false,
      	minWidth		: false,
				topOffsetIDs	 : [],
				bottomOffsetIDs: [],
				//adminbarID	: false
    };
		
		// Create options by extending defaults with the passed in arugments
    if (arguments[0] && typeof arguments[0] === "object") {
      this.options = extendDefaults(defaults, arguments[0]);
    }

		// some global properties for the getBoundingClientRect function below
		this.window = window;
		this.body = document.body;
		this.docElem = document.documentElement;
		this.clientTop = this.docElem.clientTop || this.body.clientTop || 0;
		
		// Dynamic properties
		this.el = document.getElementById(this.options.sidebarID) || document.getElementsByTagName('aside')[0];
		if (this.el === null) {return;}
		
		//use direct parent element if not user-defined. 
		this.parent = document.getElementById(this.options.parentID) || this.el.parentElement;
		
		// set global flags for the scroll handler
		this.lastWindowPos = pageYOffset || (this.docElem.clientHeight ? this.docElem.scrollTop : this.body.scrollTop); // accounts for page reloads
		this.top = false;
		this.bottom = false;
		this.fixed = false;
		this.scrollSet = false; // flag for scroll event listener
		
		// only add listeners if the sliding element has room to slide.
		if ( getBounds.call(this, this.parent).height > getBounds.call(this, this.el).height ) { bindEvents.call(this); }
		
		
		// fire the resize handler to get/set more initial values.
		resizeHandler.call(this);
		
	};
	
	// Public Methods
	// none.
	
	// Private Methods
	
	function bindEvents () {
		window.addEventListener("resize", resizeHandler.bind(this));
		setScrollHandler.call(this);
	}
	
	function setScrollHandler () {
		
		if ( this.options.minWidth && this.windowWidth < this.options.minWidth && this.scrollSet ) {
			// If window is narrower than breakpoint, remove scrollhandler. Assumes classic resposive positioning handling.
			window.removeEventListener("scroll", scrollHandler);
			this.scrollSet = false;
			
		} else if ( this.options.minWidth && this.windowWidth >= this.options.minWidth && !this.scrollSet ) {
			window.addEventListener("scroll", scrollHandler.bind(this));
			this.scrollSet = true;
		}
	}
	
	
	function resizeHandler () {

		// get window height and width. Used to determine bottom of screen and responsive breakpoint.
		this.windowHeight = this.window.innerHeight || this.docElem.offsetHeight || this.body.offsetHeight;
		this.windowWidth  = this.window.innerWidth || this.docElem.offsetWidth || this.body.offsetWidth;            
		
		// check the admin bar height with each resize.
		this.topOffset = 0;
		// check topOffsetIDs option
		if (this.options.topOffsetIDs.length > 0) { 
			for (var i = 0; i < this.options.topOffsetIDs.length; i++) {
				this.topOffset += getBounds.call(this, document.getElementById(this.options.topOffsetIDs[i])).height;  
			}
		}
		console.log(this.topOffset);

		// reset element CSS and attachment flags
		this.el.style.cssText = '';
		this.top = this.bottom = this.fixed = false;
		
		// Get element width AFTER resetting css and BEFORE recalulating sidebar position to ensure width relative to parent.
		this.elWidth 		 = getBounds.call(this, this.el).width;
		this.elTopOffset = getBounds.call(this, this.el).top;
		
		setScrollHandler.call(this);
		
		if ( this.scrollSet ) { scrollHandler.call(this); } // fire scrollHandler after recalculate sidebar position.
		
	}
	
	
	function scrollHandler () {
				
		// re-evaluate sidebar and parent position.
		var elBounds  	 = getBounds.call(this, this.el),
				trackBounds	 = getBounds.call(this, this.parent),
				topOffset,
		
				windowPos 	 = pageYOffset || (this.docElem.clientHeight ? this.docElem.scrollTop : this.body.scrollTop),
				windowBottom = windowPos + this.windowHeight;
		
		if ( elBounds.height > this.windowHeight ) {
			
			if ( windowPos > this.lastWindowPos ) { // scrolling down
				
				if ( this.top ) {
					this.top = false;
					console.log(elBounds.top);
					topOffset = ( elBounds.top > this.topOffset ) ? elBounds.top - trackBounds.top : 0;
					this.el.style.cssText = 'top:' + topOffset + 'px; content:"down1";';
				
				} else if ( ! this.bottom && windowBottom > elBounds.bottom && elBounds.bottom < trackBounds.bottom ) { 
					this.bottom = true;
					this.el.style.cssText = 'position:fixed; bottom:0px; width:' + this.elWidth + 'px';
				
				} else if ( this.bottom && windowBottom >= trackBounds.bottom ) {
					this.bottom = false;
					this.el.style.cssText = 'top:' + (trackBounds.height - elBounds.height) + 'px; content:"flag:3"';
				}
			   
			} else if ( windowPos < this.lastWindowPos ) { // scrolling up
			
				if ( this.bottom ) {
					this.bottom = false;
					topOffset = ( elBounds.top > trackBounds.top ) ? elBounds.top - trackBounds.top : 0;
					this.el.style.cssText = 'top:' + topOffset + 'px; content:"up1";';
				
				} else if ( ! this.top && windowPos + this.topOffset < elBounds.top && windowPos + this.topOffset > trackBounds.top ) {
					this.top = true;
					this.el.style.cssText = 'position:fixed; top:' + this.topOffset + 'px; width:' + this.elWidth + 'px';
				
				} else if ( this.top && windowPos + this.topOffset <= trackBounds.top ) {
					this.el.style.cssText = '';
				}
				
			} else { // no scroll, but probably a resize
				this.top = this.bottom = false;
				
				if ( windowPos + elBounds.height < trackBounds.bottom && windowPos > trackBounds.top ) {
					this.top = true;
					this.el.style.cssText = 'position:fixed; top:' + this.topOffset + 'px; width:' + this.elWidth + 'px';
				
				} else if ( windowBottom >= trackBounds.bottom ) {
					this.bottom = true;
					this.el.style.cssText = 'top:' + (trackBounds.bottom - elBounds.height - trackBounds.top) + 'px';
				
				} else {
					this.top = true;
					this.el.style.cssText = '';
				}
				
			}		
			
		} else if ( ! this.top ) { // cases where the sidebar is smaller than the window
			
			if (windowPos > this.lastWindowPos) { // scrolling down
				
				if (!this.fixed && windowPos + this.topOffset > elBounds.top && elBounds.bottom < trackBounds.bottom) {
					this.fixed = true;
					this.el.style.cssText = 'position:fixed; top:' + this.topOffset + 'px; width:' + this.elWidth + 'px';

				} else if (this.fixed && elBounds.bottom - this.topOffset >= trackBounds.bottom) {
					this.fixed = false;
					this.el.style.cssText = 'top:' + (trackBounds.bottom - elBounds.height - trackBounds.top) + 'px';
				} 	
				
			} else if (windowPos < this.lastWindowPos) { // scrolling up
				
				if (this.fixed && (windowPos + this.topOffset) <= trackBounds.top) {
					this.fixed = false;
					this.el.style.cssText = '';

				} else if (!this.fixed && windowPos < elBounds.top - this.topOffset && windowPos > trackBounds.top) {
					this.fixed = true;
					this.el.style.cssText = 'position:fixed; top:' + this.topOffset + 'px; width:' + this.elWidth + 'px';
				}
				
			} else { // no scroll, but probably a resize
				this.fixed = false;
				if (windowPos + elBounds.height + this.topOffset < trackBounds.bottom && windowPos > trackBounds.top) {
					this.fixed = true;
					this.el.style.cssText = 'position:fixed; top:' + this.topOffset + 'px; width:' + this.elWidth + 'px';
				
				} else if (windowBottom >= trackBounds.bottom) {
					this.el.style.cssText = 'top:' + (trackBounds.bottom - elBounds.height - trackBounds.top) + 'px';
				
				} else {
					this.el.style.cssText = '';
				}
			}
		}
		
		this.lastWindowPos = windowPos;
	}
	
	
	function getBounds (elem) {
		if (elem === null) {return { top: 0, bottom: 0, width: 0, height: 0 };}
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
			//console.log("Error: cannot use getBoundingClientRect()");
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