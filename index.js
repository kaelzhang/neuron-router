'use strict';

var node_path = require('path');
var fs = require('fs');


// @param {String} path pathname of the url, starts with '/'
// @param {Object} config
//   - routers: `Array`
//   - by_pass: `String` 
exports.route = function (path, config, callback) {
  if (Object(config) !== config) {
    return null;
  }

  var routers = config.routers;

  if (!path || !routers || !routers.length) {
    return null;
  }

  var found;
  routers.some(function (router) {
    if (path.indexOf(router.location) === 0) {
      found = router;
      return true;
    }
  });

  if (!found) {
    return process.nextTick(function () {
      if (!config.by_pass) {
        return callback(null, null);
      }

      var by_pass = exports._make_sure_trailing_slash(config.by_pass);
      return callback(null, by_pass + path);
    });
  }

  var pathname = parsed.pathname.slice(router.location.length);
  // TODO: check if req.url has queries
  var filename = node_path.join(router.root, pathname);

  fs.exists(filename, function (exists) {
    if (exists) {
      return callback(filename);
    }

    callback(null, router.by_pass 
      ? node_path.join(router.by_pass, pathname)
      : null);
  });
};


exports._make_sure_trailing_slash = function (str) {
  return str.replace(/\/*$/, '/');
};
