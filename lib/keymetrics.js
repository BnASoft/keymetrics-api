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
      delimiter: ':',
      maxListeners: 20
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

Keymetrics.prototype.init = function (cb) {
  var self = this;
  var cb = cb || function(){};

  this.auth.init(this.options, function(err, res) {
    if (err) return cb(err);

    //If public key already setup
    if (self.options.public_key) {
      self.bucket.retrieve(self.options.public_key, function(err, res) {
        if (err) return cb(err);

        self.bus.emit("bucket:active", res._id);
        //If realtime is to be launched at start
        if (self.options.realtime)
          self.realtime.init(function (err, res) {
              return cb(err, res);
          });
        else
          return cb(null, res);
      });
    }
    else {
      return cb(new Error('Please setup public key for Keymetrics'));
    }
  });
};

module.exports = Keymetrics;
