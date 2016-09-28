'use strict';

function Data() {};

/**
 * Retrieve data specific to current bucket
 */
Data.prototype = {
  pm2Version: function(cb) {
    request
    .get(this.baseURL + '/misc/pm2_version')
    .end(function(err, res) {
      return cb(err, res.body);
    });
  },

  meta : function(cb) {
    http.get(this.URL + '/data/metadata')
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

  /**
   * Human events
   */
  events : function(opts, cb) {
    http.post(this.URL + '/data/events')
      .send(opts)
      .end(function(err, res) {
        return cb(err, res.body);
      });
  },

  eventsStats : function(opts, cb) {
    http.post(this.URL + '/data/events/stats')
      .send(opts)
      .end(function(err, res) {
        return cb(err, res.body);
      });
  },

  eventsSummary : function(opts, cb) {
    http.get(this.URL + '/data/eventsKeysByApp')
      .query(opts)
      .end(function(err, res) {
        return cb(err, res.body);
      });
  },

  /**
   * Process events
   */
  processEvents : function(opts, cb) {
    http.post(this.URL + '/data/processEvents')
      .send(opts)
      .end(function(err, res) {
        return cb(err, res.body);
      });
  },

  /**
   * Monitoring
   */
  monitoring : function(opts, cb) {
    http.post(this.URL + '/data/monitoring/app')
      .send(opts)
      .end(function(err, res) {
        return cb(err, res.body);
      });
  },


  /**
   * Exception
   */
  exceptions : function(opts, cb) {
    http.post(this.URL + '/data/exceptions')
      .send(opts)
      .end(function(err, res) {
        return cb(err, res.body);
      });
  },

  deploymentsListing : function(opts, cb) {
    http.get(this.URL + '/data/processEvents/deployments')
      .query(opts)
      .end(function(err, res) {
        return cb(err, res.body);
      });
  },

  exceptionsSummary: function(cb) {
    request
      .get(this.URL + '/data/exceptions/summary')
      .end(function(err, res) {
        return cb(err, res.body);
      });
  },

  deleteAllExceptions : function(opts, cb) {
    http.post(this.URL + '/data/exceptions/delete_all')
      .end(function(err, res) {
        return cb(err, res.body);
      });
  },

  deleteExceptions : function(opts, cb) {
    http.post(this.URL + '/data/exceptions/delete')
      .send(opts)
      .end(function(err, res) {
        return cb(err, res.body);
      });
  },

  deleteServer : function(opts, cb) {
    var self = this;

    http.post(this.URL + '/data/deleteServer', opts)
      .send(opts)
      .end(function(err, res) {
        if (err)
          return cb(err.msg || err);
        delete self.servers[opts.server_name];
        return cb(null, res.body);
      });
  },

  /**
   * Http transactions POC
   */
  httpTransactionsSummary : function(opts, cb) {
    http.get(this.URL + '/data/transactions/summary')
      .query(opts)
      .end(function(err, res) {
        return cb(err, res.body);
      });
  },

  resetHttpTransactions : function(opts, cb) {
    http.post(this.URL + '/data/transactions/reset_url')
      .send(otps)
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

  getTransactionHisto : function(opts, cb) {
    http.get(this.URL + '/data/transactions/histogram')
      .query(opts)
      .end(function(err, res) {
        return cb(err, res.body)
      });
  },

  /**
   * Logs managements
   */
  logs : function(opts, cb) {
    http.get(this.URL + '/data/logs')
      .query(opts)
      .end(function(err, res) {
        return cb(err, res.body)
      });
  },

  flushLogs : function(opts, cb) {

    http.delete(this.URL + '/data/logs')
      .send(opts)
      .end(function(err, res) {
        return cb(err, res.body)
      });
  }
};

module.exports = Data;