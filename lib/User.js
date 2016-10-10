'use strict';

var Http = require('./utils/http.js');

/**
 * User
 * @memberof Keymetrics
 * @constructor
 * @alias user
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
  this.userObject = null;
  this.http = new Http();

  this.bus.on('auth:ready', function (data) {
    // update Authorization header
    self.http.set('Authorization', 'Bearer ' + data.access_token);
  });

  this.bus.on('auth:logout', function () {
    self.setUser(null);
  })
};

/**
 * Retrieves current user from API
 *
 * @param {function} callback Callback
 */

User.prototype.refreshUser = function (cb) {
  var self = this;

  this.http.get(this.root_url + '/users/isLogged')
    .end(function (err, res) {
      if (err) {
        self.bus.emit('error:network', err);
        if (cb) return cb(err);
      }

      self.setUser(res.body);
      if (cb) return cb(null, res.body);
    });
};

/**
 * set the User Object variable
 *
 * @param {object} user
 */
User.prototype.setUser = function (user) {
  this.userObject = user;

  if (this.userObject == null)
    this.bus.emit('user:logged_out', null);
  else
    this.bus.emit('user:logged_in', user);
};

/**
 * return the user object

 * @return {object}
 */
User.prototype.getUser = function () {
  return this.userObject;
};

User.prototype.listCharges = function (cb) {
  this.http.get(this.root_url + '/users/list_charges')
    .end(function (err, res) {
      return cb(err, res.body);
    });
};

User.prototype.getCreditCard = function (cb) {
  this.http.get(this.root_url + '/users/credit_card')
    .end(function (err, res) {
      return cb(err, res.body);
    });
}

User.prototype.updateCreditCard = function (card, cb) {
  this.http.put(this.root_url + '/users/credit_card')
    .send({ credit_card: card })
    .end(function (err, res) {
      return cb(err, res.body);
    });
}

User.prototype.getMetadata = function (cb) {
  this.http.get(this.root_url + '/users/stripe_metadata')
    .end(function (err, res) {
      return cb(err, res.body);
    });
};

User.prototype.updateMetadata = function (metadata, cb) {
  this.http.put(this.root_url + '/users/stripe_metadata')
    .send({ metadata: metadata })
    .end(function (err, res) {
      return cb(err, res.body);
    });
}

User.prototype.registerCardFromToken = function (token, cb) {
  this.http.post(this.root_url + '/users/credit_card')
    .send({ token: token })
    .end(function (err, res) {
      return cb(err, res.body);
    });
}

User.prototype.deleteCreditCard = function (card, cb) {
  this.http.delete(this.root_url + '/users/credit_card/' + card.id)
    .end(function (err, res) {
      return cb(err, res.body);
    });
}

User.prototype.listActiveSubscriptions = function (cb) {
  this.http.get(this.root_url + '/users/list_active_subscriptions')
    .end(function (err, res) {
      return cb(err, res.body);
    });
};

User.prototype.createToken = function (scopes, cb) {
  this.http.put(this.root_url + '/users/token/')
    .send({ scope: scopes })
    .end(function (err, res) {
      return cb(err, res.body);
    });
}

User.prototype.register = function (data, cb) {
  var self = this;

  this.http.post(this.root_url + '/users/register')
    .send(data)
    .end(function (err, res) {
      if (err) return cb(err);
      self.setUser(res.body.user);
      return cb(null, res.body);
    });
};

User.prototype.update = function (dt, cb) {
  var self = this;

  this.http.post(this.root_url + '/users/update')
    .send(dt)
    .end(function (err, res) {
      if (err) return cb(err);
      self.setUser(res.body);
      return cb(null, res.body);
    });
};

/**
 * This method can be hit publicily
 * @ignore
 */
User.prototype.getUserByUsername = function (username, cb) {
  this.http.get(this.root_url + '/users/show/' + username)
    .end(function (err, res) {
      if (err) return cb(err);
      return cb(null, res.body.user, res.body.trips);
    });
};

/**
 * Get all refresh tokens registered for the user
 * @ignore
 */
User.prototype.getTokens = function (cb) {
  this.http.get(this.root_url + '/users/token/')
    .end(function (err, res) {
      return cb(err, res.body);
    });
}

/**
* Delete an refresh tokens and associated access token
* @ignore
*/
User.prototype.deleteToken = function (tokenId, cb) {
  this.http.delete(this.root_url + '/users/token/' + tokenId)
    .end(function (err, res) {
      if (err)
        return cb(err, false);
      return cb(err, true);
    });
}

/**
 * Add a token for this account
 * @ignore
 */
User.createToken = function (scopes, cb) {
  this.http.put(this.root_url + '/api/users/token/', { scope: scopes })
    .end(function(err, res) {
      return cb(err, res.body);
    });
}

module.exports = User;
