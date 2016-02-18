'use strict'

module.exports = router
router.Router = Router


var node_path = require('path')
var fs = require('fs')
var some = require('async-some')
var make_array = require('make-array')
var unique = require('array-unique')


function router(options) {
  return new Router(options)
}


function Router(options) {
  this.options = {
    routes: []
  }

  if (Object(options) !== options) {
    return
  }

  options.by_pass && this.by_pass(options.by_pass)
  options.root && this.root(options.root)
  options.routes && options.routes.length && this.add(options.routes)
}


Router.prototype.route = function(pathname, callback) {
  router._route(pathname, this.options, callback)
}


Router.prototype.by_pass = function(by_pass) {
  if (!arguments.length) {
    return this.options.by_pass
  }

  this.options.by_pass = by_pass
  return this
}


Router.prototype.root = function(root) {
  var options = this.options

  if (!arguments.length) {
    return options.root
  }

  if (!options.root) {
    options.root = []
  }

  options.root = unique(options.root.concat(root))
  return this
}


Router.prototype.add = function (routes) {
  var r = this.options.routes
  make_array(routes).forEach(function (route) {
    if (!route || !route.location || !route.root) {
      return
    }

    route.root = make_array(route.root)
    if (route.default && !this.default_route) {
      this._default_route = route.default
    }
    r.push(route)

  }.bind(this))

  return this
}


Router.prototype.routes = function() {
  return this.options.routes
}


Router.prototype.default_route = function() {
  return this._default_route
}


Router.prototype.clear = function() {
  this.options.routes.length = 0
  return this
}


// @param {String} path pathname of the url, starts with '/'
// @param {Object} config
//   - routes: `Array`
//   - by_pass: `String`
router._route = function (path, config, callback) {
  function none () {
    process.nextTick(global_by_pass)
  }

  function global_by_pass () {
    if (!config || !config.by_pass) {
        return callback(null, null)
      }

      var url = utils.join_url_path(config.by_pass, path)
      return callback(null, url)
  }

  if (Object(config) !== config) {
    return none()
  }

  var routes = config.routes
  if (!path || !routes || !routes.length) {
    return none()
  }

  routes = [].concat(routes)
  var default_root = config.root
  var atom = {}
  if (default_root) {
    // adds default router to the end
    routes.push({
      root: default_root,
      is_default: atom
    })
  }

  var found
  var pathname
  routes.some(function (route) {
    if (route.is_default === atom) {
      found = route
      pathname = path
      return true
    }

    var l = route.location
    if (!l || path.indexOf(l) !== 0) {
      return
    }

    var p = route.with_location
      ? path
      : path.slice(l.length)

    if (
      // location `/a` should not match `/a.js`,
      /\/$/.test(l)
      || /^\//.test(p)
    ) {
      found = route
      pathname = p
      return true
    }
  })

  if (!found) {
    return none()
  }

  function exists (root, callback) {
    var filename = utils.join_file_path(root, pathname)
    fs.exists(filename, function (exists) {
      if (exists) {
        return callback(null, filename)
      }

      // not found
      callback(null)
    })
  }

  var roots = found.root
  some(roots, exists, function (err, filename) {
    // actually, there is no `err`.

    if (filename) {
      return callback(filename, null)
    }

    if (!found.by_pass) {
      return global_by_pass()
    }

    callback(
      null,
      found.by_pass
        ? utils.join_url_path(found.by_pass, pathname)
        : null
    )
  })
}


var utils = {}
router.utils = utils


utils.make_sure_trailing_slash = function (str) {
  return str.replace(/\/*$/, '/')
}


utils.remove_leading_slash = function (str) {
  return str.replace(/^\/+/, '')
}


// Only used for the situation of neuron-router
utils.join_file_path = function (a, b) {
  b = utils.remove_leading_slash(b)
  return node_path.join(a, b)
}


// Only used for the situation of neuron-router
utils.join_url_path = function (a, b) {
  a = utils.make_sure_trailing_slash(a)
  b = utils.remove_leading_slash(b)
  return a + b
}
