/**
 * DOMDom, easy DOM element creation
 *
 * @version	1.0
 * @author	Zach Leatherman (zachleatherman@gmail.com)
 * @license	BSD License
 * @package	DOMDom
 * @link	http://www.zachleat.com/web/
 */
var DOMDom = function()
{
	var ADAPTER = {
		setStyle: YAHOO.util.Dom.setStyle,
		addClass: YAHOO.util.Dom.addClass,
		isString: YAHOO.lang.isString,
		isArray: YAHOO.lang.isArray,
		isNumber: YAHOO.lang.isNumber,
		isObject: YAHOO.lang.isObject,
		get: YAHOO.util.Dom.get
	};

	var USE_FRAGMENTS = false;
	var TEXT_NODE_CHAR = '#'; // BadgerFish JSON convention uses a '$' to indicate a text node

	var MATCHERS = {
		// in style declarations, {}, quotes are not required for values
		'style': /([\w<>-]+)\=(?:['"])?([\w<>\s-#\(\)%]+)(?:["'])?(?:\,)?/g,
		// in attributes, quotes _are_ required for values and you can't nest them, ie: '"' or "'"
		'attribute': /(?:\[)?(?:@)?((?:[\w<>-]+\:)?(?:[\w<>-]+))\=(?:['"])([^'"]+)(?:["'])(?:[(?:,)|(?:\])])/g,
		'node': /((?:[\w<>-]+\:)?(?:[\w<>-]+))(\#[\w<>-]+)?((?:\.[\w<>\+-]+)*)?(\{.*\})?(\[.*\])?/g,
		//'variable': /(\{\$\w+\})/,
		'variable': /(<\$\w+>)/
	};

	var MODE_APPEND = 0;
	var MODE_UNSHIFT = 1; // insert at the beginning
	var MODE_INSERT = 2; // argument is the index before which you wish you insert your nodes
	var MODE_REPLACE = 3; // get rid of any child content and replace with your nodes

	/* Create an element handling name and type attribute bug in Internet Explorer 6 */
	function createElement( node, name, type )
	{
		var element;
		try {
			element = document.createElement( '<' + node + ( name ? ' name="'+name+'"' : '' ) + ( type ? ' type="'+type+'"' : '' ) + '>' );
		} catch (e) {}
		if( !element || !element.name || !element.type )
		{
			element = document.createElement( node );
			if( name ) element.setAttribute( 'name', name );
			if( type ) element.setAttribute( 'type', type );
		}
		return element;
	}

	function setStyle( elements, styles /* string with multiple style declarations: border:0;height:90px */ )
	{
		var split = styles.split( ';' );
		for( var j = 0; j < split.length; j++ )
		{
			var keyvalue = split[ j ].split( ':' );
			ADAPTER.setStyle( elements, keyvalue[ 0 ], keyvalue[ 1 ] );
		}
	}

	function addClass( elements, classNames /* array */ )
	{
		for( var j = 0; j < classNames.length; j++ )
		{
			ADAPTER.addClass( elements, classNames[ j ] );
		}
	}

	function setAttribute( node, name, value )
	{
		// name and type attributes must be set at create time, use createElement (for IE )
		var corrections = {
			'accesskey': 'accessKey',
			'usemap': 'useMap',
			'maxlength': 'maxLength',
			'frameborder': 'frameBorder'
		};
		var preadded = {
			'name': '',
			'type': ''
		};
		var lName = name.toLowerCase();
		if( lName == 'style' )
		{
			setStyle( node, value );
		} else if( lName == 'class' ) {
			addClass( node, value.split( ' ' ) );
		} else if( lName == 'for' ) {
			node.htmlFor = value;
		} else if( lName == 'checked' && ( value == 'checked' || value == 'true' ) ) {
			node.checked = true;
			node.defaultChecked = true;
		} else if( ADAPTER.isString( preadded[ lName ] ) && node.getAttribute( lName ) ) {
			// do nothing
		} else if( lName.substr( 0, 2 ) == 'on' ) { // ideally we would use YAHOO.util.Event.addListener, but who sets these as strings anyway?
			node[ lName ] = value;
		} else {
			if( corrections[ lName ] ) node.setAttribute( corrections[ lName ], value );
			else node.setAttribute( lName, value );
		}
	}

	function appendChildren( parentNode, /* Array */children )
	{
		for( var j = 0; j < children.length; j++ )
		{
			if( ADAPTER.isArray( children[ j ] ) )
				appendChildren( parentNode, children[ j ] );
			else
				parentNode.appendChild( children[ j ] );
		};
	}

	// depth first search to the first leaf
	function getLeaf( parentNode )
	{
		var max = 20, j = 0;
		while( parentNode.firstChild != null && j < max )
		{
			parentNode = parentNode.firstChild;
			j++;
		}
		if( j == max ) throw 'Infinite Loop Protection called (' + max + ' loops for getLeaf)';
		return parentNode;
	}

	function getNonWhitespaceNodes( parentNode )
	{
		var children = [];
		for( var j = 0; j < parentNode.childNodes.length; j++ )
		{
			if( !isWhitespaceNode( parentNode.childNodes[ j ] ) ) children.push( parentNode.childNodes[ j ] );
		}
		return children;
	}

	// Mozilla considers whitespace as a text node
	// http://developer.mozilla.org/en/docs/Whitespace_in_the_DOM
	function isWhitespaceNode( node )
	{
		return node.nodeType == 8 || ( ( node.nodeType == 3 ) && !( /[^\t\n\r ]/.test( node.data ) ) );
	};

	function execNodeFragment( node, parent, mode, argument )
	{
		if( parent )
		{
			if( parent.insertAdjacentHTML )
			{
				switch( mode )
				{
					case MODE_APPEND:
					case MODE_REPLACE:
						parent.insertAdjacentHTML( 'beforeEnd', node );
						return [ parent.lastChild ]; // warning: will return only the last root level node
						break;
					case MODE_UNSHIFT:
						parent.insertAdjacentHTML( 'afterBegin', node );
						return [ parent.firstChild ]; // warning: will return only the first root level node
						break;
					case MODE_INSERT:
						throw 'INSERT mode is not supported for HTML Fragments in execNodeFragment';
					default:
						throw 'Unknown mode for execNodeFragment';
				}
			} else {
				var range = parent.ownerDocument.createRange();
				switch( mode )
				{
					case MODE_APPEND:
					case MODE_REPLACE:
						if( parent.lastChild )
						{
							range.setStartAfter( parent.lastChild );
							frag = range.createContextualFragment( node );
							parent.appendChild( frag );
						} else {
							parent.innerHTML = node;
						}
						return [ parent.lastChild ]; // warning: will return only the last root level node
					case MODE_UNSHIFT:
						if( parent.firstChild )
						{
							range.setStartBefore( parent.firstChild );
							frag = range.createContextualFragment( node );
							parent.insertBefore( frag, parent.firstChild );
						} else {
							parent.innerHTML = node;
						}
						return [ parent.firstChild ]; // warning: will return only the first root level node
					case MODE_INSERT:
						throw 'INSERT mode is not supported for HTML Fragments in execNodeFragment';
					default:
						throw 'Unknown mode for execNodeFragment';
				}
			}
		} else {
			var unparent = document.createElement( 'div' );
			if( unparent.insertAdjacentHTML )
			{
				unparent.insertAdjacentHTML( 'afterBegin', node );
			} else {
				unparent.innerHTML = node;
			}
			var child = unparent.firstChild;
			unparent = null;
			return [ child ]; // warning: will return only the first root level node
		}
	};

	function getObject( obj )
	{
		if( ADAPTER.isString( obj ) )
		{
			return [ parseString( obj ) ];
		} else {
			var arg = [];
			for( var key in obj )
			{
				var value = obj[ key ];
				var isTextNode = ADAPTER.isObject( value ) && value.nodeName != null && value.nodeName.toLowerCase() == '#text';
				var isNode = !isTextNode && ADAPTER.isObject( value ) && value.nodeName != null;
				if( !ADAPTER.isNumber( parseInt( key ) ) )
				{
					var parentNode;
					if( !USE_FRAGMENTS )
					{
						parentNode = parseString( key );
						var leaf = getLeaf( parentNode );
						if( isTextNode || isNode )
							leaf.appendChild( value );
						else /* parentNode =  */
							appendChildren( leaf, getObject( value ) );
					} else {
						//@TODO handle raw elements
						if( isTextNode || isNode )
							throw 'Raw DOM nodes are not yet supported with HTML Fragments.  Try setting USE_FRAGMENTS to false.';
						else
							parentNode = parseString( key, getObject( value ) );
					}

					arg[ arg.length ] = parentNode;
				} else {
					if( isTextNode || isNode )
						arg[ arg.length ] =  value;
					else
						arg = arg.concat( getObject( value ) );
				}
			}
			return arg;
		}
	}

	function parseString( str, children )
	{
		if( str.substr( 0, 1 ) == TEXT_NODE_CHAR )
		{
			if( !USE_FRAGMENTS ) return document.createTextNode( str.substr( 1 ) );
			else return str.substr( 1 );
		}

		if( USE_FRAGMENTS ) var output = [], outputLen = 0, openNodes = [], openNodesLen = 0;
		var topLevelNode, parentNode, node;
		var executed = false;
		RegExp.lastIndex = 0;
		var reg = new RegExp( MATCHERS.node );
		while( ( node = reg.exec( str ) ) != null )
		{
			if( USE_FRAGMENTS ) var classStr = '', styleStr = '';
			executed = true;
			var current;
			var attributeList = {};
			if( node[ 5 ] )
			{
				var attributes;
				RegExp.lastIndex = 0;
				var attReg = new RegExp( MATCHERS.attribute );
				while( ( attributes = attReg.exec( node[ 5 ] ) ) != null )
				{
					attributeList[ attributes[ 1 ].toLowerCase() ] = attributes[ 2 ];
				}
			}
			if( !USE_FRAGMENTS )
			{
				if( attributeList[ 'name' ] || attributeList[ 'type' ] )
				{
					current = createElement( node[ 1 ], attributeList[ 'name' ], attributeList[ 'type' ] );
				} else {
					current = document.createElement( node[ 1 ] );
				}
			} else {
				output[ outputLen++ ] = '<' + node[ 1 ];
			}
			
			if( node[ 2 ] )
			{
				if( !USE_FRAGMENTS ) current.setAttribute( 'id', node[ 2 ].substr( 1 ) );
				else output[ outputLen++ ] = ' id="' + node[ 2 ].substr( 1 ) + '"';
			}
			if( node[ 3 ] )
			{
				if( !USE_FRAGMENTS ) addClass( current, node[ 3 ].substr( 1 ).split( '.' ) );
				else classStr += node[ 3 ].substr( 1 ).split( '.' ).join( ' ' );
			}
			for( var j in attributeList )
			{
				if( !USE_FRAGMENTS ) 
				{
					setAttribute( current, j, attributeList[ j ] );
				} else {
					if( j == 'class' ) classStr += ' ' + attributeList[ j ];
					else if( j == 'style' ) styleStr += attributeList[ j ] + ( attributeList[ j ].substr( attributeList[ j ].length - 1 ) == ';' ? '' : ';' );
					else output[ outputLen++ ] = ' ' + j + '="' + attributeList[ j ] + '"';
				}
			}
			if( node[ 4 ] )
			{
				var styles = [];
				var len = 0;
				var style;
				RegExp.lastIndex = 0;
				var attReg = new RegExp( MATCHERS.style );
				while( ( style = attReg.exec( node[ 4 ] ) ) != null )
				{
					styles[len++] = style[ 1 ].toLowerCase() + ':' + style[ 2 ];
				}
				if( !USE_FRAGMENTS ) setStyle( current, styles.join( ';' ) );
				else styleStr += styles.join( ';' );
			}

			if( !USE_FRAGMENTS )
			{
				if( parentNode != null ) // we've looped once already
				{
					parentNode.appendChild( current );
				} else {
					topLevelNode = current;
				}
				parentNode = current;
			} else {
				if( classStr != '' ) output[ outputLen++ ] = ' class="' + classStr + '"';
				if( styleStr != '' ) output[ outputLen++ ] = ' style="' + styleStr + '"';
				// @TODO check to see if no child nodes, then />
				output[ outputLen++ ] = '>';
				openNodes[ openNodesLen++ ] = node[ 1 ];
			}
		}
		if( !executed )
			throw 'Could not parse node string (' + str + ') in parseString';

		if( !USE_FRAGMENTS )
		{
			return topLevelNode;
		} else {
			if( children )
			{
				for( var j = 0; j < children.length; j++ )
				{
					output[ outputLen++ ] = children[ j ];
				}
			}
			for( var j = openNodes.length - 1; j >= 0; j-- )
			{
				output[ outputLen++ ] = '</' + openNodes[ j ] + '>';
			}
			return output.join( '' );
		}
	}

	/* values is the Array containing the values for the loop. */
	function compiledExecute( str, parent, values, mode, argument )
	{
		if( mode == null ) throw new Error( 'Invalid mode in compiledExecute' );

		var split = str.split( MATCHERS.variable );
		if( split.length > 1 )
		{
			for( var j = 1; j < split.length; j+=2 ) // every odd index should be a variable to replace
			{
				var index = split[ j ].substr( 2, split[ j ].length - 3 );
				if( ADAPTER.isNumber( parseInt( index, 10 ) ) )
					index = parseInt( index, 10 );

				if( index != null && values && values[ index ] != null )
				{
					split[ j ] = values[ index ];
				}
			}
		}
		return execNodeFragment( split.join( '' ), parent, mode, argument );
	}

	function elementExecute( obj, parent, mode, argument ) // #idString, .classString, [@att1="value",att2="value"] @ is optional
	{
		if( mode == null ) throw new Error( 'Invalid mode in elementExecute.' );

		var nodes = getObject( obj );

		if( parent )
		{
			if( ADAPTER.isString( parent ) ) parent = ADAPTER.get( parent );			
			if( mode == MODE_REPLACE )
				parent.innerHTML = '';
		}

		if( parent && !USE_FRAGMENTS )
		{
			for( var j = 0; j < nodes.length; j++ )
			{
				switch( mode )
				{
					case MODE_APPEND:
					case MODE_REPLACE:
						parent.appendChild( nodes[ j ] );
						break;
					case MODE_UNSHIFT:
						parent.insertBefore( nodes[ j ], parent.firstChild );
						break;
					case MODE_INSERT:
						//var childNodes = Ext.query( '*', parent ); // gets rid of those pesky \n nodes
						var childNodes = getNonWhitespaceNodes( parent );
						if( !ADAPTER.isNumber( argument ) || argument >= childNodes.length )
						{
							throw 'Incorrect index for INSERT mode in DOMDom.element';
						}
						parent.insertBefore( nodes[ j ], childNodes[ argument ] );
						break;
					default:
						throw 'Unknown mode for DOMDom.element';
				}
			}
		} else if( USE_FRAGMENTS ) {
			return execNodeFragment( nodes.join( '' ), parent, mode );
		}
		return nodes;
	}

	return {
		element: function( obj, parent, values ) // #idString, .classString, [@att1="value",att2="value"] @ is optional
		{
			if( values != null ) return compiledExecute( obj, parent, values, MODE_APPEND );
			return elementExecute( obj, parent, MODE_APPEND );
		},
		append: function( obj, parent, values )
		{
			if( values != null ) return compiledExecute( obj, parent, values, MODE_APPEND );
			return elementExecute( obj, parent, MODE_APPEND );
		},
		replace: function( obj, parent, values )
		{
			if( values != null ) return compiledExecute( obj, parent, values, MODE_REPLACE );
			return elementExecute( obj, parent, MODE_REPLACE );
		},
		unshift: function( obj, parent, values )
		{
			if( values != null ) return compiledExecute( obj, parent, values, MODE_UNSHIFT );
			return elementExecute( obj, parent, MODE_UNSHIFT );
		},
		insert: function( obj, parent, valuesOrIndex ) //insert doesn't work with compiled yet
		{
			if( valuesOrIndex == null )
			{
				return DOMDom.unshift( obj, parent );
			} else {
				if( ADAPTER.isObject( valuesOrIndex ) )
					return compiledExecute( obj, parent, values, MODE_UNSHIFT );
				else if( ADAPTER.isNumber( valuesOrIndex ) )
					return elementExecute( obj, parent, MODE_INSERT, valuesOrIndex );
				else
					throw new Error( 'Invalid argument passed to DOMDom.insert' );
			}
		},
		compile: function( obj )
		{
			return getObject( obj ).join( '' );
		}
	};
}();
