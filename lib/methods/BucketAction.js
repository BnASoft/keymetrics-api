'use strict';

function Action(opts) {
  var self = this;
  if (!(this instanceof Action)) {
    return new Action(http);
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

  this.trigger = function(opts, cb) {
    if (typeof(opts.server_name) === 'undefined' ||
        typeof(opts.process_id) === 'undefined' ||
        typeof(opts.action_name) === 'undefined' )
      return console.error('Missing parameters in trigger');

    this.http.post(this.URL + '/actions/trigger')
      .send(opts)
      .end(function(err, res) {
        return cb(err, res.body);
      });
    return false;
  }
  
  this.triggerPM2action = function(opts, cb) {
    if (!opts.server_name || !opts.method_name)
      return $log.error('Missing parameters in triggerPM2');

    this.http.post(this.URL + '/actions/triggerPM2')
      .send(opts)
      .end(function(err, res) {
        return cb(err, res.body);
      });
    return false;
  }
  
  this.triggerScopedAction = function(opts, cb) {
    if (typeof opts.server_name     == 'undefined'
        || typeof !opts.action_name == 'undefined'
        || typeof !opts.app_name    == 'undefined'
        || typeof !opts.pm_id       == 'undefined')
      return $log.error('Missing parameters in triggerScopedAction');

    this.http.post(this.URL + '/actions/triggerScopedAction')
      .send(opts)
      .end(function(err, res) {
        return cb(err, res.body);
      });
  }

  this.triggerPm2ScopedAction = function(opts, cb) {
    this.http.post(this.URL + '/actions/triggerPM2ScopedAction')
      .send(opts)
      .end(function(err, res) {
        return cb(err, res.body);
      });
  }

  this.listScopedActions = function(opts, cb) {
    this.http.post(this.URL + '/actions/listScopedActions')
      .send(opts)
      .end(function(err, res) {
        return cb(err, res.body);
      });
  }

  this.deleteScopedAction = function(opts, cb) {
    this.http.post(this.URL + '/actions/deleteScopedAction')
      .send(opts)
      .end(function(err, res) {
        return cb(err, res.body);
      });
  }

  this.getJSON = function(opts, cb) {
    if (typeof !opts.file == 'undefined')
      return console.error('Missing parameters in getJSON');

    this.http.get(opts.file)
      .end(function(err, res) {
        return cb(err, res.body);
      });
    return false;
  }
};

module.exports = Action;