'use strict';

var Bucket  = require('./Bucket.js');
var User  = require('./User.js');
var Authenticate = require('./Authenticate');
var Realtime = require('./Realtime');
var Node = require('./Node');
var Changelog = require('./Changelog');
var EventEmitter2 = require('eventemitter2');

var Keymetrics = function (opts) {
  var self = this;
  if (!(this instanceof Keymetrics)) {
    return new Keymetrics(opts);
  }
  opts = opts || {};

  this.api = {
    host : opts.host ||  'http://app.km.io:3000',
    basePath : opts.path || '/api'
  };
  opts.root_url = this.api.host + this.api.basePath;

  if (!opts.bus)
    opts.bus = new EventEmitter2({
      wildcard: true,
      delimiter: ':'
    });
  
  this.bus = opts.bus;

  this.auth = new Authenticate(opts);
  this.node = new Node(opts);
  this.changelog = new Changelog(opts);
  this.bucket = new Bucket(opts);
  this.realtime = new Realtime(opts);
  this.user = new User(opts);
  this.options = opts;
};

module.exports = Keymetrics;
