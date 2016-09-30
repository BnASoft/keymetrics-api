'use strict';

var Http = require('./utils/http.js');

function Node(opts) {
  var self = this;
  if (!(this instanceof Node)) {
    return new Node(opts);
  }

  Object.assign(this, opts);

  this.http = new Http();

  this.bus.on('auth:ready', function (data) {
    // update Authorization header
    self.http.set('Authorization', 'Bearer ' + data.access_token);
  });
};

Node.prototype.getDefault = function(cb) {
  var self = this;

  this.http.get(this.root_url + '/node/default')
    .end(function (err, res) {
      // no error but no node returned
      if (!err && res.body.length === 0) {
         var error = new Error('No default bucket has been set! Please drop an email at contact@keymetrics.io')
          self.bus.emit('error:node', error)
          return cb(error);
      }

      return cb(err, res.body);
    });
};

module.exports = Node;