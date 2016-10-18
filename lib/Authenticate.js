'use strict';

var Http = require('./utils/http.js');



/**
 * Authenticate
 * @alias auth
 * @constructor
 * @memberof Keymetrics
 *
 * @param {object} opts Options
 */

var Authenticate = function (opts) {
  var self = this;
  if (!(this instanceof Authenticate)) {
    return new Authenticate(opts);
  }

  this.bus = opts.bus;
  this.root_url = opts.root_url;
  this.client_id = opts.client_id || '795984050';
  this.http = new Http();

  this.bus.on('auth:ready', function (data) {
    // update Authorization header
    self.http.set('Authorization', 'Bearer ' + data.access_token);
    self.refresh_token = data.refresh_token;
    self.access_token = data.access_token;
    self.expire_at = data.expire_at;
  })
};

/**
 * Get access token
 *
 * @param {string} token     Refresh token
 * @param {function} callback Callback
 */

Authenticate.prototype.refresh = function (token, cb) {
  var self = this;

  if (typeof (token) === 'function') {
    cb = token;
    token = this.token || '';
  }

  var post = this.http
    .post(this.root_url + '/oauth/token')
    .send('grant_type=refresh_token&client_id=' + this.client_id + '&refresh_token=' + token + '&scope=all');

  if (typeof window === 'undefined')
    post.set('User-Agent', process.release.name + '/' + process.version + ' (' + process.platform + ' ' + process.arch + ')');

  post
    .set("Content-Type", "application/x-www-form-urlencoded")
    .end(function (err, res) {
      if (err) return cb(err, null);

      return cb(null, res.body);
    });
};

/**
 * Starts the authentication process
 *
 * @param {object}    opts
 * @param {function}  callback
 */

Authenticate.prototype.init = function (opts, cb) {
  var self = this;
  if (cb == null) cb = function(){};

  // if the user did input a refresh token
  if (opts.token)
    this.refresh(opts.token, function (err, data) {
      if (err) {
        self.bus.emit('error:auth', { msg: 'Refeshing token failed, maybe invalid/revoked token ?', err: err });
        return cb(err);
      }

      // broadcast to other service that auth is done
      self.bus.emit('auth:ready', data);
      return cb(null, data);
    })
  // if the user did input an access_token
  else if (opts.access_token) {
    var data = { access_token: opts.access_token, token: '', token_type: 'access_token' }
    self.bus.emit('auth:ready', data);
    return cb(null, data)
  }
  else {
    self.bus.emit('error:auth', { msg: 'Invalid token_type, please refer to the documentation.' });
    return cb(new Error('Invalid token_type, please refer to the documentation.'))
  }
}

/**
 * Revoke access token
 *
 * @param {function} callback
 */

Authenticate.prototype.logout = function (cb) {
  var self = this;
  cb = function(){} || cb;

  if (!this.access_token)
    return cb('Not logged');

  self.http
    .post(this.root_url + '/oauth/revoke')
    .set("Content-Type", "application/x-www-form-urlencoded")
    .end(function (err, res) {
      if (err) return cb(err);

      self.bus.emit("user:logged_out");
      self.token = null;
      self.access_token = null;
      self.type = null;
      self.expire_at = null;
      return cb(null);
    });
};

module.exports = Authenticate;
