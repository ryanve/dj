/*!
 * dj           remixable JavaScript
 * @link        http://github.com/ryanve/dj
 * @copyright   Ryan Van Etten (c) 2012
 * @license     MIT
 * @version     0.8.1
 */
 
/*jshint expr:true, laxcomma:true, sub:true, debug:true, eqnull:true, boss:true, node:true, evil:true,
  undef:true, unused:true, browser:true, devel:true, jquery:true, supernew:true, maxerr:100 */

(function (root, name, make) {
    if (typeof module != 'undefined' && module['exports'])
        module['exports'] = make.call(root); 
    else root[name] = make.call(root);
}(this, 'dj', function() {

    var hook
      , methods
      , globe = this || window
      , OP = Object.prototype
      , owns = OP.hasOwnProperty

      , ES5lineage = (function(Object) {
            // Feature test: check that Object.create exists and 
            // that it properly implements the full capabilities
            // of the first param. (Does not test the 2nd param.)
            // Read @link github.com/kriskowal/es5-shim/pull/118
            var o, k = 'k';
            function fun() {}
            fun[k] = 'object';
            try {
                o = Object.create(null); // attempt to create an object with *zero* properties
                if (!o || o.toString || null !== Object.getPrototypeOf(o)) { return false; }
                if (!Object.create([]).pop || !(o = Object.create(fun))) { return false; }
                return typeof o === o[k] && Object.getPrototypeOf(o) === fun;
            } catch (e) { return false; }
        }(Object))
        
        /** @deprecated Replace with `blood.line` @link github.com/ryanve/blood */ 
      , pro = (ES5lineage && Object.getPrototypeOf) || function(ob) {
            return void 0 !== ob["__proto__"] ? ob["__proto__"] : ob.constructor ? ob.constructor.prototype : OP;
        }

        /**
         * @deprecated Replace with `blood.create` @link github.com/ryanve/blood
         * Create a new empty object whose prototype is set to the supplied arg. 
         * Uses to native Object.create when possible. The fallback supports
         * the *first arg* only. Adapted from @link github.com/kriskowal/es5-shim
         * @link   bit.ly/mdn-object-create
         * @link   github.com/kriskowal/es5-shim/pull/118
         * @param  {Object|Function|Array|null}  parent  (typeof "object"|"function")
         * @return {Object}  is an empty object that inherits properties from `parent`
         */
      , nu = (ES5lineage && Object.create) || function (parent) {
            /** @constructor */
            function F() {} // An empty constructor.
            var object; // Becomes an `instanceof F`            
            if (null === parent) { return { "__proto__": null }; }
            F.prototype = parent;  // Set F's prototype to the parent Object
            object = new F; // Get an empty object (instance) that inherits `parent`
            object["__proto__"] = parent; // ensure `Object.getPrototypeOf` will work in IE
            return object;
        };
    
    /**
     * Logic for discerning arrays/arr-like object from other objects or types.
     * If `o` is a valid "object" w/ a non-NaN "number" length prop, it returns 
     * the length. Otherwise it returns false.
     * @param  {*}  o  is the object (or unknown) in question
     * @return {number|boolean}
     */
    function count(o) {
        return !!o && typeof o == 'object' && !o.nodeType && o != o.window && (o = o.length) === +o && o;
    }
    
    /**
     * Push an item (or list) into a stack and return the stack.
     * @param  {Object|Array} target  receiver (becomes array-like if not already)
     * @param  {*=}           item    value (or list) to push into `stack`
     */
    function stack(target, item) {
        var h, i = target.length;
        i = i > 0 ? i >> 0 : 0; // non-negative integer
        if (null != item) {
            h = count(item);
            if (false === h) {
                target[i++] = item; // node|scalar|function|not arr-like
            } else for (; i < h; i++) {
                target[i] = item[i]; // array-like
            }
        }
        target.length = i;
        return target;
    }

    /**
    * $()
    * @param  {*=}      item   CSS selector | DOM node(s) | fn to fire | anything
    * @param  {Object=} root   node(s) from which to base selector queries
    * @return {Dj}
    */  
    function dj(item, root) {
        return new Dj(item, root);
    }

    /**
     * @constructor
     * @param  {*=}      item   CSS selector | DOM node(s) | fn to fire | anything
     * @param  {Object=} root   node(s) from which to base selector queries
     * adapted from jQuery and ender
     */  
    function Dj(item, root) {
        this.length = 0; // Ensure `this` owns "length" like a real array
        // The logic sequence here is designed to maximize extensibility.
        // Start @ strings so the result parlays into the subsequent checks
        // The 'closure' hook is designed for a closure or ready shortcut
        // The .selector property only applies to strings and is otherwise unset.
        item = typeof item == 'string' ? hook('select')(this['selector'] = item, root) : item;
        typeof item == 'function' ? hook('closure')(item, root) : null != item && stack(this, item);
    }

    // sync the prototypes
    // re: github.com/ender-js/ender-js/pull/17
    dj['fn'] = dj.prototype = Dj.prototype;

    dj['fn']['$'] = dj; // reference to self

    /**
     * @deprecated Replace with `blood.twin` @link github.com/ryanve/blood
     * Make new empty object w/ same proto as the `source`. Then
     * mixin the owned props from the `source` into the new object. 
     * Quasi deep clone (done partially via inheritance)
     * @param  {(Object|Function|null)=}  source
     * @param  {(Object|Function|null)=}  opt_parent
     * @return {Object}
     */
    function resample(source, opt_parent) {
        var n, r;
        source = arguments.length && true !== source ? source : this;
        opt_parent = void 0 === opt_parent ? pro(source) : opt_parent;
        r = nu(opt_parent);
        for (n in source) {
            // owned props enumerate first so stop when unowned
            if (!owns.call(source, n)) { break; }
            r[n] = source[n]; 
        }
        return r;
    }

    /**
     * Multi-purpose extdj/augmenter, with simple yet very useful options, called 
     * expand b/c many libs implement extend/augment methods, so this makes it easier 
     * to integrate ( and drop preconceived notions about what it should do ). 
     * Expand your mind ;]
     *
     * @param  {Object|Function}     receiver
     * @param  {Object|Function}     supplier
     * @param  {boolean=}            force     whether to overwrite existing props
     *                                         true  ==> no typechecking is done.
     *                                         false ==> receiver[n] must be null|undefined.
     *                                                   supplier[n] must NOT be null|undefined.
     * @param  {(boolean|Function)=}  check    whether supplier props must be owned (or a 
     *                                         custom test, default: false)
     */
    function expand(receiver, supplier, force, check) {
        var n;
        if (null == receiver) { throw new TypeError('@expand'); }
        if (null == supplier) { return receiver; }
        force = force === true; // must be explicit
        check = check === true ? owns : check;
        for (n in supplier) {
            if (force || null == receiver[n] && null != supplier[n]) {
                if (!check || check.call(supplier, n)) {
                    receiver[n] = supplier[n];
                }
            }
        }
        return receiver;
    }

    /**
     * Mixin owned enumerable props from the `supplier` into `this`.
     * @this   {(Object|Function)}            is the receiver
     * @param  {(Object|Function)}  supplier  is the supplier
     * @param  {boolean=}           force     whether to overwrite existing props
     * @param  {boolean=}           check     whether props must be owned (default: true)
     */
    function mixin(supplier, force, check) {
        if (this === globe) { throw new TypeError('@mixin'); }
        return expand(this, supplier, force, check !== false);
    }

    /**
     * bridge()      Integrate applicable methods|objects into a host. Other 
     *               types (number|string|undefined|boolean|null) are not bridged. 
     *               `this` augments the receiver `r`. `bridge()` is designed for
     *               merging jQueryish modules, thus `.fn` props bridge one level deep.
     *
     *               Methods|objects whose `.relay` property is set to `false` get
     *               skipped. If the `.relay` property is a function, it is fired 
     *               with `this` being the method|object and the 1st arg being the 
     *               main scope (e.g. $ function) of the receiving api. This provides
     *               a way for the method|object to be adapted to the receiving api.
     *
     *               If the `.relay` returns a truthy value (such as new func) then that 
     *               value is transferred instead of the orig. If the relay returns `false` 
     *               then the method|ob is skipped. If it returns any other falsey value 
     *               then the transferred method will default back to the orig. So in effect, 
     *               the `.relay` prop defaults to `true` and it is not necessary to define 
     *               it for methods|obs that are to be transferred as is.
     *       
     * @this  {Object|Function}                supplier
     * @param {Object|Function}         r      receiver
     * @param {boolean=}                force  whether to overwrite existing props (default: false)
     * @param {(Object|Function|null)=} $      the top-level of the host api (default: `r`)
     *                                         For default behavior `$` should be omitted or set to 
     *                                         `undefined`. This param allows you to bridge to a receiver, 
     *                                         but relay methods based on a another host, for example 
     *                                         `someModule.bridge({}, false, jQuery)`. Set `$` explicity
     *                                         to `null` *only* if you want to communicate to relays that
     *                                         there should be *no* main api.                                   
     */
    function bridge(r, force, $) {
        var v, k, relay, s = this; // s is the supplier
        if (!r || s === globe) { return; }
        force = true === force; // require explicit true to force
        $ = typeof $ == 'function' || typeof $ == 'object' ? $ : r; // allow null

        for (k in s) {
            v = s[k];
            if (typeof v == 'function' || typeof v == 'object' && v) {
                if ('fn' === k && v !== s) {
                    // 2nd check above prevents infinite loop 
                    // from `.fn` having ref to self on it.
                    bridge.call(v, r[k], force, $);
                } else if (force ? r[k] !== r && r[k] !== $ : r[k] == null) {
                    // The check above prevents overwriting receiver's refs to
                    // self (even if forced). Now handle relays and the transfer:
                    relay = v['relay'];
                    if (typeof relay == 'function') {
                        // Fire relay functions. I haven't fully solidified the
                        // relay call sig. Considering: .call(v, $, r[k], k, r)
                        // This passes the essentials:
                        relay = relay.call(v, $, r[k]);
                    }
                    if (relay !== false) {// Provides a way to bypass non-agnostic props.
                        // Transfer the value. Default to the orig supplier value:
                        r[k] = relay || v;
                    }
                }
            }
        }
        return r; // receiver
    }// bridge
    
    // signify that this bridge() is module agnostic
    bridge['relay'] = true;

    /**
     * Create a new hook() function tied to a clean hash.
     * @return {Function}
     */
    function hookRemix() {
        var curr = {}, info = {};
          
        /** 
         * Method for setting/getting hooks
         * @param {*=}  k     key
         * @param {*=}  v     value
         * @param {*=}  guard
         */
        function hook(k, v, guard) {
            var n, bool, prefix; 
            if (typeof k == 'string' || k === +k) {
                if (void 0 === v || guard && v === +v)
                    return owns.call(curr, k) ? curr[k] : void 0;
                if (false === v || false === info[k]) {
                    info[k] = false;
                } else if (v) {
                    if (typeof v == 'function')
                        curr[k] = v;
                    else if (typeof v == 'object')
                        curr[k] = (n = hook(k)) ? expand(n, v, true, true) : v;
                    else return;
                    hook['trigger'] && hook['trigger'](k);
                    return v;
                }
            } else if (k && true !== k) {
                prefix = typeof v == 'string' ? v : '';
                bool = false !== v && false !== guard;
                for (n in k) {
                    hook(prefix + n, k[n]);
                    bool || hook(prefix + n, bool); 
                }
                return k;
            } else if (!arguments.length) {
                return expand({}, curr, true, true);
            }
        }
        
        // Allow an existing `hook()` to be bridged to another module so that
        // they can share hooks. (In other words, don't set its relay to false.) 
        // Provide the remix method as a way to explicitly redefine it:
        hook['remix'] = hookRemix;
        return hook;
    }
    
    hook = hookRemix();
    
    methods = {
        'hook': hook
      , 'owns': owns
      , 'pro': pro
      , 'count': count
      , 'stack': stack
      , 'nu': nu
      , 'bridge': bridge
      , 'resample': resample
      , 'expand': expand
      , 'mixin': mixin
      , 'submix': function(subModule, force) {
            return bridge.call(subModule, this, force);
        }
    };
    
    expand(dj, methods, true);

    // set the hook and return `dj`
    return hook('dj', dj);
}));