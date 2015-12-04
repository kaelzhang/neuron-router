'use strict';

var expect = require('chai').expect;
var neuron_router = require('../');
var run = require('run-mocha-cases');

var routers = [
  {
    location: '/'
  }
];

run
  .description('router.route()')
  .runner(function (path) {
    var done = this.async();
    neuron_router.route(path, routers, done);
  })
  .start([
    {
      d: ''
    }
  ]);