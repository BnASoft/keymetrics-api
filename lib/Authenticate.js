'use strict';

var request = require('superagent');

var OAUTH_URL = 'http://cl1.km.io:3001';
var OAUTH_CLIENT_ID = '5413907556';
var OAUTH_CLIENT_SECRET = '2393878333';

function Authenticate(opts) {
  if (!(this instanceof Authenticate)) {
    return new Authenticate(opts);
  }
  var self = this;

  this.access_token = opts.access_token || null;
  this.refresh_token = opts.token || null;
  this.expire_at = opts.refresh_token || null;
};

Authenticate.prototype.btoa = function(str) {
  return new Buffer(str).toString('base64');
};

Authenticate.prototype.refreshToken = function(cb) {
  var self = this;

  var post = request
    .post(OAUTH_URL + '/oauth/token')
    .send('grant_type=refresh_token&client_id=' + OAUTH_CLIENT_ID +'&refresh_token=' + this.refresh_token +'&scope=all');

  if (typeof window === 'undefined')
    post.set('User-Agent', process.release.name + '/' + process.version + ' (' + process.platform + ' ' + process.arch + ')');

  post
    .set("Content-Type", "application/x-www-form-urlencoded")
    .end(function(err, res) {
      if (err)
        return cb(err, null);
      self = Object.assign(self, res.body);
      return cb(null, res.body.access_token);
    });
};

module.exports = Authenticate;
