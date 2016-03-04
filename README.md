[![Build Status](https://travis-ci.org/kaelzhang/neuron-router.svg?branch=master)](https://travis-ci.org/kaelzhang/neuron-router)
<!-- optional npm version
[![NPM version](https://badge.fury.io/js/neuron-router.svg)](http://badge.fury.io/js/neuron-router)
-->
<!-- optional npm downloads
[![npm module downloads per month](http://img.shields.io/npm/dm/neuron-router.svg)](https://www.npmjs.org/package/neuron-router)
-->
<!-- optional dependency status
[![Dependency Status](https://david-dm.org/kaelzhang/neuron-router.svg)](https://david-dm.org/kaelzhang/neuron-router)
-->

# neuron-router

Utility method to route a given url according to routing config.

## Install

```sh
$ npm install neuron-router --save
```

## Usage

config:

```js
{
  routes: [
    {
      location: '/mod',
      root: '/home/my/.static_modules/'
    },
    {
      location: '/old',
      root: ['/data/public2', '/data/public'],

      // If the current router matches the pathname,
      // but the file does not exist, it will use the this `by_pass`
      by_pass: 'http://domain.com'
    },
    {
      location: '/new',
      root: '/data/',
      with_location: true
    }
  ],

  // If no router.location matches the given pathname,
  // it will search this directory
  root: '/old-data',

  // If specified and neuron-router find no corresponding file in local machine,
  // it will use the by_pass url
  by_pass: 'http://domain2.com/'
}
```

### router.route(pathname, callback)

```js
var router = require('neuron-router')(config);
var pathname = '/pathname/to/a.js'
router.route(pathname, function (filename, fallback_url) {

});
```

- **config** `Object` see above for examples

- **pathname** `String` pathname of the url(`require('url').parse(url).pathname`)
- **filename** `String` if any router matches the `pathname`, and the routed filename exists, it will not be null.
- **fallback_url** `String`

If the given `pathname` matches the `router.location`, neuron-router will search the local file within `router.root`,
and if found, the `filename` of the found file will be passed to `callback`.
Otherwise, `filename` will be `null`, and if `router.by_pass` or `config.by_pass` is defined,
the resolved fallback url will passed to `callback` as the second parameter.

##### route.root `path`

`route.root` can be an array of paths, neuron-router will search the file from each path one by one.

##### route.with_location `Boolean`

Suppose

- `pathname`: `'/path/to/a.js'`
- `route.location`: `/path`
- `route.root`: `/data/`
- `route.with_location`: **`true`**

Then, neuron-router will search `'/data/path/to/a.js'` instead of `/data/to/a.js`.

And if `route.with_location` is `false`, it will search `/data/to/a.js`.

### router.add(routes)

Adds a new route or array of routes. If the `route.location` is already added, the `route.root` will be concated with the root of the existed route.

- **routes** `Object|Array.<route>`

## License

MIT
