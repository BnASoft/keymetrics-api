'use strict';

function Alert() {};

Alert.prototype = {
  update: function(cb) {
    http.post(this.URL + '/alerts/update')
      .send({
        triggers : Bucket.current_raw.triggers
      })    
      .end(function(err, res) {
        return cb(err, res.body);
      });
  },

  updateSlack: function(cb) {
    http.post(this.URL + '/alerts/updateSlack')
      .send({
        slack : Bucket.current_raw.integrations.slack
      })    
      .end(function(err, res) {
        return cb(err, res.body);
      });
  },

  updateWebhook: function(cb) {
    http.post(this.URL + '/alerts/updateWebhooks')
      .send({
        webhooks : Bucket.current_raw.integrations.webhooks
      })    
      .end(function(err, res) {
        return cb(err, res.body);
      });
  },

  removeEvent: function(ev_key, cb) {
    http.delete(this.URL + '/alerts/event')
      .send({
        params: {event : ev_key}
      })
      .end(function(err, res) {
        return cb(err, res.body);
      });
  },

  sendReport: function(cb) {
    http.get(this.URL + '/alerts/send_report', {responseType:'arraybuffer'})
      .end(function(err, res) {
        return cb(err, res.body);
      });
  }
};

module.export = Alert;