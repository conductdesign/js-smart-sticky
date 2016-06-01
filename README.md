# js-smart-sticky
A pure JS plug-in to offset a sidebar element using fixed and relative positioning with top/bottom offsets, i.e. keeps the sidebar in view. The code is an adaptation of a similar module included in WordPress's ['Twenty Fifteen' theme](https://twentyfifteendemo.wordpress.com/) by [Takashi Irie](https://takashiirie.com/2015/03/19/twenty-fifteen-the-wordpress-default-theme-for-2015/) and a host of contributors.
Not using `position:sticky` yet.

## Options
`sidebarID` : The ID of the element to be positioned. Must be, obviously, a unique ID. (Default: false – uses first `<aside>` in DOM)

`parentID` : If, for whatever reason, the parent is not the immediate container. (Default: false – uses `parentElement` of the sidebar)

`minWidth` : Set the minimum active width (px) for responsive layouts. Plugin functionality is **disabled** for window widths **below** this value. (Default: false)

`adminbarID` : The ID of an admin- or controlbar element, e.g. 'wpadminbar' for the WordPress crowd. (Default: false)

## Usage
Include the js file as you see fit, then add this to your html (just before the closing `<body>` tag, or include in an init script file.

```javascript
var stickySidebar = new Sticker({
  sidebarID: 'my-sidebar',
	minWidth: 769,
	adminbarID: 'wpadminbar'
	}
);
```

## Notes:
This plugin assumes the following HTML structure: 
```hmtl
<div class="wrapper">
  <article>
    Main content here.
  </article>
  <aside id="my-sidebar">
    Sidebar stuff here.
  </aside>
</div>
```
What's important here is that the wrapper grows with the main content and the sidebar will move up and down within the 'wrapper' div. Other structures may work, but have not yet been tested.

## To-Do
- Test with fixed headers
- Test multiple instances
- Add top and bottom offset options
