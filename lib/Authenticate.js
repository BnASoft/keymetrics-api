'use strict';

var request = require('superagent');

var OAUTH_URL = 'http://cl1.km.io:3001';
var OAUTH_CLIENT_ID = '5413907556';
var OAUTH_CLIENT_SECRET = '2393878333';


function Authenticate(opts) {
  if (!(this instanceof Authenticate)) {
    return new Keymetrics(opts);
  }

  this.access_token = opts.access_token || null;
  this.refresh_token = opts.refresh_token || null;
};

Authenticate.prototype = {
  btoa: function(str) {
    return new Buffer(str).toString('base64');
  },

  getToken: function(cb) {
    if (this.access_token)
      return cb(null, this.access_token);
    else
      this.refreshToken(cb);
  },

  refreshToken: function(cb) {
    var self = this;

    request
      .post(OAUTH_URL + '/oauth/token')
      .send('grant_type=refresh_token&client_id=' + OAUTH_CLIENT_ID +'&refresh_token=' + this.refresh_token +'&scope=all')
      .set('Authorization', 'Basic ' + this.btoa(OAUTH_CLIENT_ID + ':' + OAUTH_CLIENT_SECRET))
      .set("Content-Type", "application/x-www-form-urlencoded")
      .end(function(err, res) {
        if (err)
          return cb(err, null);
        self = Object.assign(self, res.body);
        return cb(null, res.body.access_token);
      });
  }
};

module.exports = Authenticate;