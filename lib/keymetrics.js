'use strict';

var request = require('superagent');
var Bucket  = require('./Bucket.js');
var Authenticate = require('./Authenticate');
var EventEmitter2 = require('eventemitter2');
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

  if (opts.eventemitter2)
    this.eventemitter2 = opts.eventemitter2;
  else
    this.eventemitter2 = new EventEmitter2({
      wildcard: true,
      delimiter: ':'
    });

  this._auth = new Authenticate(opts);
  this._bucket_id = opts.bucket || null;
  this.bucket = new Bucket(this.getUrl());
  this.realtime = new Realtime(this.getUrl(), this.eventemitter2);
};

Keymetrics.prototype.init = function(public_key, callback) {
  var self = this;

  if (typeof public_key === 'function')
    callback = public_key;

  this.checkToken(function(err, token) {
    if (token) {
      if (!self._bucket_id)
        self.bucket.getId(token, public_key, function(err, id) {
          if (err) callback(err);
          self._bucket_id = id;
          self.realtime.bucket_id = id;
          return callback(null, self.bucket.current_raw._id);
        });
      else {
        self.realtime.bucket_id = self._bucket_id;
        self.bucket._id = self._bucket_id;
        return callbacK(null, self.bucket_id);
      }
    }
    else
      return callback(new Error("Failed to get access token"));
  });

  //Check token every minute
//  setInterval(this.checkToken(), 60000);
}

Keymetrics.prototype.getUrl = function() {
  return this.api.host + ':' + this.api.port + this.api.basePath;
};

Keymetrics.prototype.checkToken = function(cb) {
    var self = this;

    var changeAll = function(token) {
      self.bucket.token = token;
      self.realtime.token = token;
      cb(null, token);
    };

    if (!self._auth.access_token)
      self._auth.refreshToken(function(err, token) {
        if (err) cb(err);
        changeAll(token);
      });
    else
      changeAll(self._auth.access_token);
};

module.exports = Keymetrics;
