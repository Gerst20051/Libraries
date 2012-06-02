/**
 * Modalpreview (http://devkick.com/lab/modalpreview/)
 *
 * Modalpreview is a jQuery script that makes it possible to preview the textarea content in a modal window before submitting the form.
 *
 * Many blog readers prefer to preview their comment before submitting. It is always much easier to
 * check language, spelling and sometimes markup when looking at the text in HTML as if it was already
 * rendered on the site. Some software comes with a built-in preview function using a back-end 
 * reload of the form, and some comes with the optional plugin (ex. wordpress).
 *
 * Back-end previewing works well enough in most cases although it can be jumpy and slow
 * if the blog post is very long. As an alternative, modalpreview automatically adds a preview button
 * next to the submit button that brings up a modular window containing the textarea content, without reloading
 * the entire page. It converts line breaks to <br> and removes the <script> tag to prevent hacking.
 * Modalpreview can also strip HTML before rendering the preview.
 *
 * 
 *
 * Tested in Safari 3, Firefox 2, MSIE 6, MSIE 7, Opera 9
 * 
 * Version 1.0
 * May 19, 2008
 *
 * Copyright (c) 2008 David Hellsing (http://monc.se)
 * Licensed under the GPL licenses.
 * http://www.gnu.org/licenses/gpl.txt
 *
**/

(function($){

var $$;

/**
 * 
 * @desc Adds preview functionality to form textareas.
 * @author David Hellsing
 * @version 1.0
 *
 * @name Modalpreview
 * @type jQuery
 *
 * @cat plugins/Forms
 * 
 * @example $('form textarea').modalpreview({options});
 * @desc Add a preview button that previews each form textarea in a modular window
 * @options
 *   fade:      string or number (milliseconds) that controls fading speed, like 'fast','slow', etc.
 *              set to '1' if you prefer not to fade the modular window
 *   allowHtml: (boolean) if false, modalpreview will strip the textarea content from HTML
 *   opacity:   number from 0-1 that sets the background opacity (defaults to 0.7)
 *   text:      Object where you can control all texts if you use other languages. Defaults:
 *              {preview:'Preview',close:'Close'}
**/

$$ = $.fn.modalpreview = function($options) {

	var $defaults = {
		fade:      'fast',
		allowHtml: false,
		opacity:   '0.7',
		text:      {
			preview: 'Preview',
			close:   'Close'
		}
	};
	
	var $o = $.extend($defaults, $options);
	
	var _o = $(document.createElement('div')).css({
		display: 'none',
		opacity: $o.opacity
	}).attr('id','overlay');
	
	$('body').append(_o);
	
	return this.each(function(){
		
		var _c = $(this);
		var _f = $(this).parents('form');
		var _b = _f.find('input[type=submit]');
		var _t = $(document.createElement('div')).addClass('preview_txt');
		var _h = $(document.createElement('p')).addClass('preview_header').text($o.text.preview+':');
		var _k = $(document.createElement('div')).addClass('preview_inputwrapper');
		var _d = $(document.createElement('div')).addClass('preview_div').css({
					display:'none'
				 });
		var _p = $(document.createElement('input')).attr({
					 value:$o.text.preview,
					 type: 'button'
				 }).addClass('preview_btn');
		/*
		var _s = _b.clone(true).click(function() {
			_f.find('*[name=submit]').attr('name','_submit');
			_f.submit();
		});
		*/
		var _e = $(document.createElement('input')).attr({
					 value:$o.text.close,
					 type: 'button'
				 }).addClass('edit_btn');
		_k.append(_e);
		_d.append(_h).append(_t).append(_k);
		_o.after(_d);
		_p.click(function() {
			if (_c.val().length < 1) {
				return;
			}
			_o.fadeIn($o.fade);
			var _i = (!$o.allowHtml) ? $$.removeTags(_c.val()) : _c.val();
			_t.html($$.parse(_i));
			_e.click(function() {
				_o.fadeOut($o.fade);
				_d.fadeOut($o.fade,function() { _t.empty(); });
				_c.focus();
			});
			_d.fadeIn($o.fade);
		});
		_b.before(_p);
	});
	
};

$$.removeTags = function($t) {
	return $t.replace(/<\/?[^>]+>/gi, '');
};

$$.parse = function($t) {
	return $t.replace(/\n/g, "<br />").replace(/\n\n+/g, '<br /><br />').replace(/(<\/?)script/g,"$1noscript");
};

})(jQuery);