'use strict';

function User(opts) {
  var self = this;
  if (!(this instanceof User)) {
    return new User(opts);
  }

  Object.assign(this, opts);

  this.bus.on('bucket:active', function(id) { 
    self._id = id;
    self.URL = self.root_url + '/bucket/' + id;
  });
  this.bus.on('auth:ready', function(data) {
    // update Authorization header
    self.http.set('Authorization', 'Bearer ' + data.access_token);
  })

  this.authorized = function(cb) {
    this.http.get(this.URL + '/users_authorized')
    .end(function(err, res) {
      return cb(err, res.body);
    });
  }

  this.addUserToBucket = function(email, cb) {
    this.http.post(this.URL + '/add_user')
    .send({
      email : email
    })
    .end(function(err, res) {
      return cb(err, res.body);
    });
  }

  this.removeUser = function(email, cb) {
      this.http.post(this.URL + '/remove_user')
      .send({
        email : email
      })
      .end(function(err, res) {
        return cb(err, res.body);
      });
  }

  this.removeSelf = function(email, cb) {
    this.http.post(this.URL + '/remove_self')
    .send({
      email : email
    })  
    .end(function(err, res) {
      return cb(err, res.body);
    });
  }

  this.removeInvitation = function(email, cb) {
    this.http.delete(this.URL + '/invitation')
    .send({
      params: {email : email}
    })      
    .end(function(err, res) {
      return cb(err, res.body);
    });
  }

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

  this.isAdmin = function(user, cb) {
    if (Bucket.current_raw.credits.payer._id == user._id)
        return cb(true);
    return cb(false);
  }
}

module.exports = User;