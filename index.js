var mxcMqtt = require('./lib/mxc-mqtt');
var router = require('./lib/router');

module.exports = App;

function App() {
  if (! (this instanceof App)) {
    return new App();
  }
  this.mqtt = mxcMqtt();
  this.router = router();
  this.mqtt.receive = this.receive.bind(this);
}

App.prototype.set = function(key, value) {
  this.mqtt.set(key, value);
};

App.prototype.get = function(key) {
  return this.mqtt.get(key);
};

App.prototype.use = function(fn) {
  this.router.setErrorHandler(fn);
}

App.prototype.addRoute = function(path) {
  var topic = path.replace(/(:[\w\_]+)/g, '+');
  this.mqtt.topics.push(topic);
  this.router.addRoute(arguments);
};

App.prototype.listen = function() {
  this.mqtt.listen();
};

App.prototype.receive = function(topic, message) {
  this.router.handle(topic, message);
};
