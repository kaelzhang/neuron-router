'use strict'

var expect = require('chai').expect
var neuron_router = require('../')
var run = require('run-mocha-cases')
var node_path = require('path')
var clone = require('clone')

var _root = node_path.join(__dirname, 'fixtures')

function root (path) {
  return node_path.join(_root, path)
}

var routes = [
  {
    location: '/a',
    root: root('a')
  },

  {
    location: '/b/',
    root: root('b')
  },

  {
    location: '/c',
    root: [root('a'), root('b')]
  },

  {
    location: '/d',
    root: [root('b'), root('c')]
  },

  {
    location: '/e',
    root: [root('e')],
    with_location: true
  }
]

run
  .description('router.route()')
  .runner(function (path) {
    var done = this.async()
    neuron_router({
      routes: routes
    }).route(path, done)
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
        var done = this.async()
        neuron_router({
          routes: routes,
          by_pass: 'http://domain.com'
        }).route(path, done)
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
        var done = this.async()
        neuron_router({
          routes: routes,
          by_pass: 'http://domain.com/'
        }).route(path, done)
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
        var done = this.async()
        neuron_router({
          routes: routes,
          by_pass: 'http://domain.com/'
        }).route(path, done)
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
        var done = this.async()
        var r = clone(routes)
        r[0].by_pass = 'http://domain2.com/'

        neuron_router({
          routes: r,
          by_pass: 'http://domain.com'
        }).route(path, done)
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
        var done = this.async()
        var r = clone(routes)
        r[0].by_pass = 'http://domain2.com'

        neuron_router({
          routes: r,
          by_pass: 'http://domain.com'
        }).route(path, done)
      },
      e: [
        null,
        'http://domain2.com/not-found.js'
      ]
    },

    {
      d: '1.1.0: multi root, not found in first root',
      a: '/c/c.js',
      e: [
        root('b/c.js'),
        null
      ]
    },

    {
      d: '1.1.0: multi root, found in first root',
      a: '/d/c.js',
      e: [
        root('b/c.js'),
        null
      ]
    },

    {
      d: '1.1.0: with_location',
      a: '/e/e.js',
      e: [
        root('e/e/e.js'),
        null
      ]
    },

    {
      d: '1.1.0: with_location, not found',
      a: '/e/f.js',
      e: [
        null,
        null
      ]
    },

    {
      d: '1.3.0: default root',
      r: runner_for_default_root,
      a: '/g/f.js',
      e: [
        root('f/g/f.js'),
        null
      ]
    }
  ])


function runner_for_default_root (path) {
  var done = this.async()
  var r = clone(routes)
  neuron_router({
    root: root('f'),
    routes: r
  }).route(path, done)
}

