'use strict'

module.exports = router
router.Router = Router


var node_path = require('path')
var fs = require('fs')
var some = require('async-some')
var make_array = require('make-array')
var unique = require('array-unique')
var Route = require('./lib/route')
var utils = require('./lib/utils')

router.utils = utils


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
    route = new Route(route)

    if (!route.location) {
      return
    }

    var route_found
    r.some(function (exists_route) {
      if (exists_route.location === route.location) {
        route_found = exists_route
        return true
      }
    })

    // If the location is already in the router,
    // then concat the roots
    if (route_found) {
      route_found.add(route.root)
      return
    }

    r.push(route)

    if (route.default && !this.default_route) {
      this._default_route = route
    }

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
  path = utils.make_sure_leading_slash(path)

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
    // The last route
    if (route.is_default === atom) {
      found = route
      pathname = path
      return true
    }

    var l = route.location
    // must starts with 0
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
