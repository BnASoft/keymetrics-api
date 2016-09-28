'use strict';

var Bucket  = require('./Bucket.js');
var Authenticate = require('./Authenticate');
var EventEmitter2 = require('eventemitter2');
var Realtime = require('./Realtime');

function Keymetrics(opts, cb) {
  var self = this;
  if (!(this instanceof Keymetrics)) {
    return new Keymetrics(opts, cb);
  }
  opts = opts || {};

  this.api = {
    host : opts.host ||  'http://app.km.io',
    port : opts.port || '3000',
    basePath : opts.path || '/api'
  };
  opts.root_url = this.api.host + ':' + this.api.port + this.api.basePath;

  if (!opts.bus)
    opts.bus = new EventEmitter2({
      wildcard: true,
      delimiter: ':'
    });
  
  this.bus = opts.bus;

  this.auth = new Authenticate(opts);
  this.bucket = new Bucket(opts);
  this.realtime = new Realtime(opts);
  this.options = opts;

  var successCb = function (data) { 
    self.bus.removeListener('error:auth', errorCb); 
    return cb(null, self); 
  };
  var errorCb = function (error) {
    self.bus.removeListener('auth:ready', successCb); 
    return cb(error);
  };
  if (typeof(cb) !== undefined) {
    this.bus.once('auth:ready', successCb)
    this.bus.once('error:auth', errorCb);
  }
};

module.exports = Keymetrics;
