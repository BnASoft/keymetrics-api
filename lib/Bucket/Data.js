'use strict';

function Data() {};

Data.prototype = {
  setToken: function(token) {
    this.token = token;
  },

  pm2Version : function(cb) {
    request
    .get(this.baseURL + '/misc/pm2_version')
    .end(function(err, res) {
      return cb(err, res.body);
    });
  },

  status: function(cb) {
    request
      .get(this.URL + '/data/status')
      .end(function(err, res) {
        return cb(err, res.body);
      });
  },

  getTransactionAVG: function(cb) {
    request
      .get(this.URL + '/data/transactions/average')
      .end(function(err, res) {
        return cb(err, res.body)
      });
  },

  exceptionsSummary: function(cb) {
    request
      .get(this.URL + '/data/exceptions/summary')
      .end(function(err, res) {
        return cb(err, res.body);
      });
  }
};

module.exports = Data;