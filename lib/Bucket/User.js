'use strict';

function User() {};

User.prototype = {
  authorized: function(cb) {
    http.get(this.URL + '/users_authorized')
    .end(function(err, res) {
      return cb(err, res.body);
    });
  },

  addUserToBucket: function(email, cb) {
    http.post(this.URL + '/add_user')
    .send({
      email : email
    })
    .end(function(err, res) {
      return cb(err, res.body);
    });
  },

  removeUser: function(email, cb) {
      http.post(this.URL + '/remove_user')
      .send({
        email : email
      })
      .end(function(err, res) {
        return cb(err, res.body);
      });
  },

  removeSelf: function(email, cb) {
    http.post(this.URL + '/remove_self')
    .send({
      email : email
    })  
    .end(function(err, res) {
      return cb(err, res.body);
    });
  },

  removeInvitation: function(email, cb) {
    http.delete(this.URL + '/invitation')
    .send({
      params: {email : email}
    })      
    .end(function(err, res) {
      return cb(err, res.body);
    });
  },

  upgradeUser: function(email, role, cb) {
    http.post(this.URL + '/promote_user')
    .send({
      email : email,
      role: role
    })
    .end(function(err, res) {
      return cb(err, res.body);
    });
  },

  isAdmin: function(user, cb) {
    if (Bucket.current_raw.credits.payer._id == user._id)
        return cb(true);
    return cb(false);
  }
};

module.export = User;