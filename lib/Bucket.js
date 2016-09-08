'use strict';

var request = require('superagent');

function Bucket(id, URL, token) {
  var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");
  if (!(id && checkForHexRegExp.test(id)))
    return null;
  
  this._id = id;
  this.current_raw = null;
  this.URL = URL + 'bucket/' + this._id;
  this.token = token;
};

Bucket.prototype = {
  fetchUserRole: function(cb) {
    var URL = this.URL + '/current_role';

    request
      .get(URL)
      .set('authorization', this.token)
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
      .set('authorization', this.token)
      .end(function(err, res) {
        console.log(res.text);
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
        .set('authorization', this.token)
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
      .set('authorization', this.token)
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
      .set('authorization', this.token)
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
      .set('authorization', this.token)
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
      .set('authorization', this.token)
      .end(function(err, res) {
        if (err)
          return cb(err);
        return cb(null, res.body);
      });
  }
};


module.exports = Bucket;