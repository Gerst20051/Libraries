/* Copyright (c) 2009 Lars Gersman (http://orangevolt.blogspot.com)
 * Dual licensed under the MIT (http://www.opensource.org/licenses/mit-license.php) 
 * and GPL (http://www.opensource.org/licenses/gpl-license.php) licenses.
 */

/**
 * jQuery.focused
 * Copyright (c) 2009 Lars Gersmann - lars.gersmann(at)gmail(dot)com | http://orangevolt.blogspot.com
 * Dual licensed under MIT and GPL.
 * Date: 05/06/2009
 *
 * @projectDescription Global focus tracking. Using this plugin you can retrieve the currently focused DOM Element.
 * http://orangevolt.blogspot.com
 * @author Lars Gersmann
 * @version 1.0.0
 *
 * @id jQuery.focused
 * @return {Element} Returns the currently focused DOM Element or null if focus is outside the window object.
 *
 * @example var elm = $.focused();
 *
 * Notes:
 *	- The plugin requires jQuery.livequery.
 *	- The jQuery.livequery dependency can be removed when jQuery is able to track focus/blur events using its live() method.
 **/
;(jQuery.focused) || (function($) {

	var focusedElement = null;
	
		// track focus for all focusable elements (a, input, textarea and button)
	$( 'a, :input').livequery(
		function() {
			$(this).focus( function() {
				focusedElement = this;
			})
			.blur( function() {
				focusedElement = null;
			})
		},
		function() {
			$(this).unbind( 'focus').unbind( 'blur');
			
			if(focusedElement==this) {
				focusedElement=null; 
			}
		}
	);
		// --
	
	$.focused = function() {
		return focusedElement;
	}
})(jQuery);
