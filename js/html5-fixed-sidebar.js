/**
 * JS HTML5 Fixed Sidebar 
 * Version: 0.5
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
 * @param 	sidebarID			String. The ID of the element to be positioned. (Default: false – uses first <aside> in DOM)
 * @param 	parentID			String. Manually set sidebar's parent. (Default: false – uses parentElement of the sidebar) 
 * @param		minWidth			Number. Breakpoint (px). Plugin is disabled for window widths below this value. (Default: false)
 * @param		topOffsetIDs		Array.	The ID or IDs of any FIXED (position:fixed) header elements, e.g. array('wpadminbar', 'masthead'). (Default: empty array)
 * @param		bottomOffsetIDs	Array.	The ID or IDs of any FIXED (position:fixed) footer elements, e.g. array('colophon'). (Default: empty array)
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
		
		// check for requisite functionality before proceeding
		if ( ! this.body.getBoundingClientRect || ! getComputedStyle ) { return false;}
		
		// Dynamic properties
		this.el = document.getElementById(this.options.sidebarID) || document.getElementsByTagName('aside')[0];
		if (this.el === null) {return false;}
		
		//use direct parent element if not user-defined. 
		this.parent = document.getElementById(this.options.parentID) || this.el.parentElement;
		console.log(this.parent);
		
		// set global flags for the scroll handler
		this.lastWindowPos = pageYOffset || (this.docElem.clientHeight ? this.docElem.scrollTop : this.body.scrollTop); // accounts for page reloads
		this.top = false;
		this.bottom = false;
		this.fixed = false;
		this.scrollSet = false; // flag for scroll event listener
		
		// add resize handler
		console.log('add resize handler');
		window.addEventListener("resize", resizeHandler.bind(this));
		
		// fire the resize handler to get/set more initial values.
		resizeHandler.call(this);
	};
	
	
	// Public Methods
	// none.

	
	// Private Methods
	
	function setScrollHandler () {
		
		if ( 
			(this.options.minWidth && !isNaN(this.options.minWidth) && this.options.minWidth > 0 ) && 
			(getBounds.call(this, this.parent).height > getBounds.call(this, this.el).height) ) {
			
			if ( this.windowWidth < this.options.minWidth && this.scrollSet ) {
				// If window is narrower than breakpoint, remove scrollhandler. Assumes classic resposive positioning handling.
				console.log('remove scroll handler');
				window.removeEventListener('scroll', scrollHandlerRef);
				this.scrollSet = false;
			
			} else if ( this.windowWidth >= this.options.minWidth && !this.scrollSet ) {
				console.log('add scroll handler');
				scrollHandlerRef = scrollHandler.bind(this);
				window.addEventListener('scroll', scrollHandlerRef);
				this.scrollSet = true;
			}
			
		} else {
			// there is no minWidth; addlistener
			if ( !this.scrollSet ) {
				console.log('add scroll handler (no minWidth)');
				scrollHandlerRef = scrollHandler.bind(this);
				window.addEventListener('scroll', scrollHandlerRef);
				this.scrollSet = true;
			}
		}
		// console.log(this.scrollSet);
	}
	
	
	function resizeHandler () {

		// get window height and width. Used to determine bottom of screen and responsive breakpoint.
		this.windowHeight = this.window.innerHeight || this.docElem.offsetHeight || this.body.offsetHeight;
		this.windowWidth  = this.window.innerWidth || this.docElem.offsetWidth || this.body.offsetWidth;   
		
		
		// get combined height of any fixed headers and admin bars.
		this.topOffset = 0;
		// check topOffsetIDs option
		if (this.options.topOffsetIDs.length > 0) { 
			for (var i = 0; i < this.options.topOffsetIDs.length; i++) {
				this.topOffset += getBounds.call(this, document.getElementById(this.options.topOffsetIDs[i])).height;  
			}
		}
		console.log(this.topOffset);
		
		
		this.bottomOffset = 0;
		// get combined height of any absolute positioned footer elements.
		if (this.options.bottomOffsetIDs.length > 0) { 
			for (var i = 0; i < this.options.bottomOffsetIDs.length; i++) {
				this.bottomOffset += getBounds.call(this, document.getElementById(this.options.bottomOffsetIDs[i])).height;  
			}
		}
		console.log(this.bottomOffset);

		// reset element CSS and attachment flags
		this.el.style.cssText = '';
		this.top = this.bottom = this.fixed = false;
		
		// Get element width AFTER resetting css and BEFORE recalculating sidebar position to ensure width relative to parent.
		this.elWidth 		 = getBounds.call(this, this.el).width;
		this.elTopOffset = getBounds.call(this, this.el).top;
		
		setScrollHandler.call(this);
		if ( this.scrollSet ) { scrollHandler.call(this); } // fire scrollHandler after recalculating sidebar position.
		
	}
	
	
	function scrollHandler () {
				
		// re-evaluate sidebar and parent position.
		var elBounds  	 = getBounds.call(this, this.el),
				trackBounds	 = getBounds.call(this, this.parent),
				topOffset,
		
				windowPos 	 = pageYOffset || (this.docElem.clientHeight ? this.docElem.scrollTop : this.body.scrollTop),
				windowBottom = windowPos + this.windowHeight;
		
		if ( elBounds.height > (this.windowHeight - this.topOffset) ) {
			
			if ( windowPos > this.lastWindowPos ) { // scrolling down
				
				if ( this.top ) {
					this.top = false;
					topOffset = ( elBounds.top > this.topOffset ) ? elBounds.top - trackBounds.top : 0;
					this.el.style.cssText = 'top:' + topOffset + 'px; content:"down1";';
				
				} else if ( ! this.bottom && windowBottom > elBounds.bottom && elBounds.bottom < trackBounds.bottom - this.bottomOffset ) { 
					this.bottom = true;
					this.el.style.cssText = 'position:fixed; bottom:0px; width:' + this.elWidth + 'px';
				
				} else if ( this.bottom && windowBottom >= trackBounds.bottom - this.bottomOffset ) {
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
				
				if ( windowPos + elBounds.height < (trackBounds.bottom - this.bottomOffset) && windowPos > trackBounds.top ) {
					this.top = true;
					this.el.style.cssText = 'position:fixed; top:' + this.topOffset + 'px; width:' + this.elWidth + 'px';
				
				} else if ( windowBottom >= (trackBounds.bottom - this.bottomOffset) ) {
					this.bottom = true;
					this.el.style.cssText = 'top:' + (trackBounds.bottom - this.bottomOffset - elBounds.height - trackBounds.top) + 'px';
				
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
		if (elem === null) {return false;}
		var rect, 
				top, 
				bottom, 
				width,
				height,
				innerTop,
				innerBottom,
				scrollTop = window.pageYOffset || this.docElem.scrollTop || this.body.scrollTop,
				scrollLeft = window.pageXOffset || this.docElem.scrollLeft || this.body.scrollLeft,
				cs = getComputedStyle(elem) || false;
		
		if (elem.getBoundingClientRect) { // Internet Explorer, Firefox 3+, Google Chrome, Opera 9.5+, Safari 4+
			rect		= elem.getBoundingClientRect();
			top			= rect.top + scrollTop - this.clientTop;
			bottom	= rect.bottom + scrollTop - this.clientTop;
			width		= rect.right - rect.left;
			height	= rect.bottom - rect.top;
			if (cs) {
				innerTop		= rect.top + parseFloat(cs.paddingTop) + parseFloat(cs.borderTopWidth);
				innerBottom = rect.bottom - parseFloat(cs.paddingBottom) - parseFloat(cs.borderBottomWidth);
			} else {
				innerTop		= rect.top;
				innerBottom = rect.bottom;
				console.log("Error: cannot use getComputedStyle!");
			}
			
		} else {
			console.log("Error: cannot use getBoundingClientRect!");
		}
		
		return { 
			top: Math.round(top), 
			bottom: Math.round(bottom), 
			width: Math.round(width), 
			height: Math.round(height), 
			innerTop: Math.round(innerTop),
			innerBottom: Math.round(innerBottom),
		};	
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