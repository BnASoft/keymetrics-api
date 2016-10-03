'use strict';

var Http = require('./utils/http.js');

function Changelog(opts) {
  var self = this;
  if (!(this instanceof Changelog)) {
    return new Changelog(opts);
  }
  
  this.bus = opts.bus;
  this.root_url = opts.root_url;
  this.http = new Http();

  this.bus.on('auth:ready', function (data) {
    // update Authorization header
    self.http.set('Authorization', 'Bearer ' + data.access_token);
  });
};

Changelog.prototype.getAll = function(cb) {
  this.http.get(this.root_url + '/misc/changelog')
    .end(function (err, res) {
      return cb(err, res.body);
    });
};

module.exports = Changelog;