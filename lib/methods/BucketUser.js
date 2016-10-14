'use strict';

/**
 * User
 * @memberof Keymetrics.bucket
 * @constructor
 *
 * @param {object} opts Options
 */

function User(opts) {
  var self = this;
  if (!(this instanceof User)) {
    return new User(opts);
  }

  this.bus = opts.bus;
  this.root_url = opts.root_url;
  this.http = opts.http;

  this.bus.on('bucket:active', function(data) {
    self._id = data.id;
    self.root_url = data.endpoint + '/api';
    self.URL = self.root_url + '/bucket/' + data.id;
  });
  this.bus.on('auth:ready', function(data) {
    // update Authorization header
    self.http.set('Authorization', 'Bearer ' + data.access_token);
  })

  /**
   * Retrieve authorized users
   *
   * @param  {function} cb callback
   */
  this.authorized = function(cb) {
    this.http.get(this.URL + '/users_authorized')
    .end(function(err, res) {
      return cb(err, res.body);
    });
  }

  /**
   * Send invitation to user
   *
   * @param  {function} cb callback
   */
  this.addUserToBucket = function(email, cb) {
    this.http.post(this.URL + '/add_user')
    .send({
      email : email
    })
    .end(function(err, res) {
      return cb(err, res.body);
    });
  }

  /**
   * Remove user from bucket
   *
   * @param  {function} cb callback
   */
  this.removeUser = function(email, cb) {
      this.http.post(this.URL + '/remove_user')
      .send({
        email : email
      })
      .end(function(err, res) {
        return cb(err, res.body);
      });
  }

  /**
   * Remove yourself from bucket
   *
   * @param  {string} email User email
   * @param  {function} cb callback
   */
  this.removeSelf = function(email, cb) {
    this.http.post(this.URL + '/remove_self')
    .send({
      email : email
    })
    .end(function(err, res) {
      return cb(err, res.body);
    });
  }

  /**
   * Remove invitation
   *
   * @param  {string} email Invitation email
   * @param  {function} cb callback
   */
  this.removeInvitation = function(email, cb) {
    this.http.delete(this.URL + '/invitation')
    .send({
      params: {email : email}
    })
    .end(function(err, res) {
      return cb(err, res.body);
    });
  }

  /**
   * Upgrade user permissions
   *
   * @param  {string} email email
   * @param  {string} role  Role
   * @param  {string} cb    callback
   */
  this.upgradeUser = function(email, role, cb) {
    this.http.post(this.URL + '/promote_user')
    .send({
      email : email,
      role: role
    })
    .end(function(err, res) {
      return cb(err, res.body);
    });
  }

  /**
   * Check if current user is admin
   *
   * @param  {object} user  email
   * @param  {string} cb    callback
   */
  this.isAdmin = function(user, cb) {
    if (Bucket.current_raw.credits.payer._id == user._id)
        return cb(true);
    return cb(false);
  }
}

module.exports = User;
