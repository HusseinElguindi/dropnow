
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn) {
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function get_all_dirty_from_scope($$scope) {
        if ($$scope.ctx.length > 32) {
            const dirty = [];
            const length = $$scope.ctx.length / 32;
            for (let i = 0; i < length; i++) {
                dirty[i] = -1;
            }
            return dirty;
        }
        return -1;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            // @ts-ignore
            callbacks.slice().forEach(fn => fn.call(this, event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.43.1' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function createCommonjsModule(fn) {
      var module = { exports: {} };
    	return fn(module, module.exports), module.exports;
    }

    var page = createCommonjsModule(function (module, exports) {
    (function (global, factory) {
    	module.exports = factory() ;
    }(commonjsGlobal, (function () {
    var isarray = Array.isArray || function (arr) {
      return Object.prototype.toString.call(arr) == '[object Array]';
    };

    /**
     * Expose `pathToRegexp`.
     */
    var pathToRegexp_1 = pathToRegexp;
    var parse_1 = parse;
    var compile_1 = compile;
    var tokensToFunction_1 = tokensToFunction;
    var tokensToRegExp_1 = tokensToRegExp;

    /**
     * The main path matching regexp utility.
     *
     * @type {RegExp}
     */
    var PATH_REGEXP = new RegExp([
      // Match escaped characters that would otherwise appear in future matches.
      // This allows the user to escape special characters that won't transform.
      '(\\\\.)',
      // Match Express-style parameters and un-named parameters with a prefix
      // and optional suffixes. Matches appear as:
      //
      // "/:test(\\d+)?" => ["/", "test", "\d+", undefined, "?", undefined]
      // "/route(\\d+)"  => [undefined, undefined, undefined, "\d+", undefined, undefined]
      // "/*"            => ["/", undefined, undefined, undefined, undefined, "*"]
      '([\\/.])?(?:(?:\\:(\\w+)(?:\\(((?:\\\\.|[^()])+)\\))?|\\(((?:\\\\.|[^()])+)\\))([+*?])?|(\\*))'
    ].join('|'), 'g');

    /**
     * Parse a string for the raw tokens.
     *
     * @param  {String} str
     * @return {Array}
     */
    function parse (str) {
      var tokens = [];
      var key = 0;
      var index = 0;
      var path = '';
      var res;

      while ((res = PATH_REGEXP.exec(str)) != null) {
        var m = res[0];
        var escaped = res[1];
        var offset = res.index;
        path += str.slice(index, offset);
        index = offset + m.length;

        // Ignore already escaped sequences.
        if (escaped) {
          path += escaped[1];
          continue
        }

        // Push the current path onto the tokens.
        if (path) {
          tokens.push(path);
          path = '';
        }

        var prefix = res[2];
        var name = res[3];
        var capture = res[4];
        var group = res[5];
        var suffix = res[6];
        var asterisk = res[7];

        var repeat = suffix === '+' || suffix === '*';
        var optional = suffix === '?' || suffix === '*';
        var delimiter = prefix || '/';
        var pattern = capture || group || (asterisk ? '.*' : '[^' + delimiter + ']+?');

        tokens.push({
          name: name || key++,
          prefix: prefix || '',
          delimiter: delimiter,
          optional: optional,
          repeat: repeat,
          pattern: escapeGroup(pattern)
        });
      }

      // Match any characters still remaining.
      if (index < str.length) {
        path += str.substr(index);
      }

      // If the path exists, push it onto the end.
      if (path) {
        tokens.push(path);
      }

      return tokens
    }

    /**
     * Compile a string to a template function for the path.
     *
     * @param  {String}   str
     * @return {Function}
     */
    function compile (str) {
      return tokensToFunction(parse(str))
    }

    /**
     * Expose a method for transforming tokens into the path function.
     */
    function tokensToFunction (tokens) {
      // Compile all the tokens into regexps.
      var matches = new Array(tokens.length);

      // Compile all the patterns before compilation.
      for (var i = 0; i < tokens.length; i++) {
        if (typeof tokens[i] === 'object') {
          matches[i] = new RegExp('^' + tokens[i].pattern + '$');
        }
      }

      return function (obj) {
        var path = '';
        var data = obj || {};

        for (var i = 0; i < tokens.length; i++) {
          var token = tokens[i];

          if (typeof token === 'string') {
            path += token;

            continue
          }

          var value = data[token.name];
          var segment;

          if (value == null) {
            if (token.optional) {
              continue
            } else {
              throw new TypeError('Expected "' + token.name + '" to be defined')
            }
          }

          if (isarray(value)) {
            if (!token.repeat) {
              throw new TypeError('Expected "' + token.name + '" to not repeat, but received "' + value + '"')
            }

            if (value.length === 0) {
              if (token.optional) {
                continue
              } else {
                throw new TypeError('Expected "' + token.name + '" to not be empty')
              }
            }

            for (var j = 0; j < value.length; j++) {
              segment = encodeURIComponent(value[j]);

              if (!matches[i].test(segment)) {
                throw new TypeError('Expected all "' + token.name + '" to match "' + token.pattern + '", but received "' + segment + '"')
              }

              path += (j === 0 ? token.prefix : token.delimiter) + segment;
            }

            continue
          }

          segment = encodeURIComponent(value);

          if (!matches[i].test(segment)) {
            throw new TypeError('Expected "' + token.name + '" to match "' + token.pattern + '", but received "' + segment + '"')
          }

          path += token.prefix + segment;
        }

        return path
      }
    }

    /**
     * Escape a regular expression string.
     *
     * @param  {String} str
     * @return {String}
     */
    function escapeString (str) {
      return str.replace(/([.+*?=^!:${}()[\]|\/])/g, '\\$1')
    }

    /**
     * Escape the capturing group by escaping special characters and meaning.
     *
     * @param  {String} group
     * @return {String}
     */
    function escapeGroup (group) {
      return group.replace(/([=!:$\/()])/g, '\\$1')
    }

    /**
     * Attach the keys as a property of the regexp.
     *
     * @param  {RegExp} re
     * @param  {Array}  keys
     * @return {RegExp}
     */
    function attachKeys (re, keys) {
      re.keys = keys;
      return re
    }

    /**
     * Get the flags for a regexp from the options.
     *
     * @param  {Object} options
     * @return {String}
     */
    function flags (options) {
      return options.sensitive ? '' : 'i'
    }

    /**
     * Pull out keys from a regexp.
     *
     * @param  {RegExp} path
     * @param  {Array}  keys
     * @return {RegExp}
     */
    function regexpToRegexp (path, keys) {
      // Use a negative lookahead to match only capturing groups.
      var groups = path.source.match(/\((?!\?)/g);

      if (groups) {
        for (var i = 0; i < groups.length; i++) {
          keys.push({
            name: i,
            prefix: null,
            delimiter: null,
            optional: false,
            repeat: false,
            pattern: null
          });
        }
      }

      return attachKeys(path, keys)
    }

    /**
     * Transform an array into a regexp.
     *
     * @param  {Array}  path
     * @param  {Array}  keys
     * @param  {Object} options
     * @return {RegExp}
     */
    function arrayToRegexp (path, keys, options) {
      var parts = [];

      for (var i = 0; i < path.length; i++) {
        parts.push(pathToRegexp(path[i], keys, options).source);
      }

      var regexp = new RegExp('(?:' + parts.join('|') + ')', flags(options));

      return attachKeys(regexp, keys)
    }

    /**
     * Create a path regexp from string input.
     *
     * @param  {String} path
     * @param  {Array}  keys
     * @param  {Object} options
     * @return {RegExp}
     */
    function stringToRegexp (path, keys, options) {
      var tokens = parse(path);
      var re = tokensToRegExp(tokens, options);

      // Attach keys back to the regexp.
      for (var i = 0; i < tokens.length; i++) {
        if (typeof tokens[i] !== 'string') {
          keys.push(tokens[i]);
        }
      }

      return attachKeys(re, keys)
    }

    /**
     * Expose a function for taking tokens and returning a RegExp.
     *
     * @param  {Array}  tokens
     * @param  {Array}  keys
     * @param  {Object} options
     * @return {RegExp}
     */
    function tokensToRegExp (tokens, options) {
      options = options || {};

      var strict = options.strict;
      var end = options.end !== false;
      var route = '';
      var lastToken = tokens[tokens.length - 1];
      var endsWithSlash = typeof lastToken === 'string' && /\/$/.test(lastToken);

      // Iterate over the tokens and create our regexp string.
      for (var i = 0; i < tokens.length; i++) {
        var token = tokens[i];

        if (typeof token === 'string') {
          route += escapeString(token);
        } else {
          var prefix = escapeString(token.prefix);
          var capture = token.pattern;

          if (token.repeat) {
            capture += '(?:' + prefix + capture + ')*';
          }

          if (token.optional) {
            if (prefix) {
              capture = '(?:' + prefix + '(' + capture + '))?';
            } else {
              capture = '(' + capture + ')?';
            }
          } else {
            capture = prefix + '(' + capture + ')';
          }

          route += capture;
        }
      }

      // In non-strict mode we allow a slash at the end of match. If the path to
      // match already ends with a slash, we remove it for consistency. The slash
      // is valid at the end of a path match, not in the middle. This is important
      // in non-ending mode, where "/test/" shouldn't match "/test//route".
      if (!strict) {
        route = (endsWithSlash ? route.slice(0, -2) : route) + '(?:\\/(?=$))?';
      }

      if (end) {
        route += '$';
      } else {
        // In non-ending mode, we need the capturing groups to match as much as
        // possible by using a positive lookahead to the end or next path segment.
        route += strict && endsWithSlash ? '' : '(?=\\/|$)';
      }

      return new RegExp('^' + route, flags(options))
    }

    /**
     * Normalize the given path string, returning a regular expression.
     *
     * An empty array can be passed in for the keys, which will hold the
     * placeholder key descriptions. For example, using `/user/:id`, `keys` will
     * contain `[{ name: 'id', delimiter: '/', optional: false, repeat: false }]`.
     *
     * @param  {(String|RegExp|Array)} path
     * @param  {Array}                 [keys]
     * @param  {Object}                [options]
     * @return {RegExp}
     */
    function pathToRegexp (path, keys, options) {
      keys = keys || [];

      if (!isarray(keys)) {
        options = keys;
        keys = [];
      } else if (!options) {
        options = {};
      }

      if (path instanceof RegExp) {
        return regexpToRegexp(path, keys)
      }

      if (isarray(path)) {
        return arrayToRegexp(path, keys, options)
      }

      return stringToRegexp(path, keys, options)
    }

    pathToRegexp_1.parse = parse_1;
    pathToRegexp_1.compile = compile_1;
    pathToRegexp_1.tokensToFunction = tokensToFunction_1;
    pathToRegexp_1.tokensToRegExp = tokensToRegExp_1;

    /**
       * Module dependencies.
       */

      

      /**
       * Short-cuts for global-object checks
       */

      var hasDocument = ('undefined' !== typeof document);
      var hasWindow = ('undefined' !== typeof window);
      var hasHistory = ('undefined' !== typeof history);
      var hasProcess = typeof process !== 'undefined';

      /**
       * Detect click event
       */
      var clickEvent = hasDocument && document.ontouchstart ? 'touchstart' : 'click';

      /**
       * To work properly with the URL
       * history.location generated polyfill in https://github.com/devote/HTML5-History-API
       */

      var isLocation = hasWindow && !!(window.history.location || window.location);

      /**
       * The page instance
       * @api private
       */
      function Page() {
        // public things
        this.callbacks = [];
        this.exits = [];
        this.current = '';
        this.len = 0;

        // private things
        this._decodeURLComponents = true;
        this._base = '';
        this._strict = false;
        this._running = false;
        this._hashbang = false;

        // bound functions
        this.clickHandler = this.clickHandler.bind(this);
        this._onpopstate = this._onpopstate.bind(this);
      }

      /**
       * Configure the instance of page. This can be called multiple times.
       *
       * @param {Object} options
       * @api public
       */

      Page.prototype.configure = function(options) {
        var opts = options || {};

        this._window = opts.window || (hasWindow && window);
        this._decodeURLComponents = opts.decodeURLComponents !== false;
        this._popstate = opts.popstate !== false && hasWindow;
        this._click = opts.click !== false && hasDocument;
        this._hashbang = !!opts.hashbang;

        var _window = this._window;
        if(this._popstate) {
          _window.addEventListener('popstate', this._onpopstate, false);
        } else if(hasWindow) {
          _window.removeEventListener('popstate', this._onpopstate, false);
        }

        if (this._click) {
          _window.document.addEventListener(clickEvent, this.clickHandler, false);
        } else if(hasDocument) {
          _window.document.removeEventListener(clickEvent, this.clickHandler, false);
        }

        if(this._hashbang && hasWindow && !hasHistory) {
          _window.addEventListener('hashchange', this._onpopstate, false);
        } else if(hasWindow) {
          _window.removeEventListener('hashchange', this._onpopstate, false);
        }
      };

      /**
       * Get or set basepath to `path`.
       *
       * @param {string} path
       * @api public
       */

      Page.prototype.base = function(path) {
        if (0 === arguments.length) return this._base;
        this._base = path;
      };

      /**
       * Gets the `base`, which depends on whether we are using History or
       * hashbang routing.

       * @api private
       */
      Page.prototype._getBase = function() {
        var base = this._base;
        if(!!base) return base;
        var loc = hasWindow && this._window && this._window.location;

        if(hasWindow && this._hashbang && loc && loc.protocol === 'file:') {
          base = loc.pathname;
        }

        return base;
      };

      /**
       * Get or set strict path matching to `enable`
       *
       * @param {boolean} enable
       * @api public
       */

      Page.prototype.strict = function(enable) {
        if (0 === arguments.length) return this._strict;
        this._strict = enable;
      };


      /**
       * Bind with the given `options`.
       *
       * Options:
       *
       *    - `click` bind to click events [true]
       *    - `popstate` bind to popstate [true]
       *    - `dispatch` perform initial dispatch [true]
       *
       * @param {Object} options
       * @api public
       */

      Page.prototype.start = function(options) {
        var opts = options || {};
        this.configure(opts);

        if (false === opts.dispatch) return;
        this._running = true;

        var url;
        if(isLocation) {
          var window = this._window;
          var loc = window.location;

          if(this._hashbang && ~loc.hash.indexOf('#!')) {
            url = loc.hash.substr(2) + loc.search;
          } else if (this._hashbang) {
            url = loc.search + loc.hash;
          } else {
            url = loc.pathname + loc.search + loc.hash;
          }
        }

        this.replace(url, null, true, opts.dispatch);
      };

      /**
       * Unbind click and popstate event handlers.
       *
       * @api public
       */

      Page.prototype.stop = function() {
        if (!this._running) return;
        this.current = '';
        this.len = 0;
        this._running = false;

        var window = this._window;
        this._click && window.document.removeEventListener(clickEvent, this.clickHandler, false);
        hasWindow && window.removeEventListener('popstate', this._onpopstate, false);
        hasWindow && window.removeEventListener('hashchange', this._onpopstate, false);
      };

      /**
       * Show `path` with optional `state` object.
       *
       * @param {string} path
       * @param {Object=} state
       * @param {boolean=} dispatch
       * @param {boolean=} push
       * @return {!Context}
       * @api public
       */

      Page.prototype.show = function(path, state, dispatch, push) {
        var ctx = new Context(path, state, this),
          prev = this.prevContext;
        this.prevContext = ctx;
        this.current = ctx.path;
        if (false !== dispatch) this.dispatch(ctx, prev);
        if (false !== ctx.handled && false !== push) ctx.pushState();
        return ctx;
      };

      /**
       * Goes back in the history
       * Back should always let the current route push state and then go back.
       *
       * @param {string} path - fallback path to go back if no more history exists, if undefined defaults to page.base
       * @param {Object=} state
       * @api public
       */

      Page.prototype.back = function(path, state) {
        var page = this;
        if (this.len > 0) {
          var window = this._window;
          // this may need more testing to see if all browsers
          // wait for the next tick to go back in history
          hasHistory && window.history.back();
          this.len--;
        } else if (path) {
          setTimeout(function() {
            page.show(path, state);
          });
        } else {
          setTimeout(function() {
            page.show(page._getBase(), state);
          });
        }
      };

      /**
       * Register route to redirect from one path to other
       * or just redirect to another route
       *
       * @param {string} from - if param 'to' is undefined redirects to 'from'
       * @param {string=} to
       * @api public
       */
      Page.prototype.redirect = function(from, to) {
        var inst = this;

        // Define route from a path to another
        if ('string' === typeof from && 'string' === typeof to) {
          page.call(this, from, function(e) {
            setTimeout(function() {
              inst.replace(/** @type {!string} */ (to));
            }, 0);
          });
        }

        // Wait for the push state and replace it with another
        if ('string' === typeof from && 'undefined' === typeof to) {
          setTimeout(function() {
            inst.replace(from);
          }, 0);
        }
      };

      /**
       * Replace `path` with optional `state` object.
       *
       * @param {string} path
       * @param {Object=} state
       * @param {boolean=} init
       * @param {boolean=} dispatch
       * @return {!Context}
       * @api public
       */


      Page.prototype.replace = function(path, state, init, dispatch) {
        var ctx = new Context(path, state, this),
          prev = this.prevContext;
        this.prevContext = ctx;
        this.current = ctx.path;
        ctx.init = init;
        ctx.save(); // save before dispatching, which may redirect
        if (false !== dispatch) this.dispatch(ctx, prev);
        return ctx;
      };

      /**
       * Dispatch the given `ctx`.
       *
       * @param {Context} ctx
       * @api private
       */

      Page.prototype.dispatch = function(ctx, prev) {
        var i = 0, j = 0, page = this;

        function nextExit() {
          var fn = page.exits[j++];
          if (!fn) return nextEnter();
          fn(prev, nextExit);
        }

        function nextEnter() {
          var fn = page.callbacks[i++];

          if (ctx.path !== page.current) {
            ctx.handled = false;
            return;
          }
          if (!fn) return unhandled.call(page, ctx);
          fn(ctx, nextEnter);
        }

        if (prev) {
          nextExit();
        } else {
          nextEnter();
        }
      };

      /**
       * Register an exit route on `path` with
       * callback `fn()`, which will be called
       * on the previous context when a new
       * page is visited.
       */
      Page.prototype.exit = function(path, fn) {
        if (typeof path === 'function') {
          return this.exit('*', path);
        }

        var route = new Route(path, null, this);
        for (var i = 1; i < arguments.length; ++i) {
          this.exits.push(route.middleware(arguments[i]));
        }
      };

      /**
       * Handle "click" events.
       */

      /* jshint +W054 */
      Page.prototype.clickHandler = function(e) {
        if (1 !== this._which(e)) return;

        if (e.metaKey || e.ctrlKey || e.shiftKey) return;
        if (e.defaultPrevented) return;

        // ensure link
        // use shadow dom when available if not, fall back to composedPath()
        // for browsers that only have shady
        var el = e.target;
        var eventPath = e.path || (e.composedPath ? e.composedPath() : null);

        if(eventPath) {
          for (var i = 0; i < eventPath.length; i++) {
            if (!eventPath[i].nodeName) continue;
            if (eventPath[i].nodeName.toUpperCase() !== 'A') continue;
            if (!eventPath[i].href) continue;

            el = eventPath[i];
            break;
          }
        }

        // continue ensure link
        // el.nodeName for svg links are 'a' instead of 'A'
        while (el && 'A' !== el.nodeName.toUpperCase()) el = el.parentNode;
        if (!el || 'A' !== el.nodeName.toUpperCase()) return;

        // check if link is inside an svg
        // in this case, both href and target are always inside an object
        var svg = (typeof el.href === 'object') && el.href.constructor.name === 'SVGAnimatedString';

        // Ignore if tag has
        // 1. "download" attribute
        // 2. rel="external" attribute
        if (el.hasAttribute('download') || el.getAttribute('rel') === 'external') return;

        // ensure non-hash for the same path
        var link = el.getAttribute('href');
        if(!this._hashbang && this._samePath(el) && (el.hash || '#' === link)) return;

        // Check for mailto: in the href
        if (link && link.indexOf('mailto:') > -1) return;

        // check target
        // svg target is an object and its desired value is in .baseVal property
        if (svg ? el.target.baseVal : el.target) return;

        // x-origin
        // note: svg links that are not relative don't call click events (and skip page.js)
        // consequently, all svg links tested inside page.js are relative and in the same origin
        if (!svg && !this.sameOrigin(el.href)) return;

        // rebuild path
        // There aren't .pathname and .search properties in svg links, so we use href
        // Also, svg href is an object and its desired value is in .baseVal property
        var path = svg ? el.href.baseVal : (el.pathname + el.search + (el.hash || ''));

        path = path[0] !== '/' ? '/' + path : path;

        // strip leading "/[drive letter]:" on NW.js on Windows
        if (hasProcess && path.match(/^\/[a-zA-Z]:\//)) {
          path = path.replace(/^\/[a-zA-Z]:\//, '/');
        }

        // same page
        var orig = path;
        var pageBase = this._getBase();

        if (path.indexOf(pageBase) === 0) {
          path = path.substr(pageBase.length);
        }

        if (this._hashbang) path = path.replace('#!', '');

        if (pageBase && orig === path && (!isLocation || this._window.location.protocol !== 'file:')) {
          return;
        }

        e.preventDefault();
        this.show(orig);
      };

      /**
       * Handle "populate" events.
       * @api private
       */

      Page.prototype._onpopstate = (function () {
        var loaded = false;
        if ( ! hasWindow ) {
          return function () {};
        }
        if (hasDocument && document.readyState === 'complete') {
          loaded = true;
        } else {
          window.addEventListener('load', function() {
            setTimeout(function() {
              loaded = true;
            }, 0);
          });
        }
        return function onpopstate(e) {
          if (!loaded) return;
          var page = this;
          if (e.state) {
            var path = e.state.path;
            page.replace(path, e.state);
          } else if (isLocation) {
            var loc = page._window.location;
            page.show(loc.pathname + loc.search + loc.hash, undefined, undefined, false);
          }
        };
      })();

      /**
       * Event button.
       */
      Page.prototype._which = function(e) {
        e = e || (hasWindow && this._window.event);
        return null == e.which ? e.button : e.which;
      };

      /**
       * Convert to a URL object
       * @api private
       */
      Page.prototype._toURL = function(href) {
        var window = this._window;
        if(typeof URL === 'function' && isLocation) {
          return new URL(href, window.location.toString());
        } else if (hasDocument) {
          var anc = window.document.createElement('a');
          anc.href = href;
          return anc;
        }
      };

      /**
       * Check if `href` is the same origin.
       * @param {string} href
       * @api public
       */
      Page.prototype.sameOrigin = function(href) {
        if(!href || !isLocation) return false;

        var url = this._toURL(href);
        var window = this._window;

        var loc = window.location;

        /*
           When the port is the default http port 80 for http, or 443 for
           https, internet explorer 11 returns an empty string for loc.port,
           so we need to compare loc.port with an empty string if url.port
           is the default port 80 or 443.
           Also the comparition with `port` is changed from `===` to `==` because
           `port` can be a string sometimes. This only applies to ie11.
        */
        return loc.protocol === url.protocol &&
          loc.hostname === url.hostname &&
          (loc.port === url.port || loc.port === '' && (url.port == 80 || url.port == 443)); // jshint ignore:line
      };

      /**
       * @api private
       */
      Page.prototype._samePath = function(url) {
        if(!isLocation) return false;
        var window = this._window;
        var loc = window.location;
        return url.pathname === loc.pathname &&
          url.search === loc.search;
      };

      /**
       * Remove URL encoding from the given `str`.
       * Accommodates whitespace in both x-www-form-urlencoded
       * and regular percent-encoded form.
       *
       * @param {string} val - URL component to decode
       * @api private
       */
      Page.prototype._decodeURLEncodedURIComponent = function(val) {
        if (typeof val !== 'string') { return val; }
        return this._decodeURLComponents ? decodeURIComponent(val.replace(/\+/g, ' ')) : val;
      };

      /**
       * Create a new `page` instance and function
       */
      function createPage() {
        var pageInstance = new Page();

        function pageFn(/* args */) {
          return page.apply(pageInstance, arguments);
        }

        // Copy all of the things over. In 2.0 maybe we use setPrototypeOf
        pageFn.callbacks = pageInstance.callbacks;
        pageFn.exits = pageInstance.exits;
        pageFn.base = pageInstance.base.bind(pageInstance);
        pageFn.strict = pageInstance.strict.bind(pageInstance);
        pageFn.start = pageInstance.start.bind(pageInstance);
        pageFn.stop = pageInstance.stop.bind(pageInstance);
        pageFn.show = pageInstance.show.bind(pageInstance);
        pageFn.back = pageInstance.back.bind(pageInstance);
        pageFn.redirect = pageInstance.redirect.bind(pageInstance);
        pageFn.replace = pageInstance.replace.bind(pageInstance);
        pageFn.dispatch = pageInstance.dispatch.bind(pageInstance);
        pageFn.exit = pageInstance.exit.bind(pageInstance);
        pageFn.configure = pageInstance.configure.bind(pageInstance);
        pageFn.sameOrigin = pageInstance.sameOrigin.bind(pageInstance);
        pageFn.clickHandler = pageInstance.clickHandler.bind(pageInstance);

        pageFn.create = createPage;

        Object.defineProperty(pageFn, 'len', {
          get: function(){
            return pageInstance.len;
          },
          set: function(val) {
            pageInstance.len = val;
          }
        });

        Object.defineProperty(pageFn, 'current', {
          get: function(){
            return pageInstance.current;
          },
          set: function(val) {
            pageInstance.current = val;
          }
        });

        // In 2.0 these can be named exports
        pageFn.Context = Context;
        pageFn.Route = Route;

        return pageFn;
      }

      /**
       * Register `path` with callback `fn()`,
       * or route `path`, or redirection,
       * or `page.start()`.
       *
       *   page(fn);
       *   page('*', fn);
       *   page('/user/:id', load, user);
       *   page('/user/' + user.id, { some: 'thing' });
       *   page('/user/' + user.id);
       *   page('/from', '/to')
       *   page();
       *
       * @param {string|!Function|!Object} path
       * @param {Function=} fn
       * @api public
       */

      function page(path, fn) {
        // <callback>
        if ('function' === typeof path) {
          return page.call(this, '*', path);
        }

        // route <path> to <callback ...>
        if ('function' === typeof fn) {
          var route = new Route(/** @type {string} */ (path), null, this);
          for (var i = 1; i < arguments.length; ++i) {
            this.callbacks.push(route.middleware(arguments[i]));
          }
          // show <path> with [state]
        } else if ('string' === typeof path) {
          this['string' === typeof fn ? 'redirect' : 'show'](path, fn);
          // start [options]
        } else {
          this.start(path);
        }
      }

      /**
       * Unhandled `ctx`. When it's not the initial
       * popstate then redirect. If you wish to handle
       * 404s on your own use `page('*', callback)`.
       *
       * @param {Context} ctx
       * @api private
       */
      function unhandled(ctx) {
        if (ctx.handled) return;
        var current;
        var page = this;
        var window = page._window;

        if (page._hashbang) {
          current = isLocation && this._getBase() + window.location.hash.replace('#!', '');
        } else {
          current = isLocation && window.location.pathname + window.location.search;
        }

        if (current === ctx.canonicalPath) return;
        page.stop();
        ctx.handled = false;
        isLocation && (window.location.href = ctx.canonicalPath);
      }

      /**
       * Escapes RegExp characters in the given string.
       *
       * @param {string} s
       * @api private
       */
      function escapeRegExp(s) {
        return s.replace(/([.+*?=^!:${}()[\]|/\\])/g, '\\$1');
      }

      /**
       * Initialize a new "request" `Context`
       * with the given `path` and optional initial `state`.
       *
       * @constructor
       * @param {string} path
       * @param {Object=} state
       * @api public
       */

      function Context(path, state, pageInstance) {
        var _page = this.page = pageInstance || page;
        var window = _page._window;
        var hashbang = _page._hashbang;

        var pageBase = _page._getBase();
        if ('/' === path[0] && 0 !== path.indexOf(pageBase)) path = pageBase + (hashbang ? '#!' : '') + path;
        var i = path.indexOf('?');

        this.canonicalPath = path;
        var re = new RegExp('^' + escapeRegExp(pageBase));
        this.path = path.replace(re, '') || '/';
        if (hashbang) this.path = this.path.replace('#!', '') || '/';

        this.title = (hasDocument && window.document.title);
        this.state = state || {};
        this.state.path = path;
        this.querystring = ~i ? _page._decodeURLEncodedURIComponent(path.slice(i + 1)) : '';
        this.pathname = _page._decodeURLEncodedURIComponent(~i ? path.slice(0, i) : path);
        this.params = {};

        // fragment
        this.hash = '';
        if (!hashbang) {
          if (!~this.path.indexOf('#')) return;
          var parts = this.path.split('#');
          this.path = this.pathname = parts[0];
          this.hash = _page._decodeURLEncodedURIComponent(parts[1]) || '';
          this.querystring = this.querystring.split('#')[0];
        }
      }

      /**
       * Push state.
       *
       * @api private
       */

      Context.prototype.pushState = function() {
        var page = this.page;
        var window = page._window;
        var hashbang = page._hashbang;

        page.len++;
        if (hasHistory) {
            window.history.pushState(this.state, this.title,
              hashbang && this.path !== '/' ? '#!' + this.path : this.canonicalPath);
        }
      };

      /**
       * Save the context state.
       *
       * @api public
       */

      Context.prototype.save = function() {
        var page = this.page;
        if (hasHistory) {
            page._window.history.replaceState(this.state, this.title,
              page._hashbang && this.path !== '/' ? '#!' + this.path : this.canonicalPath);
        }
      };

      /**
       * Initialize `Route` with the given HTTP `path`,
       * and an array of `callbacks` and `options`.
       *
       * Options:
       *
       *   - `sensitive`    enable case-sensitive routes
       *   - `strict`       enable strict matching for trailing slashes
       *
       * @constructor
       * @param {string} path
       * @param {Object=} options
       * @api private
       */

      function Route(path, options, page) {
        var _page = this.page = page || globalPage;
        var opts = options || {};
        opts.strict = opts.strict || _page._strict;
        this.path = (path === '*') ? '(.*)' : path;
        this.method = 'GET';
        this.regexp = pathToRegexp_1(this.path, this.keys = [], opts);
      }

      /**
       * Return route middleware with
       * the given callback `fn()`.
       *
       * @param {Function} fn
       * @return {Function}
       * @api public
       */

      Route.prototype.middleware = function(fn) {
        var self = this;
        return function(ctx, next) {
          if (self.match(ctx.path, ctx.params)) {
            ctx.routePath = self.path;
            return fn(ctx, next);
          }
          next();
        };
      };

      /**
       * Check if this route matches `path`, if so
       * populate `params`.
       *
       * @param {string} path
       * @param {Object} params
       * @return {boolean}
       * @api private
       */

      Route.prototype.match = function(path, params) {
        var keys = this.keys,
          qsIndex = path.indexOf('?'),
          pathname = ~qsIndex ? path.slice(0, qsIndex) : path,
          m = this.regexp.exec(decodeURIComponent(pathname));

        if (!m) return false;

        delete params[0];

        for (var i = 1, len = m.length; i < len; ++i) {
          var key = keys[i - 1];
          var val = this.page._decodeURLEncodedURIComponent(m[i]);
          if (val !== undefined || !(hasOwnProperty.call(params, key.name))) {
            params[key.name] = val;
          }
        }

        return true;
      };


      /**
       * Module exports.
       */

      var globalPage = createPage();
      var page_js = globalPage;
      var default_1 = globalPage;

    page_js.default = default_1;

    return page_js;

    })));
    });

    /* src/components/ButtonInput/ButtonInput.svelte generated by Svelte v3.43.1 */

    const file$5 = "src/components/ButtonInput/ButtonInput.svelte";

    function create_fragment$6(ctx) {
    	let main;
    	let input;
    	let t;
    	let div1;
    	let div0;
    	let svg;
    	let line;
    	let polyline;
    	let main_style_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			main = element("main");
    			input = element("input");
    			t = space();
    			div1 = element("div");
    			div0 = element("div");
    			svg = svg_element("svg");
    			line = svg_element("line");
    			polyline = svg_element("polyline");
    			attr_dev(input, "placeholder", /*placeholder*/ ctx[2]);
    			attr_dev(input, "spellcheck", "false");
    			attr_dev(input, "class", "svelte-uoaktl");
    			add_location(input, file$5, 8, 4, 260);
    			attr_dev(line, "x1", "5");
    			attr_dev(line, "y1", "12");
    			attr_dev(line, "x2", "19");
    			attr_dev(line, "y2", "12");
    			add_location(line, file$5, 11, 208, 674);
    			attr_dev(polyline, "points", "12 5 19 12 12 19");
    			add_location(polyline, file$5, 11, 246, 712);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 24 24");
    			attr_dev(svg, "fill", "none");
    			attr_dev(svg, "stroke", "currentColor");
    			attr_dev(svg, "stroke-width", "1.5");
    			attr_dev(svg, "stroke-linecap", "round");
    			attr_dev(svg, "stroke-linejoin", "round");
    			attr_dev(svg, "class", "feather feather-arrow-right svelte-uoaktl");
    			add_location(svg, file$5, 11, 12, 478);
    			attr_dev(div0, "class", "input-btn svelte-uoaktl");
    			add_location(div0, file$5, 10, 8, 433);
    			attr_dev(div1, "class", "btn-wrapper svelte-uoaktl");
    			add_location(div1, file$5, 9, 4, 399);
    			attr_dev(main, "class", "wrapper svelte-uoaktl");
    			attr_dev(main, "style", main_style_value = /*hidden*/ ctx[1] ? 'display:none;' : '');
    			toggle_class(main, "focused", /*focused*/ ctx[3]);
    			add_location(main, file$5, 7, 0, 179);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, input);
    			set_input_value(input, /*value*/ ctx[0]);
    			append_dev(main, t);
    			append_dev(main, div1);
    			append_dev(div1, div0);
    			append_dev(div0, svg);
    			append_dev(svg, line);
    			append_dev(svg, polyline);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler*/ ctx[6]),
    					listen_dev(input, "focus", /*focus_handler*/ ctx[7], false, false, false),
    					listen_dev(input, "blur", /*blur_handler*/ ctx[8], false, false, false),
    					listen_dev(div0, "click", /*click_handler*/ ctx[5], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*placeholder*/ 4) {
    				attr_dev(input, "placeholder", /*placeholder*/ ctx[2]);
    			}

    			if (dirty & /*value*/ 1 && input.value !== /*value*/ ctx[0]) {
    				set_input_value(input, /*value*/ ctx[0]);
    			}

    			if (dirty & /*hidden*/ 2 && main_style_value !== (main_style_value = /*hidden*/ ctx[1] ? 'display:none;' : '')) {
    				attr_dev(main, "style", main_style_value);
    			}

    			if (dirty & /*focused*/ 8) {
    				toggle_class(main, "focused", /*focused*/ ctx[3]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ButtonInput', slots, []);
    	let { hidden = false } = $$props;
    	let { placeholder = "" } = $$props;
    	let { value = "" } = $$props;
    	let focused = false;

    	const setFocus = state => {
    		$$invalidate(3, focused = state);
    	};

    	const writable_props = ['hidden', 'placeholder', 'value'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<ButtonInput> was created with unknown prop '${key}'`);
    	});

    	function click_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function input_input_handler() {
    		value = this.value;
    		$$invalidate(0, value);
    	}

    	const focus_handler = () => {
    		setFocus(true);
    	};

    	const blur_handler = () => setFocus(false);

    	$$self.$$set = $$props => {
    		if ('hidden' in $$props) $$invalidate(1, hidden = $$props.hidden);
    		if ('placeholder' in $$props) $$invalidate(2, placeholder = $$props.placeholder);
    		if ('value' in $$props) $$invalidate(0, value = $$props.value);
    	};

    	$$self.$capture_state = () => ({
    		hidden,
    		placeholder,
    		value,
    		focused,
    		setFocus
    	});

    	$$self.$inject_state = $$props => {
    		if ('hidden' in $$props) $$invalidate(1, hidden = $$props.hidden);
    		if ('placeholder' in $$props) $$invalidate(2, placeholder = $$props.placeholder);
    		if ('value' in $$props) $$invalidate(0, value = $$props.value);
    		if ('focused' in $$props) $$invalidate(3, focused = $$props.focused);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		value,
    		hidden,
    		placeholder,
    		focused,
    		setFocus,
    		click_handler,
    		input_input_handler,
    		focus_handler,
    		blur_handler
    	];
    }

    class ButtonInput extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { hidden: 1, placeholder: 2, value: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ButtonInput",
    			options,
    			id: create_fragment$6.name
    		});
    	}

    	get hidden() {
    		throw new Error("<ButtonInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hidden(value) {
    		throw new Error("<ButtonInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get placeholder() {
    		throw new Error("<ButtonInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set placeholder(value) {
    		throw new Error("<ButtonInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<ButtonInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<ButtonInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/pages/Home.svelte generated by Svelte v3.43.1 */
    const file$4 = "src/pages/Home.svelte";

    function create_fragment$5(ctx) {
    	let t0;
    	let section;
    	let h1;
    	let t2;
    	let buttoninput;
    	let updating_value;
    	let current;

    	function buttoninput_value_binding(value) {
    		/*buttoninput_value_binding*/ ctx[2](value);
    	}

    	let buttoninput_props = { placeholder: "Room ID" };

    	if (/*roomID*/ ctx[0] !== void 0) {
    		buttoninput_props.value = /*roomID*/ ctx[0];
    	}

    	buttoninput = new ButtonInput({ props: buttoninput_props, $$inline: true });
    	binding_callbacks.push(() => bind(buttoninput, 'value', buttoninput_value_binding));
    	buttoninput.$on("click", /*joinRoom*/ ctx[1]);

    	const block = {
    		c: function create() {
    			t0 = space();
    			section = element("section");
    			h1 = element("h1");
    			h1.textContent = "DropNow";
    			t2 = space();
    			create_component(buttoninput.$$.fragment);
    			document.title = "DropNow";
    			attr_dev(h1, "class", "svelte-anrdqc");
    			add_location(h1, file$4, 11, 4, 266);
    			attr_dev(section, "class", "svelte-anrdqc");
    			add_location(section, file$4, 10, 0, 252);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, section, anchor);
    			append_dev(section, h1);
    			append_dev(section, t2);
    			mount_component(buttoninput, section, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const buttoninput_changes = {};

    			if (!updating_value && dirty & /*roomID*/ 1) {
    				updating_value = true;
    				buttoninput_changes.value = /*roomID*/ ctx[0];
    				add_flush_callback(() => updating_value = false);
    			}

    			buttoninput.$set(buttoninput_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(buttoninput.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(buttoninput.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(section);
    			destroy_component(buttoninput);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Home', slots, []);
    	let roomID;
    	const joinRoom = () => page.redirect(`/room/${roomID}`);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Home> was created with unknown prop '${key}'`);
    	});

    	function buttoninput_value_binding(value) {
    		roomID = value;
    		$$invalidate(0, roomID);
    	}

    	$$self.$capture_state = () => ({ page, ButtonInput, roomID, joinRoom });

    	$$self.$inject_state = $$props => {
    		if ('roomID' in $$props) $$invalidate(0, roomID = $$props.roomID);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [roomID, joinRoom, buttoninput_value_binding];
    }

    class Home extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Home",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src/components/Button/Button.svelte generated by Svelte v3.43.1 */

    const file$3 = "src/components/Button/Button.svelte";

    function create_fragment$4(ctx) {
    	let main;
    	let p;
    	let main_style_value;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[2].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[1], null);

    	const block = {
    		c: function create() {
    			main = element("main");
    			p = element("p");
    			if (default_slot) default_slot.c();
    			add_location(p, file$3, 4, 4, 132);
    			attr_dev(main, "class", "wrapper svelte-t3g8rd");
    			attr_dev(main, "style", main_style_value = /*hidden*/ ctx[0] ? 'display:none;' : '');
    			add_location(main, file$3, 3, 0, 56);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, p);

    			if (default_slot) {
    				default_slot.m(p, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(main, "click", /*click_handler*/ ctx[3], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 2)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[1],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[1])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[1], dirty, null),
    						null
    					);
    				}
    			}

    			if (!current || dirty & /*hidden*/ 1 && main_style_value !== (main_style_value = /*hidden*/ ctx[0] ? 'display:none;' : '')) {
    				attr_dev(main, "style", main_style_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Button', slots, ['default']);
    	let { hidden = false } = $$props;
    	const writable_props = ['hidden'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Button> was created with unknown prop '${key}'`);
    	});

    	function click_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ('hidden' in $$props) $$invalidate(0, hidden = $$props.hidden);
    		if ('$$scope' in $$props) $$invalidate(1, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ hidden });

    	$$self.$inject_state = $$props => {
    		if ('hidden' in $$props) $$invalidate(0, hidden = $$props.hidden);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [hidden, $$scope, slots, click_handler];
    }

    class Button extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { hidden: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Button",
    			options,
    			id: create_fragment$4.name
    		});
    	}

    	get hidden() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hidden(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/pages/Room.svelte generated by Svelte v3.43.1 */

    const { console: console_1$1 } = globals;
    const file$2 = "src/pages/Room.svelte";

    // (232:4) {#if rtcStatus != 'connected'}
    function create_if_block$1(ctx) {
    	let button;
    	let current;

    	button = new Button({
    			props: {
    				$$slots: { default: [create_default_slot$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", function () {
    		if (is_function(/*connect*/ ctx[2])) /*connect*/ ctx[2].apply(this, arguments);
    	});

    	const block = {
    		c: function create() {
    			create_component(button.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(button, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const button_changes = {};

    			if (dirty & /*$$scope*/ 4194304) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(button, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(232:4) {#if rtcStatus != 'connected'}",
    		ctx
    	});

    	return block;
    }

    // (233:8) <Button on:click={connect}>
    function create_default_slot$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Connect");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(233:8) <Button on:click={connect}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let main;
    	let h1;
    	let t2;
    	let t3;
    	let buttoninput;
    	let updating_value;
    	let t4;
    	let input;
    	let input_hidden_value;
    	let t5;
    	let div0;
    	let progress0;
    	let t6;
    	let t7;
    	let t8;
    	let progress1;
    	let t9;
    	let t10;
    	let t11;
    	let a;
    	let t13;
    	let p0;
    	let t15;
    	let div1;
    	let p1;
    	let t17;
    	let span0;
    	let span0_class_value;
    	let t18;
    	let p2;
    	let t20;
    	let span1;
    	let span1_class_value;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = /*rtcStatus*/ ctx[1] != 'connected' && create_if_block$1(ctx);

    	function buttoninput_value_binding(value) {
    		/*buttoninput_value_binding*/ ctx[11](value);
    	}

    	let buttoninput_props = {
    		hidden: /*rtcStatus*/ ctx[1] !== 'connected',
    		placeholder: "Send message"
    	};

    	if (/*msgContent*/ ctx[3] !== void 0) {
    		buttoninput_props.value = /*msgContent*/ ctx[3];
    	}

    	buttoninput = new ButtonInput({ props: buttoninput_props, $$inline: true });
    	binding_callbacks.push(() => bind(buttoninput, 'value', buttoninput_value_binding));
    	buttoninput.$on("click", /*sendMsg*/ ctx[9]);

    	const block = {
    		c: function create() {
    			main = element("main");
    			h1 = element("h1");
    			h1.textContent = `Room ${/*id*/ ctx[8]}`;
    			t2 = space();
    			if (if_block) if_block.c();
    			t3 = space();
    			create_component(buttoninput.$$.fragment);
    			t4 = space();
    			input = element("input");
    			t5 = space();
    			div0 = element("div");
    			progress0 = element("progress");
    			t6 = text(/*uploadProg*/ ctx[6]);
    			t7 = text("%");
    			t8 = space();
    			progress1 = element("progress");
    			t9 = text(/*downloadProg*/ ctx[7]);
    			t10 = text("%");
    			t11 = space();
    			a = element("a");
    			a.textContent = "download";
    			t13 = space();
    			p0 = element("p");
    			p0.textContent = `${window.location.hostname + ":3000"}`;
    			t15 = space();
    			div1 = element("div");
    			p1 = element("p");
    			p1.textContent = "ws";
    			t17 = space();
    			span0 = element("span");
    			t18 = space();
    			p2 = element("p");
    			p2.textContent = "rtc";
    			t20 = space();
    			span1 = element("span");
    			add_location(h1, file$2, 223, 4, 7825);
    			input.hidden = input_hidden_value = /*rtcStatus*/ ctx[1] !== 'connected';
    			attr_dev(input, "type", "file");
    			add_location(input, file$2, 238, 4, 8169);
    			progress0.value = /*uploadProg*/ ctx[6];
    			attr_dev(progress0, "max", "1");
    			add_location(progress0, file$2, 241, 8, 8339);
    			progress1.value = /*downloadProg*/ ctx[7];
    			attr_dev(progress1, "max", "1");
    			add_location(progress1, file$2, 242, 8, 8409);
    			set_style(div0, "display", /*rtcStatus*/ ctx[1] !== 'connected' ? 'none' : 'flex');
    			set_style(div0, "flex-direction", "column");
    			add_location(div0, file$2, 240, 4, 8240);
    			a.hidden = true;
    			attr_dev(a, "href", "/#");
    			add_location(a, file$2, 244, 4, 8490);
    			add_location(p0, file$2, 246, 4, 8555);
    			add_location(main, file$2, 222, 0, 7814);
    			add_location(p1, file$2, 249, 4, 8629);
    			attr_dev(span0, "class", span0_class_value = "status-dot " + (/*wsStatus*/ ctx[0] == 'connected' ? 'green' : 'red') + " svelte-zdajb3");
    			add_location(span0, file$2, 250, 4, 8643);
    			add_location(p2, file$2, 252, 4, 8725);

    			attr_dev(span1, "class", span1_class_value = "status-dot " + (/*rtcStatus*/ ctx[1] == 'connected'
    			? 'green'
    			: /*rtcStatus*/ ctx[1] == 'connecting' ? 'yellow' : 'red') + " svelte-zdajb3");

    			add_location(span1, file$2, 253, 4, 8740);
    			attr_dev(div1, "id", "status");
    			attr_dev(div1, "class", "svelte-zdajb3");
    			add_location(div1, file$2, 248, 0, 8607);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, h1);
    			append_dev(main, t2);
    			if (if_block) if_block.m(main, null);
    			append_dev(main, t3);
    			mount_component(buttoninput, main, null);
    			append_dev(main, t4);
    			append_dev(main, input);
    			append_dev(main, t5);
    			append_dev(main, div0);
    			append_dev(div0, progress0);
    			append_dev(progress0, t6);
    			append_dev(progress0, t7);
    			append_dev(div0, t8);
    			append_dev(div0, progress1);
    			append_dev(progress1, t9);
    			append_dev(progress1, t10);
    			append_dev(main, t11);
    			append_dev(main, a);
    			/*a_binding*/ ctx[13](a);
    			append_dev(main, t13);
    			append_dev(main, p0);
    			insert_dev(target, t15, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, p1);
    			append_dev(div1, t17);
    			append_dev(div1, span0);
    			append_dev(div1, t18);
    			append_dev(div1, p2);
    			append_dev(div1, t20);
    			append_dev(div1, span1);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(input, "change", /*input_change_handler*/ ctx[12]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*rtcStatus*/ ctx[1] != 'connected') {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*rtcStatus*/ 2) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(main, t3);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			const buttoninput_changes = {};
    			if (dirty & /*rtcStatus*/ 2) buttoninput_changes.hidden = /*rtcStatus*/ ctx[1] !== 'connected';

    			if (!updating_value && dirty & /*msgContent*/ 8) {
    				updating_value = true;
    				buttoninput_changes.value = /*msgContent*/ ctx[3];
    				add_flush_callback(() => updating_value = false);
    			}

    			buttoninput.$set(buttoninput_changes);

    			if (!current || dirty & /*rtcStatus*/ 2 && input_hidden_value !== (input_hidden_value = /*rtcStatus*/ ctx[1] !== 'connected')) {
    				prop_dev(input, "hidden", input_hidden_value);
    			}

    			if (!current || dirty & /*uploadProg*/ 64) set_data_dev(t6, /*uploadProg*/ ctx[6]);

    			if (!current || dirty & /*uploadProg*/ 64) {
    				prop_dev(progress0, "value", /*uploadProg*/ ctx[6]);
    			}

    			if (!current || dirty & /*downloadProg*/ 128) set_data_dev(t9, /*downloadProg*/ ctx[7]);

    			if (!current || dirty & /*downloadProg*/ 128) {
    				prop_dev(progress1, "value", /*downloadProg*/ ctx[7]);
    			}

    			if (!current || dirty & /*rtcStatus*/ 2) {
    				set_style(div0, "display", /*rtcStatus*/ ctx[1] !== 'connected' ? 'none' : 'flex');
    			}

    			if (!current || dirty & /*wsStatus*/ 1 && span0_class_value !== (span0_class_value = "status-dot " + (/*wsStatus*/ ctx[0] == 'connected' ? 'green' : 'red') + " svelte-zdajb3")) {
    				attr_dev(span0, "class", span0_class_value);
    			}

    			if (!current || dirty & /*rtcStatus*/ 2 && span1_class_value !== (span1_class_value = "status-dot " + (/*rtcStatus*/ ctx[1] == 'connected'
    			? 'green'
    			: /*rtcStatus*/ ctx[1] == 'connecting' ? 'yellow' : 'red') + " svelte-zdajb3")) {
    				attr_dev(span1, "class", span1_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			transition_in(buttoninput.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			transition_out(buttoninput.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			if (if_block) if_block.d();
    			destroy_component(buttoninput);
    			/*a_binding*/ ctx[13](null);
    			if (detaching) detach_dev(t15);
    			if (detaching) detach_dev(div1);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Room', slots, []);
    	let { params } = $$props;
    	const { id } = params;
    	let wsStatus;
    	let pc;
    	let rtcStatus;
    	let iceConnState;
    	let datac;
    	let received = [];

    	let connect = () => {
    		
    	};

    	/* let hostname: string; */
    	const SignalRTC = async () => {
    		const hostname = window.location.hostname + ":3000";

    		/* const hostname = window.location.host; */
    		/* hostname = '0.0.0.0:3000'; */
    		/* hostname = '192.168.2.249:3000'; */
    		/* hostname = '127.0.0.1:3000'; */
    		let ws = new WebSocket(`ws://${hostname}/ws/${id}`);

    		ws.onmessage = ev => onsignal(ev.data);
    		ws.onclose = () => $$invalidate(0, wsStatus = 'closed');
    		ws.onerror = err => console.log(err);

    		// Wait until websocket connects
    		await new Promise((resolve, _) => ws.onopen = () => {
    				$$invalidate(0, wsStatus = 'connected');
    				resolve();
    			});

    		console.log();

    		const config = {
    			iceServers: [
    				{
    					/* urls: ['stun:stun.l.google.com:19302', 'stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'] */
    					urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302']
    				}
    			]
    		};

    		pc = new RTCPeerConnection(config);
    		datac = pc.createDataChannel('dataChan', { negotiated: true, id: 0, ordered: true });
    		datac.binaryType = "arraybuffer";
    		let data = [];
    		let receivedBytes = 0;
    		let fileInfo;

    		datac.onmessage = ev => {
    			var _a;
    			console.log('recieved:', ev.data);

    			if (typeof ev.data == "string") {
    				let info = JSON.parse(ev.data);

    				if (((_a = info) === null || _a === void 0
    				? void 0
    				: _a.filename) !== undefined) {
    					fileInfo = info;
    					data = [];
    					receivedBytes = 0;
    					$$invalidate(7, downloadProg = 0);
    				} else {
    					let uploadTerm = info;

    					if (uploadTerm.done) {
    						const received = new Blob(data, { type: fileInfo.mime });
    						console.log("blob len", received.size);
    						$$invalidate(5, downloadAnchor.href = URL.createObjectURL(received), downloadAnchor);
    						$$invalidate(5, downloadAnchor.download = fileInfo.filename, downloadAnchor);
    						downloadAnchor.click();
    					}
    				}
    			} else {
    				receivedBytes += ev.data.byteLength;
    				console.log(receivedBytes);
    				data.push(ev.data);

    				if (fileInfo.size != 0) {
    					$$invalidate(7, downloadProg = receivedBytes / fileInfo.size);
    					console.log(downloadProg);
    				}
    			}
    		};

    		

    		// Send a signal to websocket as JSON
    		const sendSignal = signal => ws === null || ws === void 0
    		? void 0
    		: ws.send(JSON.stringify(signal));

    		// Register RTC events
    		pc.onconnectionstatechange = () => {
    			$$invalidate(1, rtcStatus = pc.connectionState);

    			if (pc.connectionState === 'connected') {
    				console.log('connected!');
    			}
    		};

    		pc.onicecandidate = ev => sendICECandidate(ev);

    		/* pc.onnegotiationneeded = () => negotiate(); */
    		pc.oniceconnectionstatechange = () => iceStateChange();

    		pc.onsignalingstatechange = () => signalStateChange();
    		pc.onicegatheringstatechange = () => console.log(pc.iceGatheringState);
    		console.log(pc);

    		for (let key in pc) {
    			if ((/^on/).test(key)) {
    				pc.addEventListener(key.slice(2), ev => console.log(key, ev));
    			}
    		}

    		

    		// Start negotiation, create an offer and send an SDP signal
    		const negotiate = async () => {
    			console.log('negotiate');

    			// TODO: i think this is redundant
    			// let offerOpts: RTCOfferOptions = {
    			//     offerToReceiveAudio: true,
    			//     offerToReceiveVideo: true
    			// }
    			const offer = await pc.createOffer();

    			await pc.setLocalDescription(new RTCSessionDescription(offer));
    			sendSignal({ type: 'sdp', data: offer });
    		};

    		$$invalidate(2, connect = negotiate);

    		// Send an ICE candidate to remote client
    		const sendICECandidate = ev => {
    			if (ev.candidate) sendSignal({
    				type: 'ice-candidate',
    				data: ev.candidate
    			});
    		};

    		const iceStateChange = () => {
    			iceConnState = pc.iceConnectionState;

    			switch (pc.iceConnectionState) {
    				case 'closed':
    				case 'failed':
    					pc.restartIce();
    					// TODO: ask user to retry
    					// close the connection
    					break;
    			}
    		};

    		// Same as iceStateChange
    		const signalStateChange = () => {
    			switch (pc.signalingState) {
    							}
    		};

    		const onsignal = async msg => {
    			console.log(msg);
    			const signal = JSON.parse(msg);

    			switch (signal === null || signal === void 0
    			? void 0
    			: signal.type) {
    				case 'sdp':
    					await onsdp(signal.data);
    					break;
    				case 'ice-candidate':
    					await pc.addIceCandidate(signal.data);
    					break;
    			}
    		};

    		// Update local and remote client descriptions. If an offer is sent, respond with an offer
    		const onsdp = async sdp => {
    			switch (sdp.type) {
    				case 'offer':
    					await pc.setRemoteDescription(new RTCSessionDescription(sdp));
    					const answer = await pc.createAnswer();
    					await pc.setLocalDescription(answer);
    					sendSignal({ type: 'sdp', data: answer });
    					break;
    				case 'answer':
    					await pc.setRemoteDescription(new RTCSessionDescription(sdp));
    					break;
    			}
    		};
    	}; /* negotiate(); */

    	SignalRTC();
    	const chunkSize = 64 * 1024;
    	let msgContent;

    	const sendMsg = async () => {
    		if ((datac === null || datac === void 0
    		? void 0
    		: datac.readyState) == 'open') {
    			var file = files[0];
    			uploadedBytes = 0;
    			$$invalidate(6, uploadProg = 0);

    			let uploadInfo = {
    				filename: file.name,
    				size: file.size,
    				mime: file.type
    			};

    			datac.send(JSON.stringify(uploadInfo));
    			let start = 0;
    			let end = 0;

    			while (end + chunkSize <= file.size) {
    				end += chunkSize;
    				await send(start, end, file);
    				start = end;
    			}

    			end = file.size;
    			await send(start, end, file);
    			let uploadTerm = { done: true, error: false };
    			datac.send(JSON.stringify(uploadTerm));

    			/* datac.send(msgContent); */
    			$$invalidate(3, msgContent = '');
    		}
    	};

    	let uploadedBytes = 0;

    	const send = async (start, end, file) => {
    		if (datac.bufferedAmount > datac.bufferedAmountLowThreshold) {
    			await new Promise((resolve, _) => {
    					datac.onbufferedamountlow = () => {
    						datac.onbufferedamountlow = null;
    						resolve();
    					};
    				});
    		}

    		let data = await file.slice(start, end).arrayBuffer();
    		datac.send(data);
    		uploadedBytes += data.byteLength;
    		$$invalidate(6, uploadProg = uploadedBytes / file.size);
    	};

    	let files;
    	let downloadAnchor;
    	let uploadProg = 0;
    	let downloadProg = 0;
    	const writable_props = ['params'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$1.warn(`<Room> was created with unknown prop '${key}'`);
    	});

    	function buttoninput_value_binding(value) {
    		msgContent = value;
    		$$invalidate(3, msgContent);
    	}

    	function input_change_handler() {
    		files = this.files;
    		$$invalidate(4, files);
    	}

    	function a_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			downloadAnchor = $$value;
    			$$invalidate(5, downloadAnchor);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('params' in $$props) $$invalidate(10, params = $$props.params);
    	};

    	$$self.$capture_state = () => ({
    		Button,
    		ButtonInput,
    		params,
    		id,
    		wsStatus,
    		pc,
    		rtcStatus,
    		iceConnState,
    		datac,
    		received,
    		connect,
    		SignalRTC,
    		chunkSize,
    		msgContent,
    		sendMsg,
    		uploadedBytes,
    		send,
    		files,
    		downloadAnchor,
    		uploadProg,
    		downloadProg
    	});

    	$$self.$inject_state = $$props => {
    		if ('params' in $$props) $$invalidate(10, params = $$props.params);
    		if ('wsStatus' in $$props) $$invalidate(0, wsStatus = $$props.wsStatus);
    		if ('pc' in $$props) pc = $$props.pc;
    		if ('rtcStatus' in $$props) $$invalidate(1, rtcStatus = $$props.rtcStatus);
    		if ('iceConnState' in $$props) iceConnState = $$props.iceConnState;
    		if ('datac' in $$props) datac = $$props.datac;
    		if ('received' in $$props) received = $$props.received;
    		if ('connect' in $$props) $$invalidate(2, connect = $$props.connect);
    		if ('msgContent' in $$props) $$invalidate(3, msgContent = $$props.msgContent);
    		if ('uploadedBytes' in $$props) uploadedBytes = $$props.uploadedBytes;
    		if ('files' in $$props) $$invalidate(4, files = $$props.files);
    		if ('downloadAnchor' in $$props) $$invalidate(5, downloadAnchor = $$props.downloadAnchor);
    		if ('uploadProg' in $$props) $$invalidate(6, uploadProg = $$props.uploadProg);
    		if ('downloadProg' in $$props) $$invalidate(7, downloadProg = $$props.downloadProg);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		wsStatus,
    		rtcStatus,
    		connect,
    		msgContent,
    		files,
    		downloadAnchor,
    		uploadProg,
    		downloadProg,
    		id,
    		sendMsg,
    		params,
    		buttoninput_value_binding,
    		input_change_handler,
    		a_binding
    	];
    }

    class Room extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { params: 10 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Room",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*params*/ ctx[10] === undefined && !('params' in props)) {
    			console_1$1.warn("<Room> was created without expected prop 'params'");
    		}
    	}

    	get params() {
    		throw new Error("<Room>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set params(value) {
    		throw new Error("<Room>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    class SignalChannel {
        async connect(ws) {
            this.ws = new WebSocket(ws);
            await new Promise((resolve, _) => this.ws.onopen = () => {
                this.status = 'connected';
                resolve();
            });
            this.ws.onclose = () => this.status = 'closed';
            this.ws.onmessage = ({ data }) => {
                const signal = JSON.parse(data);
                this.onsignal(signal);
            };
        }
        send(signal) {
            var _a;
            (_a = this.ws) === null || _a === void 0 ? void 0 : _a.send(JSON.stringify(signal));
        }
    }

    class PeerConnection {
        constructor(sc, polite) {
            this.signalChannel = sc;
            this.polite = polite;
            const configuration = {
                iceServers: [{
                        urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302']
                    }]
            };
            this.pc = new RTCPeerConnection(configuration);
            console.log(this.state);
            // Keep track of some negotiation state to prevent races and errors
            this.state = {
                makingOffer: false,
                ignoreOffer: false,
                isSettingRemoteAnswerPending: false
            };
            console.log(this.state);
            // Send any ice candidates to the other peer
            this.pc.onicecandidate = ({ candidate }) => this.signalChannel.send({
                type: 'ice-candidate',
                data: candidate
            });
            // Let the "negotiationneeded" event trigger offer generation
            // this.pc.onnegotiationneeded = async () => {
            // try {
            // this.state.makingOffer = true;
            // await this.pc.setLocalDescription();
            // this.signalChannel.send({ type: 'sdp', data: this.pc.localDescription });
            // }
            // catch (err) {
            // console.error(err);
            // }
            // finally {
            // this.state.makingOffer = false;
            // }
            // };
            // this.pc.onnegotiationneeded = this.negotiate;
            // this.signalChannel.onmessage = async ({data: {description, candidate}}) => {
            this.signalChannel.onsignal = async ({ type, data }) => {
                try {
                    if (type == 'sdp') {
                        let description = data;
                        // An offer may come in while we are busy processing SRD(answer).
                        // In this case, we will be in "stable" by the time the offer is processed
                        // so it is safe to chain it on our Operations Chain now.
                        const readyForOffer = !this.state.makingOffer && (this.pc.signalingState == "stable" || this.state.isSettingRemoteAnswerPending);
                        const offerCollision = description.type == "offer" && !readyForOffer;
                        this.state.ignoreOffer = !this.polite && offerCollision;
                        if (this.state.ignoreOffer) {
                            return;
                        }
                        this.state.isSettingRemoteAnswerPending = description.type == "answer";
                        await this.pc.setRemoteDescription(description); // SRD rolls back as needed
                        this.state.isSettingRemoteAnswerPending = false;
                        if (description.type == "offer") {
                            await this.pc.setLocalDescription();
                            this.signalChannel.send({ type: 'sdp', data: this.pc.localDescription });
                        }
                    }
                    else if (type == 'ice-candidate') {
                        let candidate = data;
                        try {
                            await this.pc.addIceCandidate(candidate);
                        }
                        catch (err) {
                            if (!this.state.ignoreOffer)
                                throw err; // Suppress ignored offer's candidates
                        }
                    }
                }
                catch (err) {
                    console.error(err);
                }
            };
        }
        async negotiate(that) {
            console.log(that.state);
            try {
                that.state.makingOffer = true;
                await that.pc.setLocalDescription();
                that.signalChannel.send({ type: 'sdp', data: that.pc.localDescription });
            }
            catch (err) {
                console.error(err);
            }
            finally {
                that.state.makingOffer = false;
            }
            // temp
            this.pc.onnegotiationneeded = async () => {
                try {
                    that.state.makingOffer = true;
                    await that.pc.setLocalDescription();
                    that.signalChannel.send({ type: 'sdp', data: that.pc.localDescription });
                }
                catch (err) {
                    console.error(err);
                }
                finally {
                    that.state.makingOffer = false;
                }
            };
        }
    }

    /* src/pages/Room2.svelte generated by Svelte v3.43.1 */

    const { console: console_1 } = globals;
    const file$1 = "src/pages/Room2.svelte";

    // (143:4) {#if rtcStatus != 'connected'}
    function create_if_block(ctx) {
    	let button;
    	let current;

    	button = new Button({
    			props: {
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", function () {
    		if (is_function(/*connect*/ ctx[2])) /*connect*/ ctx[2].apply(this, arguments);
    	});

    	const block = {
    		c: function create() {
    			create_component(button.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(button, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const button_changes = {};

    			if (dirty & /*$$scope*/ 2097152) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(button, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(143:4) {#if rtcStatus != 'connected'}",
    		ctx
    	});

    	return block;
    }

    // (144:8) <Button on:click={connect}>
    function create_default_slot(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Connect");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(144:8) <Button on:click={connect}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let main;
    	let h1;
    	let t2;
    	let t3;
    	let buttoninput;
    	let updating_value;
    	let t4;
    	let input;
    	let input_hidden_value;
    	let t5;
    	let div0;
    	let progress0;
    	let t6;
    	let t7;
    	let t8;
    	let progress1;
    	let t9;
    	let t10;
    	let t11;
    	let a;
    	let t13;
    	let p0;
    	let t15;
    	let div1;
    	let p1;
    	let t17;
    	let span0;
    	let span0_class_value;
    	let t18;
    	let p2;
    	let t20;
    	let span1;
    	let span1_class_value;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = /*rtcStatus*/ ctx[1] != 'connected' && create_if_block(ctx);

    	function buttoninput_value_binding(value) {
    		/*buttoninput_value_binding*/ ctx[11](value);
    	}

    	let buttoninput_props = {
    		hidden: /*rtcStatus*/ ctx[1] !== 'connected',
    		placeholder: "Send message"
    	};

    	if (/*msgContent*/ ctx[3] !== void 0) {
    		buttoninput_props.value = /*msgContent*/ ctx[3];
    	}

    	buttoninput = new ButtonInput({ props: buttoninput_props, $$inline: true });
    	binding_callbacks.push(() => bind(buttoninput, 'value', buttoninput_value_binding));
    	buttoninput.$on("click", /*sendMsg*/ ctx[9]);

    	const block = {
    		c: function create() {
    			main = element("main");
    			h1 = element("h1");
    			h1.textContent = `Room ${/*id*/ ctx[8]}`;
    			t2 = space();
    			if (if_block) if_block.c();
    			t3 = space();
    			create_component(buttoninput.$$.fragment);
    			t4 = space();
    			input = element("input");
    			t5 = space();
    			div0 = element("div");
    			progress0 = element("progress");
    			t6 = text(/*uploadProg*/ ctx[6]);
    			t7 = text("%");
    			t8 = space();
    			progress1 = element("progress");
    			t9 = text(/*downloadProg*/ ctx[7]);
    			t10 = text("%");
    			t11 = space();
    			a = element("a");
    			a.textContent = "download";
    			t13 = space();
    			p0 = element("p");
    			p0.textContent = `${window.location.hostname + ":3000"}`;
    			t15 = space();
    			div1 = element("div");
    			p1 = element("p");
    			p1.textContent = "ws";
    			t17 = space();
    			span0 = element("span");
    			t18 = space();
    			p2 = element("p");
    			p2.textContent = "rtc";
    			t20 = space();
    			span1 = element("span");
    			add_location(h1, file$1, 134, 4, 4470);
    			input.hidden = input_hidden_value = /*rtcStatus*/ ctx[1] !== 'connected';
    			attr_dev(input, "type", "file");
    			add_location(input, file$1, 149, 4, 4814);
    			progress0.value = /*uploadProg*/ ctx[6];
    			attr_dev(progress0, "max", "1");
    			add_location(progress0, file$1, 152, 8, 4984);
    			progress1.value = /*downloadProg*/ ctx[7];
    			attr_dev(progress1, "max", "1");
    			add_location(progress1, file$1, 153, 8, 5054);
    			set_style(div0, "display", /*rtcStatus*/ ctx[1] !== 'connected' ? 'none' : 'flex');
    			set_style(div0, "flex-direction", "column");
    			add_location(div0, file$1, 151, 4, 4885);
    			a.hidden = true;
    			attr_dev(a, "href", "/#");
    			add_location(a, file$1, 155, 4, 5135);
    			add_location(p0, file$1, 157, 4, 5200);
    			add_location(main, file$1, 133, 0, 4459);
    			add_location(p1, file$1, 160, 4, 5274);
    			attr_dev(span0, "class", span0_class_value = "status-dot " + (/*sc*/ ctx[0].status == 'connected' ? 'green' : 'red') + " svelte-zdajb3");
    			add_location(span0, file$1, 161, 4, 5288);
    			add_location(p2, file$1, 163, 4, 5371);

    			attr_dev(span1, "class", span1_class_value = "status-dot " + (/*rtcStatus*/ ctx[1] == 'connected'
    			? 'green'
    			: /*rtcStatus*/ ctx[1] == 'connecting' ? 'yellow' : 'red') + " svelte-zdajb3");

    			add_location(span1, file$1, 164, 4, 5386);
    			attr_dev(div1, "id", "status");
    			attr_dev(div1, "class", "svelte-zdajb3");
    			add_location(div1, file$1, 159, 0, 5252);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, h1);
    			append_dev(main, t2);
    			if (if_block) if_block.m(main, null);
    			append_dev(main, t3);
    			mount_component(buttoninput, main, null);
    			append_dev(main, t4);
    			append_dev(main, input);
    			append_dev(main, t5);
    			append_dev(main, div0);
    			append_dev(div0, progress0);
    			append_dev(progress0, t6);
    			append_dev(progress0, t7);
    			append_dev(div0, t8);
    			append_dev(div0, progress1);
    			append_dev(progress1, t9);
    			append_dev(progress1, t10);
    			append_dev(main, t11);
    			append_dev(main, a);
    			/*a_binding*/ ctx[13](a);
    			append_dev(main, t13);
    			append_dev(main, p0);
    			insert_dev(target, t15, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, p1);
    			append_dev(div1, t17);
    			append_dev(div1, span0);
    			append_dev(div1, t18);
    			append_dev(div1, p2);
    			append_dev(div1, t20);
    			append_dev(div1, span1);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(input, "change", /*input_change_handler*/ ctx[12]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*rtcStatus*/ ctx[1] != 'connected') {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*rtcStatus*/ 2) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(main, t3);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			const buttoninput_changes = {};
    			if (dirty & /*rtcStatus*/ 2) buttoninput_changes.hidden = /*rtcStatus*/ ctx[1] !== 'connected';

    			if (!updating_value && dirty & /*msgContent*/ 8) {
    				updating_value = true;
    				buttoninput_changes.value = /*msgContent*/ ctx[3];
    				add_flush_callback(() => updating_value = false);
    			}

    			buttoninput.$set(buttoninput_changes);

    			if (!current || dirty & /*rtcStatus*/ 2 && input_hidden_value !== (input_hidden_value = /*rtcStatus*/ ctx[1] !== 'connected')) {
    				prop_dev(input, "hidden", input_hidden_value);
    			}

    			if (!current || dirty & /*uploadProg*/ 64) set_data_dev(t6, /*uploadProg*/ ctx[6]);

    			if (!current || dirty & /*uploadProg*/ 64) {
    				prop_dev(progress0, "value", /*uploadProg*/ ctx[6]);
    			}

    			if (!current || dirty & /*downloadProg*/ 128) set_data_dev(t9, /*downloadProg*/ ctx[7]);

    			if (!current || dirty & /*downloadProg*/ 128) {
    				prop_dev(progress1, "value", /*downloadProg*/ ctx[7]);
    			}

    			if (!current || dirty & /*rtcStatus*/ 2) {
    				set_style(div0, "display", /*rtcStatus*/ ctx[1] !== 'connected' ? 'none' : 'flex');
    			}

    			if (!current || dirty & /*sc*/ 1 && span0_class_value !== (span0_class_value = "status-dot " + (/*sc*/ ctx[0].status == 'connected' ? 'green' : 'red') + " svelte-zdajb3")) {
    				attr_dev(span0, "class", span0_class_value);
    			}

    			if (!current || dirty & /*rtcStatus*/ 2 && span1_class_value !== (span1_class_value = "status-dot " + (/*rtcStatus*/ ctx[1] == 'connected'
    			? 'green'
    			: /*rtcStatus*/ ctx[1] == 'connecting' ? 'yellow' : 'red') + " svelte-zdajb3")) {
    				attr_dev(span1, "class", span1_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			transition_in(buttoninput.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			transition_out(buttoninput.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			if (if_block) if_block.d();
    			destroy_component(buttoninput);
    			/*a_binding*/ ctx[13](null);
    			if (detaching) detach_dev(t15);
    			if (detaching) detach_dev(div1);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Room2', slots, []);
    	let { params } = $$props;
    	const { id, polite } = params;
    	let sc;
    	let pc;
    	let rtcStatus;
    	let datac;

    	let connect = () => {
    		
    	};

    	const SignalRTC = async () => {
    		const hostname = window.location.hostname + ":3000";
    		$$invalidate(0, sc = new SignalChannel());
    		await sc.connect(`ws://${hostname}/ws/${id}`);
    		$$invalidate(0, sc.ws.onerror = err => console.log(err), sc);
    		console.log({ polite });
    		pc = new PeerConnection(sc, polite);
    		datac = pc.pc.createDataChannel('dataChan', { negotiated: true, id: 0, ordered: true });
    		datac.binaryType = "arraybuffer";
    		let data = [];
    		let receivedBytes = 0;
    		let fileInfo;

    		datac.onmessage = ev => {
    			var _a;
    			console.log('recieved:', ev.data);

    			if (typeof ev.data == "string") {
    				let info = JSON.parse(ev.data);

    				if (((_a = info) === null || _a === void 0
    				? void 0
    				: _a.filename) !== undefined) {
    					fileInfo = info;
    					data = [];
    					receivedBytes = 0;
    					$$invalidate(7, downloadProg = 0);
    				} else {
    					let uploadTerm = info;

    					if (uploadTerm.done) {
    						const received = new Blob(data, { type: fileInfo.mime });
    						console.log("blob len", received.size);
    						$$invalidate(5, downloadAnchor.href = URL.createObjectURL(received), downloadAnchor);
    						$$invalidate(5, downloadAnchor.download = fileInfo.filename, downloadAnchor);
    						downloadAnchor.click();
    					}
    				}
    			} else {
    				receivedBytes += ev.data.byteLength;
    				console.log(receivedBytes);
    				data.push(ev.data);

    				if (fileInfo.size != 0) {
    					$$invalidate(7, downloadProg = receivedBytes / fileInfo.size);
    					console.log(downloadProg);
    				}
    			}
    		};

    		// Safari only sends host ice candidates if there are media devices.
    		// Otherwise, a TURN server will be used. Uncomment the next section for it to work with STUN.
    		// let media = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    		// for (const track of media.getTracks()) {
    		//     pc.addTrack(track);
    		// }
    		// Register RTC events
    		pc.pc.onconnectionstatechange = () => {
    			$$invalidate(1, rtcStatus = pc.pc.connectionState);

    			if (pc.pc.connectionState === 'connected') {
    				console.log('connected!');
    			}
    		};

    		/* const iceStateChange = () => { */
    		/* iceConnState = pc.iceConnectionState; */
    		/* switch (pc.pc.iceConnectionState) { */
    		/* case 'closed': */
    		/* case 'failed': */
    		/* pc.pc.restartIce(); */
    		/* // TODO: ask user to retry */
    		/* // close the connection */
    		/* break; */
    		/* } */
    		/* }; */
    		console.log(pc.state);

    		$$invalidate(2, connect = () => {
    			pc.negotiate(pc);
    		});
    	};

    	SignalRTC();
    	const chunkSize = 64 * 1024;
    	let msgContent;

    	const sendMsg = async () => {
    		if ((datac === null || datac === void 0
    		? void 0
    		: datac.readyState) == 'open') {
    			var file = files[0];
    			uploadedBytes = 0;
    			$$invalidate(6, uploadProg = 0);

    			let uploadInfo = {
    				filename: file.name,
    				size: file.size,
    				mime: file.type
    			};

    			datac.send(JSON.stringify(uploadInfo));
    			let start = 0;
    			let end = 0;

    			while (end + chunkSize <= file.size) {
    				end += chunkSize;
    				await send(start, end, file);
    				start = end;
    			}

    			end = file.size;
    			await send(start, end, file);
    			let uploadTerm = { done: true, error: false };
    			datac.send(JSON.stringify(uploadTerm));

    			/* datac.send(msgContent); */
    			$$invalidate(3, msgContent = '');
    		}
    	};

    	let uploadedBytes = 0;

    	const send = async (start, end, file) => {
    		if (datac.bufferedAmount > datac.bufferedAmountLowThreshold) {
    			await new Promise((resolve, _) => {
    					datac.onbufferedamountlow = () => {
    						datac.onbufferedamountlow = null;
    						resolve();
    					};
    				});
    		}

    		let data = await file.slice(start, end).arrayBuffer();
    		datac.send(data);
    		uploadedBytes += data.byteLength;
    		$$invalidate(6, uploadProg = uploadedBytes / file.size);
    	};

    	let files;
    	let downloadAnchor;
    	let uploadProg = 0;
    	let downloadProg = 0;
    	const writable_props = ['params'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<Room2> was created with unknown prop '${key}'`);
    	});

    	function buttoninput_value_binding(value) {
    		msgContent = value;
    		$$invalidate(3, msgContent);
    	}

    	function input_change_handler() {
    		files = this.files;
    		$$invalidate(4, files);
    	}

    	function a_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			downloadAnchor = $$value;
    			$$invalidate(5, downloadAnchor);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('params' in $$props) $$invalidate(10, params = $$props.params);
    	};

    	$$self.$capture_state = () => ({
    		Button,
    		ButtonInput,
    		SignalChannel,
    		PeerConnection,
    		params,
    		id,
    		polite,
    		sc,
    		pc,
    		rtcStatus,
    		datac,
    		connect,
    		SignalRTC,
    		chunkSize,
    		msgContent,
    		sendMsg,
    		uploadedBytes,
    		send,
    		files,
    		downloadAnchor,
    		uploadProg,
    		downloadProg
    	});

    	$$self.$inject_state = $$props => {
    		if ('params' in $$props) $$invalidate(10, params = $$props.params);
    		if ('sc' in $$props) $$invalidate(0, sc = $$props.sc);
    		if ('pc' in $$props) pc = $$props.pc;
    		if ('rtcStatus' in $$props) $$invalidate(1, rtcStatus = $$props.rtcStatus);
    		if ('datac' in $$props) datac = $$props.datac;
    		if ('connect' in $$props) $$invalidate(2, connect = $$props.connect);
    		if ('msgContent' in $$props) $$invalidate(3, msgContent = $$props.msgContent);
    		if ('uploadedBytes' in $$props) uploadedBytes = $$props.uploadedBytes;
    		if ('files' in $$props) $$invalidate(4, files = $$props.files);
    		if ('downloadAnchor' in $$props) $$invalidate(5, downloadAnchor = $$props.downloadAnchor);
    		if ('uploadProg' in $$props) $$invalidate(6, uploadProg = $$props.uploadProg);
    		if ('downloadProg' in $$props) $$invalidate(7, downloadProg = $$props.downloadProg);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		sc,
    		rtcStatus,
    		connect,
    		msgContent,
    		files,
    		downloadAnchor,
    		uploadProg,
    		downloadProg,
    		id,
    		sendMsg,
    		params,
    		buttoninput_value_binding,
    		input_change_handler,
    		a_binding
    	];
    }

    class Room2 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { params: 10 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Room2",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*params*/ ctx[10] === undefined && !('params' in props)) {
    			console_1.warn("<Room2> was created without expected prop 'params'");
    		}
    	}

    	get params() {
    		throw new Error("<Room2>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set params(value) {
    		throw new Error("<Room2>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/pages/NotFound.svelte generated by Svelte v3.43.1 */
    const file = "src/pages/NotFound.svelte";

    function create_fragment$1(ctx) {
    	let main;
    	let svg;
    	let line;
    	let polyline;
    	let t0;
    	let h1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			main = element("main");
    			svg = svg_element("svg");
    			line = svg_element("line");
    			polyline = svg_element("polyline");
    			t0 = space();
    			h1 = element("h1");
    			h1.textContent = "404";
    			attr_dev(line, "x1", "19");
    			attr_dev(line, "y1", "12");
    			attr_dev(line, "x2", "5");
    			attr_dev(line, "y2", "12");
    			add_location(line, file, 5, 180, 300);
    			attr_dev(polyline, "points", "12 19 5 12 12 5");
    			add_location(polyline, file, 5, 218, 338);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 24 24");
    			attr_dev(svg, "fill", "none");
    			attr_dev(svg, "stroke", "currentColor");
    			attr_dev(svg, "stroke-linecap", "round");
    			attr_dev(svg, "stroke-linejoin", "round");
    			attr_dev(svg, "class", "feather feather-arrow-left svelte-o463b0");
    			add_location(svg, file, 5, 4, 124);
    			attr_dev(h1, "class", "svelte-o463b0");
    			add_location(h1, file, 6, 4, 385);
    			attr_dev(main, "class", "svelte-o463b0");
    			add_location(main, file, 4, 0, 95);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, svg);
    			append_dev(svg, line);
    			append_dev(svg, polyline);
    			append_dev(main, t0);
    			append_dev(main, h1);

    			if (!mounted) {
    				dispose = listen_dev(main, "click", /*goBack*/ ctx[0], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('NotFound', slots, []);
    	const goBack = () => page.redirect('/');
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<NotFound> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ page, goBack });
    	return [goBack];
    }

    class NotFound extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "NotFound",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.43.1 */

    function create_fragment(ctx) {
    	let t;
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	var switch_value = /*current*/ ctx[0];

    	function switch_props(ctx) {
    		return {
    			props: { params: /*params*/ ctx[1] },
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props(ctx));
    	}

    	const block = {
    		c: function create() {
    			t = space();
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    			document.title = "DropNow";
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);

    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const switch_instance_changes = {};
    			if (dirty & /*params*/ 2) switch_instance_changes.params = /*params*/ ctx[1];

    			if (switch_value !== (switch_value = /*current*/ ctx[0])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props(ctx));
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let current;
    	let params;
    	page('/', () => $$invalidate(0, current = Home));

    	page(
    		'/room/:id',
    		(ctx, next) => {
    			$$invalidate(1, params = ctx.params);
    			next();
    		},
    		() => $$invalidate(0, current = Room)
    	);

    	page(
    		'/room-polite/:id',
    		(ctx, next) => {
    			$$invalidate(1, params = ctx.params);
    			$$invalidate(1, params['polite'] = true, params);
    			next();
    		},
    		() => $$invalidate(0, current = Room2)
    	);

    	page(
    		'/room-impolite/:id',
    		(ctx, next) => {
    			$$invalidate(1, params = ctx.params);
    			$$invalidate(1, params['polite'] = false, params);
    			next();
    		},
    		() => $$invalidate(0, current = Room2)
    	);

    	page('*', () => $$invalidate(0, current = NotFound));
    	page.start();
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		page,
    		Home,
    		Room,
    		Room2,
    		NotFound,
    		current,
    		params
    	});

    	$$self.$inject_state = $$props => {
    		if ('current' in $$props) $$invalidate(0, current = $$props.current);
    		if ('params' in $$props) $$invalidate(1, params = $$props.params);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [current, params];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
        target: document.body,
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
