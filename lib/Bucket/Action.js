'use strict';

function Action() {};

Action.prototype = {

  trigger: function(opts, cb) {
    if (typeof(opts.server_name) === 'undefined' ||
        typeof(opts.process_id) === 'undefined' ||
        typeof(opts.action_name) === 'undefined' )
      return console.error('Missing parameters in trigger');

    http.post(this.URL + '/actions/trigger')
      .send(opts)
      .end(function(err, res) {
        return cb(err, res.body);
      });
    return false;
  },

  triggerPM2action: function(opts, cb) {
    if (!opts.server_name || !opts.method_name)
      return $log.error('Missing parameters in triggerPM2');

    http.post(this.URL + '/actions/triggerPM2')
      .send(opts)
      .end(function(err, res) {
        return cb(err, res.body);
      });
    return false;
  },

  triggerScopedAction: function(opts, cb) {
    if (typeof opts.server_name     == 'undefined'
        || typeof !opts.action_name == 'undefined'
        || typeof !opts.app_name    == 'undefined'
        || typeof !opts.pm_id       == 'undefined')
      return $log.error('Missing parameters in triggerScopedAction');

    http.post(this.URL + '/actions/triggerScopedAction')
      .send(opts)
      .end(function(err, res) {
        return cb(err, res.body);
      });
  },

  triggerPm2ScopedAction: function(opts, cb) {
    http.post(this.URL + '/actions/triggerPM2ScopedAction')
      .send(opts)
      .end(function(err, res) {
        return cb(err, res.body);
      });
  },

  listScopedActions: function(opts, cb) {
    http.post(this.URL + '/actions/listScopedActions')
      .send(opts)
      .end(function(err, res) {
        return cb(err, res.body);
      });
  },

  deleteScopedAction: function(opts, cb) {
    http.post(this.URL + '/actions/deleteScopedAction')
      .send(opts)
      .end(function(err, res) {
        return cb(err, res.body);
      });
  },

  getJSON: function(opts, cb) {
    if (typeof !opts.file == 'undefined')
      return console.error('Missing parameters in getJSON');

    http.get(opts.file)
      .end(function(err, res) {
        return cb(err, res.body);
      });
    return false;
  }
};

module.exports = Action;