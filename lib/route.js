'use strict';

module.exports = Route

var make_array = require('make-array')
var utils = require('./utils')


function Route (route) {
  if (!route || !route.location || !route.root) {
    return {
      location: null,
      root: [],
      default: false,
      by_pass: null,
      with_location: false
    }
  }

  this.location = utils.make_sure_leading_slash(route.location)
  this.root = make_array(route.root)
  this.default = !!route.default
  this.by_pass = route.by_pass
  this.with_location = !!route.with_location
}


Route.prototype.add = function (roots) {
  make_array(roots).forEach(function (root) {
    if (!root || ~this.root.indexOf(root)) {
      return
    }

    this.root.push(root)

  }.bind(this))

  return this
}
