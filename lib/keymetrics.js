'use strict';

var request = require('superagent');
var Bucket  = require('./Bucket.js')

Keymetrics.DEFAULT_HOST = "http://app.km.io";
Keymetrics.DEFAULT_PORT = '3000';
Keymetrics.DEFAULT_BASE_PATH = '/api/';

function Keymetrics(key, bucket_id) {
  if (!(this instanceof Keymetrics)) {
    return new Keymetrics(key, bucket_id);
  }

  this.api = {
    authorization : key,
    host : Keymetrics.DEFAULT_HOST,
    port : Keymetrics.DEFAULT_PORT,
    basePath : Keymetrics.DEFAULT_BASE_PATH,
    agent : null
  };

  this.bucket = new Bucket(bucket_id, this.getUrl(), this.api.authorization);
};

Keymetrics.prototype = {
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