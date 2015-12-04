'use strict';

var expect = require('chai').expect;
var neuron_router = require('../');
var run = require('run-mocha-cases');
var node_path = require('path');
var clone = require('clone');

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
    },

    {
      d: 'location with ending slash',
      a: '/b/b.js',
      e: [
        root('b/b.js'),
        null
      ]
    },

    {
      d: 'not found, no global by_pass',
      a: '/a/not-found.js',
      e: [
        null,
        null
      ]
    },

    {
      d: 'not found, global by_pass',
      a: '/c/not-found.js',
      r: function (path) {
        var done = this.async();
        neuron_router.route(path, {
          routers: routers,
          by_pass: 'http://domain.com'
        }, done);
      },
      e: [
        null,
        'http://domain.com/c/not-found.js'
      ]
    },

    {
      d: 'not found, global by_pass(ends with slash)',
      a: '/c/not-found.js',
      r: function (path) {
        var done = this.async();
        neuron_router.route(path, {
          routers: routers,
          by_pass: 'http://domain.com/'
        }, done);
      },
      e: [
        null,
        'http://domain.com/c/not-found.js'
      ]
    },

    {
      d: 'not found, global by_pass(ends with slash)',
      a: '/c/not-found.js',
      r: function (path) {
        var done = this.async();
        neuron_router.route(path, {
          routers: routers,
          by_pass: 'http://domain.com/'
        }, done);
      },
      e: [
        null,
        'http://domain.com/c/not-found.js'
      ]
    },

    {
      d: 'not found, sub by_pass(ends with slash)',
      a: '/a/not-found.js',
      r: function (path) {
        var done = this.async();
        var r = clone(routers);
        r[0].by_pass = 'http://domain2.com/'

        neuron_router.route(path, {
          routers: r,
          by_pass: 'http://domain.com'
        }, done);
      },
      e: [
        null,
        'http://domain2.com/not-found.js'
      ]
    },

    {
      d: 'not found, sub by_pass(not ends with slash)',
      a: '/a/not-found.js',
      r: function (path) {
        var done = this.async();
        var r = clone(routers);
        r[0].by_pass = 'http://domain2.com'

        neuron_router.route(path, {
          routers: r,
          by_pass: 'http://domain.com'
        }, done);
      },
      e: [
        null,
        'http://domain2.com/not-found.js'
      ]
    }
  ]);

