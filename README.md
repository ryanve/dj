[dj](https://github.com/ryanve/dj)
====

Remixable hook/bridge/relay API designed for writing highly-extendable modular JavaScript.

**[CDN](http://airve.github.com)**: [dev](http://airve.github.com/js/dj/dj.js) | [min](http://airve.github.com/js/dj/dj.min.js)

```
npm install dj
```

Docs are comin' soon. The [source](https://github.com/ryanve/dj/blob/master/dj.js) is already documented. 

### overview

```js
dj.hook(key, value) // set or get hooks
dj.hook.remix() // create a new `hook()` function tied to a clean hash
dj.resample(object, opt_parent); // quasi deep clone ( or dj.resample() )
dj.nu(parent); // cross-browser Object.create(parent)
dj.pro(o); // cross-browser Object.getPrototypeOf(o)
dj.expand(receiver, supplier, opt_force, opt_check); // multipurpose augmenter/extender
dj.mixin(supplier, opt_force, opt_check); // augment `dj` w/ `supplier`'s props
dj.owns(key); // ~ dj.hasOwnProperty(key) (direct native reference)
dj.bridge(receiver, opt_force, opt_api) // integrate `dj` into `receiver` (module agnostic)
dj.submix(subModule, opt_force) // integrate `subModule` into `dj` (module agnostic)
```