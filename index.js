'use strict';

var node_path = require('path');
var fs = require('fs');


// @param {String} path pathname of the url, starts with '/'
// @param {Object} config
//   - routers: `Array`
//   - by_pass: `String` 
exports.route = function (path, config, callback) {
  function none () {
    process.nextTick(function () {
      if (!config.by_pass) {
        return callback(null, null);
      }

      var by_pass = exports._make_sure_trailing_slash(config.by_pass);
      return callback(null, by_pass + path);
    });
  }

  if (Object(config) !== config) {
    return none();
  }

  var routers = config.routers;

  if (!path || !routers || !routers.length) {
    return none();
  }

  var found;
  var pathname;
  routers.some(function (router) {
    if (path.indexOf(router.location) !== 0) {
      return;
    }

    var p = path.slice(router.location.length);

    if (/^\//.test(p)) {
      found = router;
      pathname = exports._remove_leading_slash(p);
      return true;
    }
  });

  if (!found) {
    return none();
  }

  // TODO: check if req.url has queries
  var filename = node_path.join(found.root, pathname);

  fs.exists(filename, function (exists) {
    if (exists) {
      return callback(filename, null);
    }

    callback(
      null, 
      router.by_pass 
        ? node_path.join(router.by_pass, pathname)
        : null
    );
  });
};


exports._make_sure_trailing_slash = function (str) {
  return str.replace(/\/*$/, '/');
};


exports._remove_leading_slash = function (str) {
  return str.replace(/^\/+/, '');
};
