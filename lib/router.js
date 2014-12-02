var Layer = require('./layer');
var clone = require('clone');

module.exports = Router;

function Router() {
  if (! (this instanceof Router)) {
    return new Router();
  }
  this.routes = [];
  this.errorHandler = function() {};
}

Router.prototype.addRoute = function() {

  var args = [].slice.call(arguments[0], 0);
  var path = args[0];
  var cbs = [];
  for (var i = 1, len = args.length; i < len; ++i) {
    var cb = args[i];
    if ('function' !== typeof cb) {
      var type = {}.toString.call(cb);
      throw new Error('Route.addRoute() requires callback function but got a ' + type);
    }
    cbs.push(cb);
  }

  var layer = Layer(path, cbs);
  this.routes.push(layer);
};

Router.prototype.match = function(path) {
  for (var i = 0, len = this.routes.length; i < len; i++) {
    var layer = this.routes[i];
    if (layer.match(path)) {
      return layer;
    }
  }
  return null;
};

function genNext(layer, req, res, errorHandler) {
  return function(err) {

    var cb = layer.cbs[layer.idx++];
    if (cb && (! err)) {
      var next = genNext(layer, req, res, errorHandler);
      cb(req, res, next);
    }
    if (err) {
      var next = genNext(layer, req, res, errorHandler);
      return errorHandler(err, req, res, next);
    }
  };
}

Router.prototype.setErrorHandler = function(fn) {
  this.errorHandler = fn;
};

Router.prototype.handle = function(path, message) {

  var matched = this.match(path);
  if (! matched) {
    return;
  }

  var layer = clone(matched);
  layer.idx = 0;

  var cb = layer.cbs[layer.idx++];
  if (! cb) {
    return;
  }

  var req = {};
  req.params = clone(layer.params);
  req.body = {};
  req.path = layer.path;
  try {
    req.body = JSON.parse(message);
  } catch (e) {
    // json parse failed
  }

  // TODO:
  var res = {};
  res.locals = {};
  var next = genNext(layer, req, res, this.errorHandler);

  cb(req, res, next);
};
