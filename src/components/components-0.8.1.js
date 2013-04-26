/*  
  Components: JavaScript application framework
  Copyright 2008 Adam Bones
  
  http://code.google.com/p/components-js/
  
  This code is freely distributable under the terms of an MIT-style license.
/*--------------------------------------------------------------------------*/

var tree;

function bind(name, source) {
  return tree.bind(name, source);
};

function start() {
  tree.load(document.body);
};
    
function build(text) {
  var element, name = (text.match(/<(\w+)\/?[\s|>]/i) || [])[1];

  if (name) {
    name    = name.toLowerCase();
    element = document.createElement('div');
    text    = text.slice(text.indexOf('<'));

    var j = 1;
    while (name = build.Containers[name]) {
      text = '<' + name + '>' + text + '</' + name + '>';
      j++;
    }
    
    element.innerHTML = text;

    for (var i = 0; i < j; i++)
      element = element.firstChild;
    
    element.parentNode.removeChild(element);
  }
  return element;
};

build.Containers = {
  li:    'ul',
  td:    'tr',
  tr:    'tbody',
  tbody: 'table'
};

function extend(object, source) {
  for (var id in source)
    object[id] = source[id];

  if (source.toString != Object.prototype.toString) // force IE to recognise when we override toString
    object.toString = source.toString;

  return object;
}

var tree = (function() {
var Class = {

  create: function(source) {
    function klass() {
      if (this.initialize)
        this.initialize.apply(this, arguments);
    };

    if (source)
      extend(klass.prototype, source);

    return klass;
  }
};

var Component = Class.create({
  
  initialize: function(container, name) {
    this.container = container;
    this.element   = container.element;
    this.document  = container.element.ownerDocument || document;
    this.window    = window;
    this.name      = name;
  },
    
  prev: function(horizontal) {
    return this.container.seek(this.name, 'prev', horizontal);
  },
  
  next: function(horizontal) {
    return this.container.seek(this.name, 'next', horizontal);
  },

  each: function(name, iterator) {
    return this.container.each(function() {
      if (this.components[name])
        return iterator.apply(this.components[name]);
    });
  },
    
  apply: function(name) {
    if (arguments.length == 1) {
      this.container.addName(name);
      this[name] = this[name] || true;
    } else {
      for (var i = 0; i < arguments.length; i++)
        this.apply(arguments[i]);
    }
  },
  
  clear: function(name) {
    if (arguments.length == 1) {
      this.container.removeName(name);
      
      if (this[name] === true)
        this[name] = false;
    } else {
      for (var i = 0; i < arguments.length; i++)
        this.clear(arguments[i]);
    }    
  },
  
  select: function(component) {
    if (this.selected != component) {
      if (typeof this.selected == 'object')
        this.selected.clear('selected');

      if (this.selected = component)
        this.selected.apply('selected');
      
      return component;
    }
  },
  
  add: function(element) {
    var container, callback;
    
    if (container = this.container.tree.load(element))    
      for (var name in container.components)
        if (this[callback = 'add' + name.capitalize()])
          this[callback](container.components[name]);
  },
  
  remove: function() {
    this.container.remove();
    return this;
  },
  
  clone: function(deep) {
    return this.container.clone(deep).components[this.name];
  },
  
  update: function(data) {
    var o;
    
    if (typeof data == 'string') {
      this.empty();
      this.element.appendChild(document.createTextNode(data));
    } else {  
      for (var name in data) { 
        if (o = this[name]) {
          if (o.update) {
            o.update(data[name]);
          } else if (o.nodeType == 1) {
            if (!o.firstChild) {
              o.appendChild(document.createTextNode(data[name]));
            } else if (o.firstChild == o.lastChild) {
              if (o.firstChild.nodeType == 3) {
                o.firstChild.data = data[name];
              }
            }
          }
        }
      }
    }
    return this;
  },
      
  request: function(method, url, parameters) {
    new Request(this, method, url, parameters).send();
  },
  
  fade: function(finalize) {
    this.morphO(1, 0, function() {
      if (finalize === true)
        this.remove();
      else if (finalize)
        finalize.call(this);
    });
  },
  
  appear: function(finalize) {
    this.morphO(0, 1, finalize);
  },
  
  morphO: function(i, j, finalize) {
    var s = this.element.style;
    
    // Trigger hasLayout in IE (fixes text rendering bug)
    if (window.ActiveXObject)
      s.width = this.element.offsetWidth + 'px';

    this.morph(i, j, function(k) {
      s.display = k == 0 ? 'none' : '';
        
      if (window.ActiveXObject)
        s.filter = 'alpha(opacity=' + (k * 100) + ')';
      else
        s.opacity = k;
    }, function() {
      if (finalize)
        finalize.call(this);

      s.display = s.opacity = s.filter = '';
    });
  },

  
  morph: function(i, j, iterator, finalize) {
    var k = i;
    
    iterator.call(this, i);
    
    this.start(function() {
      k += (i < j ? 1 : -1) * 0.05;
      iterator.call(this, Math.round(-100 * (Math.cos(Math.PI * k) - 1) / 2) / 100);
      
      if ((j > i && k >= j) || (j < i && k <= j)) {
        if (finalize)
          finalize.call(this);
        return false;
      }
    }, 20);
  },
  
  start: function(process, period) {
    var component = this, id, callback = typeof process == 'string' ?
      this[process] : process;
    
    id = setInterval(function() {
      if (callback.apply(component) === false)
        clearInterval(id);
    }, period);
  },
    
  createAllListeners: function() {
    for (var target in this.matches)
      if (this[target])
        this.createListeners(target);
  },
  
  createListeners: function(target) {
    var attr, element = this[target].element || this[target];
    
    for (var event in this.matches[target] || {})
      element[attr = 'on' + event] = this.createListener(this.matches[target][event], target, element[attr]);    
  },
  
  createListener: function(id, target, tail) {
    var component = this;

    return function(event) {
      var result = true;
      
      event = event || window.event;

      if ((tail && tail(event) === false))
        result = false;
        
      if (component[target] && (component[id](event) === false))
        result = false;
      
      return result;
    };
  },
  
  toHTML: function() {
    return this.element.innerHTML;
  },
    
  toString: function() {
    return this.element.id || this.element.className;
  }
});

extend(Component, {

  Listener: /^on(abort|beforeunload|blur|change|click|dblclick|error|focus|keydown|keypress|keyup|load|mousedown|mousemove|mouseout|mouseover|mouseup|reset|resize|select|submit|unload)(\w*)$/i,

  errors: false,
  
  extend: function(source) {
    source = source || {};
    
    return Class.create(extend(extend({
      matches: Component.matchListeners(source)
    }, this.prototype), source));
  },
  
  matchListeners: function(source) {
    var target, event, parts, matches = {};

    for (var id in source) {
      if (typeof source[id] == 'function') {
        if (parts = id.match(this.Listener)) {
          event  = parts[1].toLowerCase();
          target = parts[2].uncapitalize() || 'element';

          
          matches[target]        = matches[target] || {};
          matches[target][event] = id;
        }
      }
    }
    return matches;
  },

  delegate: function(method) {
    if (arguments.length > 1)
      for (var i = 0; i < arguments.length; i++)
        this.delegate(arguments[i]);
    else
      this.prototype[method] = function() {
        return this.container[method].apply(this.container, arguments);
      }
  }
});

Component.delegate('build', 'insert', 'append', 'replace', 'empty', 'collect', 'setTag', 'first', 'last');

String.prototype.capitalize = function() {
  return this.charAt(0).toUpperCase() + this.substring(1);
};

String.prototype.uncapitalize = function() {
  return this.charAt(0).toLowerCase() + this.substring(1);
};

var Tree = Class.create({
  
  initialize: function(bindings) {
    this.bindings = bindings || {};
  },
  
  bind: function(name, source) {
    this.bindings[name] = Component.extend(source);
  },
  
  load: function(element) {
    var container, c, first, last, tree = this;
    
    function add(container) {
      link(last, container);
      first = first || container;
      return last = container;
    };
    
    function link(i, j) {
      if (i) {
        i.next = j;
        j.prev = i;
      }
      return j;
    };
    
    function visit(element, parent) {
      var container, components = {}, flags = {}, all = [], names = [];
      
      if (element.className)
        all = element.className.split(' ');
      if (element.id)
        all.unshift(element.id);

      names._h = {}; // keep a hash for easy lookup in future

      for (var name, i = 0; i < all.length; i++) {
        name = all[i];
        
        if (!names._h[name]) { // filter out duplicates
          if (name != element.id) {
            names.push(name);
            names._h[name] = true;
          }
          
          if (tree.bindings[name]) {
            container = container || add(new Container(tree, element, names, components, parent));
            components[name] = new tree.bindings[name](container, name);
          } else if (name != element.id) { // class with no definition - it's a flag
            flags[name] = true;
          }
          
          if (parent) // make child references
            parent.objects[name] || parent.set(name, components[name] || element);
        }
      }

      for (var flag in flags)
        for (var name in components)
          components[name][flag] = components[name][flag] || true;

      for (var i = 0, node; i < element.childNodes.length; i++) // visit the subtree
        if ((node = element.childNodes[i]).nodeType == 1)
          visit(node, container || parent);

      if (parent && container)  // make parent references
        for (var name in parent.components)
          container.objects[name] || container.set(name, parent.components[name]);     
      
      return container; 
    }
        
    container = visit(element);
    
    if (c = first)
      do
        c.run();
      while ((c = c.next) && (c != last.next));    
    
    return container;
  }
});

var Container = Class.create({

  initialize: function(tree, element, names, components, container) {
    this.tree       = tree;
    this.element    = element;
    this.names      = names;
    this.components = components;
    this.container  = container;
    this.objects    = {};
  },
    
  run: function() {
    var c;
    for (var name in this.components) {
      c = this.components[name];
      if (c.run)
        c.run();
      c.createAllListeners();
    }
  },
  
  clone: function(deep) {
    return this.tree.load(this.element.cloneNode(deep));
  },
      
  empty: function() {
    var next = (this._last() || this).next;
    while (this.next != next) this.next.detach();
    this.element.innerHTML = '';
  },
    
  setTag: function(name) {
    var element = document.createElement(name);
    
    element.className = this.element.className;
    
    while (this.element.firstChild)
      element.appendChild(this.element.firstChild);
    
    this.element.parentNode.replaceChild(element, this.element);
    
    for (var name in this.components)
      this.components[name].element = element;
    
    this.element = element;
    
    return this;
  },
    
  replace: function(component) {
    component = this.container.insert(component, this);
    this.remove();
    return component;
  },
  
  build: function(name, data, next) {
    var com;
    
    if (com = this.components[name] || this.seek(name, 'prev') || this.seek(name, 'next'))
      return this.insert(com.clone(true).update(data || ''), next);
    else
      throw new Error('No instances for ' + name);
  },
  
  append: function(component) {
    return this.insert(component, null);
  },
     
  insert: function(o, next) {
    var c, prev, com;
        
    if (o.name) {
      com = o;
      com.container.detach();
    } else if (typeof o == 'string') {
      if (c = this.tree.load(build(o)))
        com = (function() { for (var name in c.components) return c.components[name] })();
      else
        throw new Error('No top-level components yielded: ' + o);
    }
    
    if (next)
      this.element.insertBefore(com.element, next.element);
    else
      this.element.appendChild(com.element);
    
    if (next && next.name)
      next = next.container;

    next = next || (this._last() || this).next;
        
    com.container.attach(next ? next.prev : this, this, next);
    return com;
  },
  
  detach: function() {
    var com, i = this, j = this._last() || this;
    
    if (i.prev) i.prev.next = j.next;
    if (j.next) j.next.prev = i.prev;
    
    if (this.container) {
      // Remove parent references:
      for (var name in this.objects)
        if (this.objects[name].element == this.container.element)
          this.unset(name);
      
      // Remove/update our parents references to our components:
      for (var name in this.container.objects)
        if (this.container.objects[name].element == this.element)
          if (com = this.components[name].next(true))
            this.container.set(name, com, true);
          else
            this.container.unset(name);
    }
  },
  
  attach: function(prev, container, next) {
    var i = this, j = this._last() || this;
    
    if (i.prev = prev) prev.next = i;
    if (j.next = next) next.prev = j;
    
    if (this.container = container) {
      // New child references:
      for (var name in this.components)
        if (!this.components[name].prev(true))
          container.set(name, this.components[name], true);
      
      // New parent references:
      for (var name in container.components)
        this.objects[name] || this.set(name, container.components[name], true);
    }
  },
      
  addName: function(name) {
    if (!this.names._h[name]) {
      this.names.unshift(name);
      this.names._h[name] = true;
      this.element.className = this.names.join(' ');
    }
    return this.names;
  },
  
  removeName: function(name) {
    if (this.names._h[name])
      for (var i = 0; i < this.names.length; i++)
        if (this.names[i] == name) {
          this.names.splice(i, 1);
          this.names._h[name] = false;
          return this.element.className = this.names.join(' ');
        }
    return this.names;
  },

  remove: function() {
    this.detach();
    this.element.parentNode.removeChild(this.element);
    return this;
  },
  
  set: function(id, object, listeners) {
    var c;
    
    for (var name in this.components) {
      c = this.components[name];
      
      if (!c[id] || (c[id].nodeType == 1) || c[id].name) {
        c[id] = object;
        this.objects[id] = object;
        
        if (listeners)
          c.createListeners(id);
      }
    }
    this.objects[id];
  },
    
  unset: function(id) {
    for (var name in this.components)
      delete(this.components[name][id]);

    delete(this.objects[id]);
  },
  
  first: function(name) {
    return this.each(function() { return this.components[name] });
  },
  
  last: function(name) {
    var last;
    this.each(function() { last = this.components[name] || last });
    return last;
  },
      
  collect: function(name) {
    var list = [];
    this.each(function() { if (this.components[name]) list.push(this.components[name]) });
    return list;
  },
   
  each: function(iterator) {
    var result, c = this;
    while ((c = c.next) && this.contains(c) && !(result = iterator.apply(c)));
    return result;
  },
    
  contains: function(c) {
    while (c = c.container)
      if (c == this) return true;
    return false;
  },
   
  seek: function(name, id, horizontal) {
    var com, c = this;    

    while ((c = c[id]) && (!horizontal || !this.container || this.container.contains(c)))
      if (!horizontal || c.container == this.container)
        if (com = c.components[name])
          return com;
  },
  
  find: function(node) {
    var c = this;
    
    function visit(n) {
      if (c.next)
        if (c.next.element == n)
          c = c.next;
      
      if (node == n)
        return c.element == n ?
          { prev: c.prev, container: c, next: c.next } :
          { prev: c, next: c.next };
      
      for (var o, i = 0; i < n.childNodes.length; i++)
        if (o = visit(n.childNodes[i]))
          return o;
    }
    return visit(this.element);
  },
  
  _last: function() {
    var last;
    this.each(function() { last = this });
    return last;
  }
});

var Request = Class.create({
  
  initialize: function(component, method, url, parameters) {
    this.component  = component;
    this.method     = method.toUpperCase();
    this.url        = url;
    this.headers    = {};
    this.transport  = this.getTransport();
        
    if (!this.method.match(/GET|POST/i)) {
      parameters._method = method;
      this.method = 'POST';
    }

    this.parameters = extend({}, parameters || {})
    this.query      = this.getQuery(this.parameters);
    
    if ((this.method == 'GET') && this.query) {
      this.url  += '?' + this.query;
      this.query = '';
    } 
  },

  open: function() {
    this.transport.open(this.method, this.url, true);
  },
    
  send: function() {
    this.open();

    for (var prop in Request.Headers)
      this.transport.setRequestHeader(prop, Request.Headers[prop]);

    this.transport.onreadystatechange = this.getCallback();
    this.transport.send(this.query);
  },

  dispatch: function(code, content) {
    var callback = '';
    
    if (code >= 500) {
      callback = 'debug';
    } else if (code >= 400) {
      callback = 'error'
    } else if (!code || code == 0 || (code >= 200 && code < 300)) {
      if (content) {
        if (content.nodeType >= 0)
          callback = 'add';
        else
          callback = 'update';
      } else if ((this.parameters._method || this.method) == 'DELETE') {
        callback = 'remove';
      }
    }
    
    if (this.component[callback])
      this.component[callback](content);
    else if (this.component.handle)
      this.component.handle(code, content);
  },
  
  getCallback: function() {
    var request = this;
    return function() {
      if (request.transport.readyState == 4) {
        request.dispatch(
          request.transport.status,
          request.getContent(
            request.transport.responseText),
            request.transport.getResponseHeader('Content-Type'));

        request.transport.onreadystatechange = function() {};
      }
    }
  },
  
  getContent: function(text, type) {
    type = type || 'text/html';
    
    if (text && text != ' ') {
      if (type.match(/html/i)) {
        return build(text);
      } else if (type.match(/json/i)) {
        return eval('(' + text + ')');
      }  
    }
  },
  
  getQuery: function(parameters) {
    var parts = [];
    for (var prop in parameters) {
      parts.push(encodeURIComponent(prop) + '=' + encodeURIComponent(parameters[prop]));
    }
    return parts.join('&');
  },
    
  getTransport: function() {
    try {
      try {
        return new ActiveXObject('Msxml2.XMLHTTP')
      } catch(error) {
        try {
          return new ActiveXObject('Microsoft.XMLHTTP')
        } catch(error) {
          return new XMLHttpRequest()
        }
      }
    } catch(error) {
      return null;
    }
  }
});

Request.Headers = {
  'X-Requested-With':  'XMLHttpRequest', // keep compatibility with Ajax in Rails
  'Content-type':      'application/x-www-form-urlencoded',
  'Accept':            'text/html, application/json, text/xml, */*',
  'If-Modified-Since': 'Thu, 1 Jan 1970 00:00:00 GMT' // Stop IE7 caching
};

return new Tree();
})();

(function() {
  if (/webkit/i.test(navigator.userAgent)) {
    var timeout = setTimeout(function() {
      if (document.readyState == 'loaded' || document.readyState == 'complete' ) {
        start();
      } else {
        setTimeout(arguments.callee, 10);
      }
    }, 10); 
  } else if ((/mozilla/i.test(navigator.userAgent) && !/(compatible)/i.test(navigator.userAgent)) || (/opera/i.test(navigator.userAgent))) {
    document.addEventListener('DOMContentLoaded', start, false);
  } else if (document.uniqueID && document.expando) { // http://www.hedgerwow.com/360/dhtml/ie-dom-ondocumentready.html
    var element = document.createElement('span'); 
  
    (function () { 
      if (document.loaded) return;

      try {
        element.doScroll('left');
      
        if (!document.body)
          throw new Error();
      
        document.loaded = true;
        start();
        element = null; 
      } catch(e) {
        setTimeout(arguments.callee, 0); 
      } 
    })();
  }
})();

tree = tree || new Tree();

