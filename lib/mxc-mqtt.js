
var q = require('q');
var mqtt = require('mqtt');
var os = require('os');
var _ = require('lodash-node');
var log = require('sanji-node-logger')('sanji');

module.exports = MxcMqtt;

function MxcMqtt() {
  if (! (this instanceof MxcMqtt)) {
    return new MxcMqtt();
  }
  this.mqtt = mqtt;
  this.settings = {};
  this.defaultConfig();
  this.topics = [];
}

MxcMqtt.prototype.set = function(key, value) {
  this.settings[key] = value;
};

MxcMqtt.prototype.get = function(key) {
  return this.settings[key];
};

MxcMqtt.prototype.defaultConfig = function() {
  this.set('name', os.hostname());
  this.set('port', 1883);
  this.set('host', 'localhost');
  this.set('qos', 2);
};

MxcMqtt.prototype.listen = function() {
  this.client = this.mqtt.createClient(this.get('port'), this.get('host'));
  this.client.on('message', this.receive.bind(this));
  this.client.on('connect', this.connect.bind(this));
  this.client.on('close', this.close.bind(this));
  this.client.on('error', this.error.bind(this));
};

MxcMqtt.prototype.close = function(err) {
  log.info('mqtt closed: ', err);
};

MxcMqtt.prototype.receive = function(topic, message) {
  log.info('MxcMqtt', topic, message);
};

MxcMqtt.prototype.error = function(err) {
  log.info('mqtt error: ', err);
};

MxcMqtt.prototype.subscribe = function(topic, options) {
  var deferred = q.defer();
  this.client.subscribe(topic, options, function(err) {

    if (err) {
      log.error('subscribe error: ', err);
      return deferred.reject(err);
    }
    return deferred.resolve();
  });
  return deferred.promise;
};

MxcMqtt.prototype.connect = function(packet) {

  log.info('connected: ', packet);

  var self = this;
  self.topics.forEach(function(topic) {
    self.subscribe(topic)
      .then(function() {
        log.info(topic + ' has been subscribed');
      })
      .catch(function(err) {
        log.error('subscribe error: ', err);
      });
  });
};
