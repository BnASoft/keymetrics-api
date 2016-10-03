'use strict';

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

  this.pm2Version = function(cb) {
    this.http
    .get(this.root_url + '/misc/pm2_version')
    .end(function(err, res) {
      return cb(err, res.body);
    });
  }

  this.meta = function(cb) {
    this.http.get(this.URL + '/data/metadata')
      .end(function(err, res) {
        return cb(err, res.body);
      });
  }

  this.status = function(cb) {
    this.http
      .get(this.URL + '/data/status')
      .end(function(err, res) {
        return cb(err, res.body);
      });
  }

  /**
   * Human events
   */
  this.events = function(opts, cb) {
    this.http.post(this.URL + '/data/events')
      .send(opts)
      .end(function(err, res) {
        return cb(err, res.body);
      });
  }

  this.eventsStats = function(opts, cb) {
    this.http.post(this.URL + '/data/events/stats')
      .send(opts)
      .end(function(err, res) {
        return cb(err, res.body);
      });
  }

  this.eventsSummary = function(opts, cb) {
    this.http.get(this.URL + '/data/eventsKeysByApp')
      .query(opts)
      .end(function(err, res) {
        return cb(err, res.body);
      });
  }

  /**
   * Process events
   */
  this.processEvents = function(opts, cb) {
    this.http.post(this.URL + '/data/processEvents')
      .send(opts)
      .end(function(err, res) {
        return cb(err, res.body);
      });
  }

  /**
   * Monitoring
   */
  this.monitoring = function(opts, cb) {
    this.http.post(this.URL + '/data/monitoring/app')
      .send(opts)
      .end(function(err, res) {
        return cb(err, res.body);
      });
  }


  /**
   * Exception
   */
  this.exceptions = function(opts, cb) {
    this.http.post(this.URL + '/data/exceptions')
      .send(opts)
      .end(function(err, res) {
        return cb(err, res.body);
      });
  }

  this.deploymentsListing = function(opts, cb) {
    this.http.get(this.URL + '/data/processEvents/deployments')
      .query(opts)
      .end(function(err, res) {
        return cb(err, res.body);
      });
  }

  this.exceptionsSummary = function(cb) {
    this.http
      .get(this.URL + '/data/exceptions/summary')
      .end(function(err, res) {
        return cb(err, res.body);
      });
  }

  this.deleteAllExceptions = function(opts, cb) {
    this.http.post(this.URL + '/data/exceptions/delete_all')
      .end(function(err, res) {
        return cb(err, res.body);
      });
  }

  this.deleteExceptions = function(opts, cb) {
    this.http.post(this.URL + '/data/exceptions/delete')
      .send(opts)
      .end(function(err, res) {
        return cb(err, res.body);
      });
  }

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
   * this.http transactions POC
   */
  this.httpTransactionsSummary = function(opts, cb) {
    this.http.get(this.URL + '/data/transactions/summary')
      .query(opts)
      .end(function(err, res) {
        return cb(err, res.body);
      });
  }

  this.resethttpTransactions = function(opts, cb) {
    this.http.post(this.URL + '/data/transactions/reset_url')
      .send(otps)
      .end(function(err, res) {
        return cb(err, res.body);
      });
  }

  this.getTransactionAVG = function(cb) {
    this.http
      .get(this.URL + '/data/transactions/average')
      .end(function(err, res) {
        return cb(err, res.body)
      });
  }

  this.getTransactionHisto = function(opts, cb) {
    this.http.get(this.URL + '/data/transactions/histogram')
      .query(opts)
      .end(function(err, res) {
        return cb(err, res.body)
      });
  }

  /**
   * Logs managements
   */
  this.logs = function(opts, cb) {
    this.http.get(this.URL + '/data/logs')
      .query(opts)
      .end(function(err, res) {
        return cb(err, res.body)
      });
  }

  this.flushLogs = function(opts, cb) {
    this.http.delete(this.URL + '/data/logs')
      .send(opts)
      .end(function(err, res) {
        return cb(err, res.body)
      });
  }
}

module.exports = Data;