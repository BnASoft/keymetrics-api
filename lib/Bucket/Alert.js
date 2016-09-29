'use strict';

function Alert(opts) {
  var self = this;
  if (!(this instanceof Alert)) {
    return new Alert(opts);
  }

  Object.assign(this, opts);
  
  this.bus.on('bucket:active', function(id) { 
    self._id = id;
    self.URL = self.root_url + '/bucket/' + id;
  });
  this.bus.on('auth:ready', function(data) {
    // update Authorization header
    self.http.set('Authorization', 'Bearer ' + data.access_token);
  })

  this.update = function(cb) {
    this.http.post(this.URL + '/alerts/update')
      .send({
        triggers : Bucket.current_raw.triggers
      })    
      .end(function(err, res) {
        return cb(err, res.body);
      });
  }

  this.updateSlack = function(cb) {
    this.http.post(this.URL + '/alerts/updateSlack')
      .send({
        slack : Bucket.current_raw.integrations.slack
      })    
      .end(function(err, res) {
        return cb(err, res.body);
      });
  }

  this.updateWebhook = function(cb) {
    this.http.post(this.URL + '/alerts/updateWebhooks')
      .send({
        webhooks : Bucket.current_raw.integrations.webhooks
      })    
      .end(function(err, res) {
        return cb(err, res.body);
      });
  }

  this.removeEvent = function(ev_key, cb) {
    this.http.delete(this.URL + '/alerts/event')
      .send({
        params: {event : ev_key}
      })
      .end(function(err, res) {
        return cb(err, res.body);
      });
  }

  this.sendReport = function(cb) {
    this.http.get(this.URL + '/alerts/send_report', {responseType:'arraybuffer'})
      .end(function(err, res) {
        return cb(err, res.body);
      });
  }
}

module.exports = Alert;