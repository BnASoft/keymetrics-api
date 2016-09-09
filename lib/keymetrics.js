'use strict';

var request = require('superagent');
var Bucket  = require('./Bucket.js');
var Authenticate = require('./Authenticate');

function Keymetrics(opts) {
  if (!(this instanceof Keymetrics)) {
    return new Keymetrics(opts);
  }

  this.api = {
    host : opts.host ||  'http://app.km.io',
    port : opts.port || '3000',
    basePath : opts.path || '/api/'
  };

  this.authInfo = new Authenticate(opts);
  this.init(opts);
};

Keymetrics.prototype = {
  init: function(opts) {
    var self = this;

    this.authInfo.getToken(function(err, token) {
      self.bucket = new Bucket(opts.bucket_id, self.getUrl(), token);
    });
  },

  setApiField: function(key, value) {
    this._api[key] = value;
    this.bucket.api[key] = value;
  },

  getApiField: function(key) {
    return this._api[key];
  },

  getUrl: function() {
    return this.api.host + ':' + this.api.port + this.api.basePath;
  }
};

module.exports = Keymetrics;