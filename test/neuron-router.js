'use strict';

var expect = require('chai').expect;
var neuron_router = require('../');
var run = require('run-mocha-cases');
var node_path = require('path');

var _root = node_path.join(__dirname, 'fixtures')

function root (path) {
  return node_path.join(_root, path);
}

var routers = [
  {
    location: '/a',
    root: root('a')
  },

  {
    location: '/b/',
    root: root('b')
  }
];

run
  .description('router.route()')
  .runner(function (path) {
    var done = this.async();
    neuron_router.route(path, {
      routers: routers
    }, done);
  })
  .start([
    {
      d: 'normal',
      a: '/a/a.js',
      e: [
        root('a/a.js'),
        null
      ]
    }
  ]);