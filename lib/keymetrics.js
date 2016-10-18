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
 * @param {string} opts.refresh_token   [Required] Refresh token (retrieved from Keymetrics dashboard)
 * @param {string} opts.token_type      [Required] Type: 'refresh_token' or 'access_token'
 * @param {string} opts.access_token    [Optional] Access token
 * @param {string} opts.public_key      [Optional] Bucket public key
 * @param {string} opts.realtime        [Optional] When true, attempts realtime connection on .init()
 * @param {string} opts.public_key      [Optional] Bucket id
 * @param {string} opts.host            [Optional] Base url used (default 'http://app.keymetrics.io:3000')
 * @param {string} opts.basePath        [Optional] Base API path (default '/api')
 * @param {function} opts.bus           [Optional] EventEmitter2 instance
 */

var Keymetrics = function (opts) {
  var self = this;
  if (!(this instanceof Keymetrics)) {
    return new Keymetrics(opts);
  }
  opts = opts || {};

  this.api = {
    host : opts.host ||  'https://app.keymetrics.io',
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

Keymetrics.prototype.init = function (public_key, cb) {
  var self = this;

  if (typeof (public_key) === 'function') {
    cb = public_key;
    public_key = this.options.public_key || '';
  }
  cb = function(){} || cb;

  this.auth.init(this.options, function(err, res) {
    if (err) return cb(err);

    //If public key already setup
    if (public_key) {
      self.bucket.retrieve(public_key, function(err, res) {
        if (err) return cb(err);
        var data = { id: res._id, endpoint: res.node_cache.endpoints.web, public_id: res.public_id };

        self.bus.emit("bucket:active", data);
        //If realtime is to be launched at start
        if (self.options.realtime)
          self.realtime.init(data);
        return cb(null, res);
      });
    }
    else {
      return cb(new Error('Please setup public key for Keymetrics'), res);
    }
  });
};

Keymetrics.prototype.close = function() {
  var self = this;

  this.realtime.unregister();
  this.bucket.worker.formatStatus.kill();
  this.auth.logout();
  this.bus.removeAllListeners();
};

module.exports = Keymetrics;
