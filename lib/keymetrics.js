'use strict';

var request = require('request');

Keymetrics.DEFAULT_HOST = "http://app.km.io";
Keymetrics.DEFAULT_PORT = '3000';
Keymetrics.DEFAULT_BASE_PATH = '/api/bucket/';

function Keymetrics(key, bucket_id) {
  if (!(this instanceof Keymetrics)) {
    return new Keymetrics(key, bucket_id);
  }

  this.api = {
    authorization : key,
    host : Keymetrics.DEFAULT_HOST,
    port : Keymetrics.DEFAULT_PORT,
    basePath : Keymetrics.DEFAULT_BASE_PATH,
    agent : null,
    bucket_id : bucket_id
  };

  this._bucket = null;
  this.listBuckets();
};

Keymetrics.prototype= {
  setApiField: function(key, value) {
    this._api[key] = value;
  },

  getApiField: function(key) {
    return this._api[key];
  },

  listBuckets: function() {
    var self = this;

    request.get({
      url: this.api.host + ':' + this.api.port + this.api.basePath + this.api.bucket_id,
      headers: {
        'authorization' : this.api.authorization
      }
    }, function(err, res, body) {
      self._bucket = JSON.parse(res.body);

      console.log(self._bucket);
    });
  }
};

module.exports = Keymetrics;