'use strict';

var request = require('superagent');

function Data(isReady, eventemitter2, baseURL) {
  this.baseURL = baseURL;
  this.URL = null;
  this.eventemitter2 = eventemitter2;
  this.token = null;
  this.isReady = isReady;
};

Data.prototype = {
  pm2Version : function(cb) {
    request
    .get(this.baseURL + '/misc/pm2_version')
    .set('Authorization', 'Bearer ' + this.token)
    .end(function(err, res) {
      return cb(err, res.body);
    });
  },

  status: function(cb) {
    var self = this;

    self.isReady(function() {
      request
        .get(self.URL + '/data/status')
        .set('Authorization', 'Bearer ' + self.token)
        .end(function(err, res) {
          return cb(err, res.body);
        });
      });
  },

  getTransactionAVG: function(cb) {
    var self = this;

    this.isReady(function() {
      request
        .get(self.URL + '/data/transactions/average')
        .set('Authorization', 'Bearer ' + self.token)
        .end(function(err, res) {
          return cb(err, res.body)
        });
    });
  },

  exceptionsSummary: function(cb) {
    var self = this;

    this.isReady(function() {
      request
        .get(self.URL + '/data/exceptions/summary')
        .set('Authorization', 'Bearer ' + self.token)
        .end(function(err, res) {
          return cb(err, res.body);
        });
    });
  }
};

module.exports = Data;