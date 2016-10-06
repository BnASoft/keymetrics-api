'use strict';

var Bucket  = require('./Bucket.js');
var User  = require('./User.js');
var Authenticate = require('./Authenticate');
var Realtime = require('./Realtime');
var Node = require('./Node');
var Changelog = require('./Changelog');
var EventEmitter2 = require('eventemitter2');


/**
 * @constructor
 * Keymetrics
 *
 * @param {object} opts                 The options are passed to the children instances
 * @param {string} opts.refresh_token   Refresh token (retrieved from Keymetrics client)
 * @param {string} opts.token_type      Type: 'refresh_token' or 'access_token'
 * @param {string} opts.public_key      Bucket public key
 * @param {string} opts.access_token    Access token
 * @param {string} opts.public_key      Bucket id
 * @param {string} opts.host            Base url used (default 'http://app.keymetrics.io:3000')
 * @param {string} opts.basePath        Base API path (default '/api')
 * @param {function} opts.bus           EventEmitter2 instance
 */

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


/**
 * Start the Keymetrics connection
 *
 * @param {function} callback Runs once connection is complete
 *
 */

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
        if (self.options.realtime === 'startup')
          self.realtime.init(function (err, res) {
              return cb(err, res);
          });
        else
          return cb(null, res);
      });
    }
    else {
      return cb(new Error('Please setup public key for Keymetrics'), res);
    }
  });
};

module.exports = Keymetrics;
