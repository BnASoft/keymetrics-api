'use strict';

var request = require('superagent');

function Data(baseURL) {
  this.baseURL = baseURL;
  this.URL = null;
};

Data.prototype = {
  setToken: function(token) {
    this.token = token;
  },

  pm2Version : function(cb) {
    request
    .get(this.baseURL + '/misc/pm2_version')
    .set('Authorization', 'Bearer ' + this.token)
    .end(function(err, res) {
      return cb(err, res.body);
    });
  },

  status: function(cb) {
    request
      .get(this.URL + '/data/status')
      .set('Authorization', 'Bearer ' + this.token)
      .end(function(err, res) {
        return cb(err, res.body);
      });
  },

  getTransactionAVG: function(cb) {
    request
      .get(this.URL + '/data/transactions/average')
      .set('Authorization', 'Bearer ' + this.token)
      .end(function(err, res) {
        return cb(err, res.body)
      });
  },

  exceptionsSummary: function(cb) {
    request
      .get(this.URL + '/data/exceptions/summary')
      .set('Authorization', 'Bearer ' + this.token)
      .end(function(err, res) {
        return cb(err, res.body);
      });
  }
};

module.exports = Data;