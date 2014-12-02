var pathRegexp = require('path-to-regexp');

module.exports = Layer;

function Layer(path, cbs) {
  if (! (this instanceof Layer)) {
    return new Layer(path, cbs);
  }
  this.idx = 0;
  this.method = null;
  this.params = {};
  this.cbs = cbs || [];
  this.path = path;
  this.regexp = pathRegexp(path, this.keys = []);
}

Layer.prototype.match = function(path) {
  var m = this.regexp.exec(path);
  var params = this.params;
  var keys = this.keys;
  var prop, value;

  if (! m) {
    return false;
  }
  for (var i = 1, len = m.length; i < len; ++i) {
    prop = keys[i - 1].name;
    value = m[i];
    params[prop] = value;
  }
  return true;
};
