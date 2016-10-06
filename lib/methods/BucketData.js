'use strict';

/**
 * Data
 * @memberof Keymetrics.bucket
 * @constructor
 *
 * @param {object} opts Options
 */
function Data(opts) {
  var self = this;
  if (!(this instanceof Data)) {
    return new Data(opts);
  }

  this.bus = opts.bus;
  this.root_url = opts.root_url;
  this.http = opts.http;

  this.bus.on('bucket:active', function(id) {
    self._id = id;
    self.URL = self.root_url + '/bucket/' + id;
  });
  this.bus.on('auth:ready', function(data) {
    // update Authorization header
    self.http.set('Authorization', 'Bearer ' + data.access_token);
  })

  /**
   * Retrieve latest pm2 version
   *
   * @param  {function} cb Callback
   */
  this.pm2Version = function(cb) {
    this.http
    .get(this.root_url + '/misc/pm2_version')
    .end(function(err, res) {
      return cb(err, res.body);
    });
  }


  /**
   * Retrieves metadata
   *
   * @param  {function} cb Callback
   */
  this.meta = function(cb) {
    this.http.get(this.URL + '/data/metadata')
      .end(function(err, res) {
        return cb(err, res.body);
      });
  }

  /**
   * Retrieves status
   *
   * @param  {function} cb Callback
   */
  this.status = function(cb) {
    this.http
      .get(this.URL + '/data/status')
      .end(function(err, res) {
        return cb(err, res.body);
      });
  }

  /**
   * Retrieves logged events
   *
   * @param  {object} opts Events
   * @param  {function} cb Callback
   */
  this.events = function(opts, cb) {
    this.http.post(this.URL + '/data/events')
      .send(opts)
      .end(function(err, res) {
        return cb(err, res.body);
      });
  }

  /**
   * Retrieves logged events statistics
   *
   * @param  {function} cb Callback
   */
  this.eventsStats = function(opts, cb) {
    this.http.post(this.URL + '/data/events/stats')
      .send(opts)
      .end(function(err, res) {
        return cb(err, res.body);
      });
  }

  /**
   * Retrieves events
   *
   * @param  {object} opts Application
   * @param  {function} cb Callback
   */
  this.eventsSummary = function(opts, cb) {
    this.http.get(this.URL + '/data/eventsKeysByApp')
      .query(opts)
      .end(function(err, res) {
        return cb(err, res.body);
      });
  }

  /**
   * Send events
   *
   * @param  {function} cb Callback
   */
  this.processEvents = function(opts, cb) {
    this.http.post(this.URL + '/data/processEvents')
      .send(opts)
      .end(function(err, res) {
        return cb(err, res.body);
      });
  }

  /**
   * Retrieves monitoring values
   *
   * @param  {object} opts Options
   * @param  {function} cb Callback
   */
  this.monitoring = function(opts, cb) {
    this.http.post(this.URL + '/data/monitoring/app')
      .send(opts)
      .end(function(err, res) {
        return cb(err, res.body);
      });
  }


  /**
   * Retrieves exceptions
   *
   * @param  {object} opts Exceptions
   * @param  {function} cb Callback
   */
  this.exceptions = function(opts, cb) {
    this.http.post(this.URL + '/data/exceptions')
      .send(opts)
      .end(function(err, res) {
        return cb(err, res.body);
      });
  }

  /**
   * Retrieves list of deployments
   *
   * @param  {object} opts Exceptions
   * @param {function} cb Callback
   */
  this.deploymentsListing = function(opts, cb) {
    this.http.get(this.URL + '/data/processEvents/deployments')
      .query(opts)
      .end(function(err, res) {
        return cb(err, res.body);
      });
  }

  /**
   * Retrieves summary of exceptions
   *
   * @param  {object} opts Exceptions
   * @param  {function} cb Callback
   */
  this.exceptionsSummary = function(cb) {
    this.http
      .get(this.URL + '/data/exceptions/summary')
      .end(function(err, res) {
        return cb(err, res.body);
      });
  }

  /**
   * Delete all logged exceptions
   *
   * @param  {object} opts Exceptions
   * @param  {function} cb Callback
   */
  this.deleteAllExceptions = function(opts, cb) {
    this.http.post(this.URL + '/data/exceptions/delete_all')
      .end(function(err, res) {
        return cb(err, res.body);
      });
  }

  /**
   * Delete selected exceptions
   *
   * @param  {object} opts Exceptions
   * @param  {function} cb Callback
   */
  this.deleteExceptions = function(opts, cb) {
    this.http.post(this.URL + '/data/exceptions/delete')
      .send(opts)
      .end(function(err, res) {
        return cb(err, res.body);
      });
  }

  /**
   * Delete selected server
   *
   * @param  {object} opts Server
   * @param  {function} cb Callback
   */
  this.deleteServer = function(opts, cb) {
    var self = this;

    this.http.post(this.URL + '/data/deleteServer', opts)
      .send(opts)
      .end(function(err, res) {
        if (err)
          return cb(err.msg || err);
        delete self.servers[opts.server_name];
        return cb(null, res.body);
      });
  }

  /**
   * Retrieve httpTransactionsSummary
   *
   * @param  {object} opts Server
   * @param  {function} cb Callback
   */
  this.httpTransactionsSummary = function(opts, cb) {
    this.http.get(this.URL + '/data/transactions/summary')
      .query(opts)
      .end(function(err, res) {
        return cb(err, res.body);
      });
  }

  /**
   * Reset httpTransactionsSummary
   *
   * @param  {object} opts Server
   * @param  {function} cb Callback
   */
  this.resethttpTransactions = function(opts, cb) {
    this.http.post(this.URL + '/data/transactions/reset_url')
      .send(otps)
      .end(function(err, res) {
        return cb(err, res.body);
      });
  }

  /**
   * Retrieve Transactions Average
   *
   * @param  {function} cb Callback
   */
  this.getTransactionAVG = function(cb) {
    this.http
      .get(this.URL + '/data/transactions/average')
      .end(function(err, res) {
        return cb(err, res.body)
      });
  }

  /**
   * Retrieve Transactions Histogram
   *
   * @param  {object} opts Server
   * @param  {function} cb Callback
   */
  this.getTransactionHisto = function(opts, cb) {
    this.http.get(this.URL + '/data/transactions/histogram')
      .query(opts)
      .end(function(err, res) {
        return cb(err, res.body)
      });
  }

  /**
   * Retrieve Data Logs
   *
   * @param  {object} opts Server
   * @param  {function} cb Callback
   */
  this.logs = function(opts, cb) {
    this.http.get(this.URL + '/data/logs')
      .query(opts)
      .end(function(err, res) {
        return cb(err, res.body)
      });
  }

  /**
   * Flush Data Logs
   *
   * @param  {object} opts Server
   * @param  {function} cb Callback
   */
  this.flushLogs = function(opts, cb) {
    this.http.delete(this.URL + '/data/logs')
      .send(opts)
      .end(function(err, res) {
        return cb(err, res.body)
      });
  }
}

module.exports = Data;
