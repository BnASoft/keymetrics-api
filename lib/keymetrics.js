'use strict';

var request = require('superagent');
var Bucket  = require('./Bucket.js');
var Authenticate = require('./Authenticate');
var Realtime = require('./Realtime');

function Keymetrics(opts) {
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
  if (opts.refresh_token)
    this.checkToken();
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

Keymetrics.prototype.checkToken = function() {
    var self = this;

    if (!this._auth.getToken())
      this._auth.refreshToken(function(err, token) {
        self.bucket.setToken(token);
        self.realtime.setToken(token);
      });
    //Check every minute the token validity
    setTimeout(this.checkToken, 60000);
};

module.exports = Keymetrics;