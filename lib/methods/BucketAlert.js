'use strict';

/**
 * Alert
 * @memberof Keymetrics.bucket
 * @constructor
 *
 * @param {object} opts Options
 */
function Alert(opts) {
  var self = this;
  if (!(this instanceof Alert)) {
    return new Alert(opts);
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
   * Update alerts
   *
   * @param  {type} cb callback
   */
  this.update = function(cb) {
    this.http.post(this.URL + '/alerts/update')
      .send({
        triggers : Bucket.current_raw.triggers
      })
      .end(function(err, res) {
        return cb(err, res.body);
      });
  }

  /**
   * Update Slack alerts
   *
   * @param  {type} cb callback
   */
  this.updateSlack = function(cb) {
    this.http.post(this.URL + '/alerts/updateSlack')
      .send({
        slack : Bucket.current_raw.integrations.slack
      })
      .end(function(err, res) {
        return cb(err, res.body);
      });
  }

  /**
   * Update webhook alerts
   *
   * @param  {type} cb callback
   */
  this.updateWebhook = function(cb) {
    this.http.post(this.URL + '/alerts/updateWebhooks')
      .send({
        webhooks : Bucket.current_raw.integrations.webhooks
      })
      .end(function(err, res) {
        return cb(err, res.body);
      });
  }

  /**
   * Remove event
   *
   * @param  {type} cb callback
   */
  this.removeEvent = function(ev_key, cb) {
    this.http.delete(this.URL + '/alerts/event')
      .send({
        params: {event : ev_key}
      })
      .end(function(err, res) {
        return cb(err, res.body);
      });
  }

  /**
   * Send report
   *
   * @param  {type} cb callback
   */
  this.sendReport = function(cb) {
    this.http.get(this.URL + '/alerts/send_report', {responseType:'arraybuffer'})
      .end(function(err, res) {
        return cb(err, res.body);
      });
  }
}

module.exports = Alert;
