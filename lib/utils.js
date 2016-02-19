'use strict'

var utils = exports
var node_path = require('path')

utils.make_sure_trailing_slash = function (str) {
  return str.replace(/\/*$/, '/')
}


utils.remove_leading_slash = function (str) {
  return str.replace(/^\/+/, '')
}

// a/ -> /a/
utils.make_sure_leading_slash = function (str) {
  return str.replace(/^\/*/, '/')
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
