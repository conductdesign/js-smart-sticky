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
		
		// set global flags for the scroll handler
		this.lastWindowPos = pageYOffset || (this.docElem.clientHeight ? this.docElem.scrollTop : this.body.scrollTop); // accounts for page reloads
		this.top = false;
		this.bottom = false;
		this.fixed = false;
		this.scrollSet = false; // flag for scroll event listener
    this.resized = false;   // flag for resize; used to avoid false positives in the scroll handler when touchpads register a horizontal scroll event. 
		
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
			for (i = 0; i < this.options.topOffsetIDs.length; i++) {
				elem = document.getElementById(this.options.topOffsetIDs[i]); 
				// be sure the element exists
				if (null !== elem) {
					this.topOffset += getBounds.call(this, elem).height;  
				}
			}
		}
		//console.log(this.topOffset);
		
		
		this.bottomOffset = 0;
		// get combined height of any absolute positioned footer elements.
		if (this.options.bottomOffsetIDs.length > 0) { 
			for (i = 0; i < this.options.bottomOffsetIDs.length; i++) {
				elem = document.getElementById(this.options.bottomOffsetIDs[i]); 
				// be sure the element exists
				if (null !== elem) {
					this.bottomOffset += getBounds.call(this, elem).height;  
				}
			}
		}
		//console.log(this.bottomOffset);

		// reset element CSS and attachment flags
		this.el.style.cssText = '';
		this.top = this.bottom = this.fixed = false;
		
		// Get element width AFTER resetting css and BEFORE recalculating sidebar position to ensure width relative to parent.
		this.elWidth 		 = getBounds.call(this, this.el).width;
		this.elTopOffset = getBounds.call(this, this.el).top;
		this.parentOffset= getBounds.call(this, this.parent).innerTop;
    
		
		setScrollHandler.call(this);
		if ( this.scrollSet ) {
      // setting resized flag here keeps it relevant.
      this.resized = true; 
      // fire scrollHandler after recalculating sidebar position.
      scrollHandler.call(this); 
    } 
		
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
					topOffset = ( this.topOffset > 0 ) ? (elBounds.top - this.topOffset) : elBounds.top - trackBounds.innerTop;
					this.el.style.cssText = 'transform: translateY(' + topOffset + 'px); content:"down1";';
				
				} else if ( ! this.bottom && windowBottom > elBounds.bottom && windowBottom < trackBounds.innerBottom ) { 
					this.bottom = true;
					this.el.style.cssText = 'position:fixed; bottom:0; width:' + this.elWidth + 'px; content:"down2-bottom";'
				
				} else if ( this.bottom && windowBottom >= trackBounds.innerBottom ) {
					this.bottom = false;
					this.el.style.cssText = 'transform: translateY(' + (trackBounds.innerBottom - trackBounds.innerTop - elBounds.height) + 'px); content:"down3"';
				}
			   
			} else if ( windowPos < this.lastWindowPos ) { 
        // scrolling up
			
				if ( this.bottom ) {
					this.bottom = false;
					topOffset = ( elBounds.top > trackBounds.innerTop ) ? elBounds.top - trackBounds.innerTop : 0;
					this.el.style.cssText = 'transform: translateY(' + topOffset + 'px); content:"up1";';
				
				} else if ( ! this.top && windowPos + this.topOffset < elBounds.top && windowPos + this.topOffset > trackBounds.innerTop ) {
					this.top = true;
					this.el.style.cssText = 'position:fixed; top:' + this.topOffset + 'px; width:' + this.elWidth + 'px';
				
				} else if ( this.top && windowPos <= (trackBounds.innerTop - this.topOffset)) {
					this.el.style.cssText = '';
				}
				
			} else { // no vertical scroll, but probably a resize
        if (this.resized) {
          this.top = this.bottom = false;

          if ( windowPos + elBounds.height < (trackBounds.innerBottom) && windowPos > trackBounds.innerTop ) {
            this.top = true;
            this.el.style.cssText = 'position:fixed; top:' + this.topOffset + 'px; width:' + this.elWidth + 'px';

          } else if ( windowBottom >= trackBounds.innerBottom ) {
            this.bottom = true;
            this.el.style.cssText = 'transform: translateY(' + (trackBounds.innerBottom - elBounds.height - trackBounds.innerTop) + 'px)';

          } else {
            this.top = true;
            this.el.style.cssText = '';
          }
				}
			}		
			
		} else if ( ! this.top ) { // cases where the sidebar is smaller than the window
			
			if (windowPos > this.lastWindowPos) { // scrolling down
				
				if (!this.fixed && windowPos + this.topOffset > elBounds.top && elBounds.bottom < trackBounds.innerBottom) {
					this.fixed = true;
					this.el.style.cssText = 'position:fixed; top:' + this.topOffset + 'px; width:' + this.elWidth + 'px';

				} else if (this.fixed && elBounds.bottom - this.topOffset >= trackBounds.innerBottom) {
					this.fixed = false;
					this.el.style.cssText = 'transform: translateY(' + (trackBounds.innerBottom - elBounds.height - trackBounds.innerTop) + 'px)';
				} 	
				
			} else if (windowPos < this.lastWindowPos) { 
        // scrolling up
				
				if (this.fixed && (windowPos + this.topOffset) <= trackBounds.innerTop) {
					this.fixed = false;
					this.el.style.cssText = '';

				} else if (!this.fixed && windowPos < elBounds.top - this.topOffset && windowPos > trackBounds.innerTop) {
					this.fixed = true;
					this.el.style.cssText = 'position:fixed; top:' + this.topOffset + 'px; width:' + this.elWidth + 'px';
				}
				
			} else { // no vertical scroll; probably a resize
				if (this.resized) {
          this.fixed = false;
          if (windowPos + elBounds.height + this.topOffset < trackBounds.innerBottom && windowPos > trackBounds.innerTop) {
            this.fixed = true;
            this.el.style.cssText = 'position:fixed; top:' + this.topOffset + 'px; width:' + this.elWidth + 'px';

          } else if (windowBottom >= trackBounds.innerBottom) {
            this.el.style.cssText = 'transform: translateY(' + (trackBounds.innerBottom - elBounds.height - trackBounds.innerTop) + 'px)';

          } else {
            this.el.style.cssText = '';
          }
        }
      }  
		}
		
		this.lastWindowPos = windowPos;
    this.resized = false; // reset flag.
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
				cs = window.getComputedStyle(elem, null) || false;
		if (elem.getBoundingClientRect) { // Internet Explorer, Firefox 3+, Google Chrome, Opera 9.5+, Safari 4+
			rect		= elem.getBoundingClientRect();
			top			= rect.top + scrollTop - this.clientTop;
			bottom	= rect.bottom + scrollTop - this.clientTop;
			width		= rect.right - rect.left;
			height	= rect.bottom - rect.top;
			if (cs) {
				innerTop		= top + parseFloat(cs.paddingTop) + parseFloat(cs.borderTopWidth);
				innerBottom = bottom - parseFloat(cs.paddingBottom) - parseFloat(cs.borderBottomWidth);

			} else {
				innerTop		= 0;
				innerBottom = bottom;
				console.log("Error: cannot use getComputedStyle!");
			}
			
		} else {
			console.log("Error: cannot use getBoundingClientRect!");
		}
		
		return { 
			top: Math.round(top), //relative to window pos
			//absTop: Math.round(rect.top), // relative to doc
			bottom: Math.round(bottom), //relative to window pos
			//absBottom: Math.round(rect.bottom), // relative to doc
			innerTop: Math.round(innerTop), // element top including padding
			innerBottom: Math.round(innerBottom), // element bottom including padding
			width: Math.round(width), 
			height: Math.round(height), 
			
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