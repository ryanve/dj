(function (root, name, make) {
    if (typeof module != 'undefined' && module['exports']) module['exports'] = make(); 
    else root[name] = make();
}(this, 'dj', function() {

    var hook
      , methods
      , globe = this || window
      , OP = Object.prototype
      , owns = OP.hasOwnProperty;
    
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
     * @param  {*=} item    value (or list) to push into `stack`
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
     * @deprecated Replace with `blood.twin`
     * @link   github.com/ryanve/blood
     * @link   stackoverflow.com/q/16594717/770127
     * @return {Object}
     */
    function resample() {
        if (typeof blood != 'undefined')
            return blood.twin.apply(this, arguments);
        throw new Error('@deprecated @resample');
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
        if (null == receiver) throw new TypeError('@expand');
        if (null == supplier) return receiver;
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
        if (this == globe) throw new Error('@this');
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
      , 'count': count
      , 'stack': stack
      , 'nu': Object.create
      , 'pro': Object.getPrototypeOf
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