'use strict';

var request = require('superagent');
var Bucket  = require('./Bucket.js');
var Authenticate = require('./Authenticate');
var Realtime = require('./Realtime');

function Keymetrics(opts, callback) {
  if (!(this instanceof Keymetrics)) {
    return new Keymetrics(opts);
  }

  this.api = {
    host : opts.host ||  'http://app.km.io',
    port : opts.port || '3000',
    basePath : opts.path || '/api/'
  };

  this._auth = new Authenticate(opts);
  this.bucket = new Bucket(opts.bucket_id, this.getUrl(), this._auth.getToken());
  this.realtime = new Realtime(opts.bucket_id, this.getUrl(), this._auth.getToken());
  //if (opts.refresh_token)
  //  this.checkToken(callback);
};

Keymetrics.prototype.setApiField = function(key, value) {
  this._api[key] = value;
  this.bucket.api[key] = value;
};

Keymetrics.prototype.getApiField = function(key) {
  return this._api[key];
};

Keymetrics.prototype.getUrl = function() {
  return this.api.host + ':' + this.api.port + this.api.basePath;
};

Keymetrics.prototype.checkToken = function(cb) {
    var self = this;

    if (!self._auth.getToken())
      self._auth.refreshToken(function(err, token) {
        self.bucket.setToken(token);
        self.realtime.setToken(token);
        if (typeof(cb) != 'undefined')
          cb();
      });
    //Check every minute the token validity
    //setTimeout(self.checkToken, 60000);
};

module.exports = Keymetrics;