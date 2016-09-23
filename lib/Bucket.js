'use strict';

var request = require('superagent');

function Bucket(URL) {
  if (!(this instanceof Bucket)) {
    return new Bucket(URL);
  }

  this._id = null;
  this.current_raw = null;
  this.URL = URL + 'bucket/';
  this.token = null;
};

Bucket.prototype = {
  getId: function(token, public_id, cb) {
    var self = this;
    this.token = token;

    request
      .get(this.URL)
      .set('Authorization', 'Bearer ' + this.token)
      .end(function(err, res) {
        if (err)
          return cb(err);
        for (var i = 0; i < res.body.length; i++) {
          if (res.body[i].public_id === public_id) {
            self.current_raw = res.body[i];
            self._id = res.body[i]._id;
            self.URL = self.URL + self._id;
            return cb(null, self._id);
          }
        };
        return cb(new Error("Failed to find bucket"), null);
      });
  },

  setToken: function(token) {
    this.token = token;
  },

  fetchUserRole: function(cb) {
    var URL = this.URL + '/current_role';

    request
      .get(URL)
      .set('Authorization', 'Bearer ' + this.token)
      .end(function(err, res) {
        if (err)
          return cb(err);
        return cb(null, res.text);
      });
  },

  get: function(cb) {
    var self = this;
    var URL = this.URL;

    request
      .get(URL)
      .set('Authorization', 'Bearer ' + this.token)
      .end(function(err, res) {
        if (err)
          return cb(err);
        self.current_raw = res.body;
        return cb(null, res.body);
      });
  },

  getCurrentPlan: function() {
    if (!this.current_raw || !this.current_raw.credits) return null;

    return this.current_raw.credits.offer_type;
  },

  getProbesHistory: function(opts, cb) {
      var URL = this.URL + '/data/probes/histogram';

      if (opts.app_name) URL += '?app_name=' + opts.app_name;
      if (opts.server_name) URL += '&server_name=' + opts.server_name;
      if (opts.minutes) URL += '&minutes=' + opts.minutes;
      if (opts.interval) URL += '&interval=' + opts.interval;

      request
        .get(URL)
        .set('Authorization', 'Bearer ' + this.token)
        .end(function(err, res) {
          if (err)
            return cb(err);
          return cb(null, res.body);
        });
    },

  getProbesMeta: function(opts, cb) {
    var URL = this.URL + '/data/probes?app_name=' + opts.app_name;

    if (opts.minutes) URL += '&minutes=' + opts.minutes;
    if (opts.server_name) URL += '&server_name=' + opts.server_name;

    request
      .get(URL)
      .set('Authorization', 'Bearer ' + this.token)
      .end(function(err, res) {
        if (err)
          return cb(err);
        return cb(null, res.body);
      });

  },

  getMetaServers: function(cb) {
    var URL = this.URL + '/meta_servers';

    request
      .get(URL)
      .set('Authorization', 'Bearer ' + this.token)
      .end(function(err, res) {
        if (err)
          return cb(err);
        return cb(null, res.body);
      });
  },

  saveMetaServer: function(server, cb) {
    var URL = this.URL + '/server/update';

    request
      .post(URL, server)
      .send(server)
      .set('Authorization', 'Bearer ' + this.token)
      .end(function(err, res) {
        if (err)
          return cb(err);
        return cb(null, res.body);
      });
  },

  update: function(data, cb) {
    var URL = this.URL;

    request
      .put(URL)
      .send(data)
      .set('Authorization', 'Bearer ' + this.token)
      .end(function(err, res) {
        if (err)
          return cb(err);
        return cb(null, res.body);
      });
  }
};


module.exports = Bucket;
