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
  this._bucket_id = opts.bucket || null;
  this.bucket = new Bucket(this.getUrl());
  this.realtime = new Realtime(this.getUrl());
};

Keymetrics.prototype.init = function(public_key, callback) {
  var self = this;

  if (typeof public_key === 'function')
    callback = public_key;
  this.checkToken(function(err, token) {
    if (token) {
      self.realtime.token = token;
      self.bucket.getId(token, public_key, function(err, id) {
        console.log(id);
        if (err) callback(err);
        self._bucket_id = id;
        self.realtime.bucket_id = id;
        return callback(null, self.bucket.current_raw);
      });
    }
    else
      return callback(new Error("Failed to get access token"));
  });
}

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
        if (err) cb(err);
        self.bucket.setToken(token);
        self.realtime.setToken(token);
        cb(null, token);
      });
    //Check every minute the token validity
    //setTimeout(self.checkToken, 60000);
};

module.exports = Keymetrics;
