# [dj](https://github.com/ryanve/dj)

Remixable API designed for writing highly-extensible modular JavaScript.

**[CDN](http://airve.github.com)**: [dev](http://airve.github.com/js/dj/dj.js) | [min](http://airve.github.com/js/dj/dj.min.js)

```
npm install dj
```

## API

Consider **0.x** versions as **experimental**. See the [source](dj.js) for more details.

### Methods

- `dj.hook(key, value)` - set or get hooks
- `dj.hook.remix()` - create a new `hook()` function tied to a clean hash
- `dj.expand(receiver, supplier, opt_force, opt_check)` - multipurpose augmenter/extender
- `dj.mixin(supplier, opt_force, opt_check)` - augment `dj` w/ `supplier`'s props
- `dj.owns(key)` // alias for `dj.hasOwnProperty(key)`
- `dj.bridge(receiver, opt_force, opt_api)` - integrate `dj` into `receiver`
- `dj.submix(subModule, opt_force)` - integrate `subModule` into `dj`

### `@deprecated`

Replace deprecated 0.7- inheritance methods with [blood](http://github.com/ryanve/blood):

- Replace `dj.nu` with `blood.create`
- Replace `dj.pro` with `blood.line`
- Replace `dj.resample` with `blood.twin`

## License

### [dj](https://github.com/ryanve/dj) is available free under the [MIT license](http://en.wikipedia.org/wiki/MIT_License)

Copyright (C) 2012 by [Ryan Van Etten](https://github.com/ryanve)