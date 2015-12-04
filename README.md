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

<!-- description -->

## Install

```sh
$ npm install neuron-router --save
```



## Usage

config:

```js
{
  routers: [
    {
      location: '/mod',
      root: '/home/my/.static_modules/'
    },
    {
      location: '/old',
      root: '/data/public',

      // If the current router matches the pathname, 
      // but the file does not exist, it will use the this `by_pass`
      by_pass: 'http://domain.com'
    }
  ],

  // If no routers match the given pathname, it will use the by_pass url
  by_pass: 'http://domain2.com/'
}
```

```js
var router = require('neuron-router');
var pathname = '/pathname/to/a.js'
router.route(pathname, config, function (filename, fallback_url) {
  
});
```

- pathname `String` pathname of the url(`require('url').parse(url).pathname`)
- config `Object` see above
- filename `String` if any router matches the `pathname`, and the routed filename exists, it will not be null.
- fallback ``

## License

MIT
