# [dj](../../)

#### remixable API designed to write extensible modular JavaScript

```sh
$ npm install dj
```

## API ([0.x](../../releases))

<b>0.x</b> versions are **experimental**. See the [source](dj.js) for more details.

### Methods

- `dj.hook(key, value)` set or get hooks
- `dj.hook.remix()` create a new `hook()` function tied to a clean hash
- `dj.expand(receiver, supplier, opt_force, opt_check)` multipurpose augmenter/extender
- `dj.mixin(supplier, opt_force, opt_check)` augment `dj` w/ `supplier`'s props
- `dj.owns(key)` alias for `dj.hasOwnProperty(key)`
- `dj.bridge(receiver, opt_force, opt_api)` integrate `dj` into `receiver`
- `dj.submix(subModule, opt_force)` integrate `subModule` into `dj`

### `@deprecated`

#### Replace deprecated [0.7](../../tree/0.7.4)- inheritance methods with [blood](http://github.com/ryanve/blood)

- Replace `dj.nu` with `blood.create`
- Replace `dj.pro` with `blood.line`
- Replace `dj.resample` with `blood.twin`

## License: [MIT](http://en.wikipedia.org/wiki/MIT_License)

Copyright (C) 2012 by [Ryan Van Etten](https://github.com/ryanve)