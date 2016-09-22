'use strict';

var request = require('superagent');
var Primus = require('./primus.js');
var EventEmitter2 = require('eventemitter2').EventEmitter2;
var moment = require('moment');

function Realtime(url, eventemitter2) {
  this.url = url;
  this.token = null;
  this._bucket_id = null;
  // this._socket = null;
  // if (eventemitter2)
  //   this.eventemitter2 = eventemitter2;
  // else {
    this.eventemitter2 = new EventEmitter2({
      wildcard: true,
      delimiter: ':'
    });
  // }
};

Realtime.prototype.testVerbose = function(first_argument) {
  if (typeof window != 'undefined') {
    if (window.VERBOSE)
      return true;
  }
  else if (process.env.NODE_ENV === 'development')
    return true;
  return false;
};

Realtime.prototype.socket_io_connect = function() {
  console.log('[%s] Realtime connected', moment().format());
};

Realtime.prototype.socket_io_disconnect = function() {
  console.log('[%s] Realtime disconnected', moment().format());
};

Realtime.prototype.init = function(cb, reccuring) {
  var self = this;
  
  request
    .post(this.url + 'bucket/' + this.bucket_id + '/setActive')
    .send({})
    .set('Authorization', 'Bearer ' + this.token)
    .end(function(err, res) {
      if (err) cb(err)
      var bucket = res.body;

      var web_url = bucket.node_cache.endpoints.web;
      var ws_url = bucket.node_cache.endpoints.web;

      /***********************************
       * Development url overidde
       * test if on client or NodeJs 
       ***********************************/

      if (typeof window != 'undefined') {
        //if (window.location.host.indexOf('km.io') > -1) {
          web_url = web_url.replace('9001', '3000');
          ws_url  = ws_url.replace('9001', '4020');
        //}
        window.API_URL = web_url;
      }
      else if (process.env.NODE_ENV == "development") {
        web_url = web_url.replace('9001', '3000');
        ws_url  = ws_url.replace('9001', '4020');
      }

      if (self.primus)
        self.primus.destroy();

      var primus = self.primus = Primus.connect(ws_url || '/', {
        strategy: [ 'online', 'timeout', 'disconnect'],
        reconnect: {
          max: Infinity // Number: The max delay before we try to reconnect.
          , min: 100 // Number: The minimum delay before we try reconnect.
          , retries: 20 // Number: How many times we shoult try to reconnect.
        }
      });

      // used to authenticate
      primus.on('outgoing::url', function(url) {
        url.query = 'token=' + self.token;
      });

      primus.on('open', self.socket_io_connect);

      primus.on('close', self.socket_io_disconnect);

      primus.on('reconnect', function() {
        console.log('[%s] Realtime re-connection', moment().format());
      });

      primus.on('reconnect timeout', function() {
        console.log('Websocket reconnect timeout');
      });

      primus.on('connection:success', function(myself) {
        console.log('Websocket user authenticated');
      });

      primus.on('data:incoming', function(data) {
        if (typeof reccuring != 'undefined')
          reccuring(data);

        Object.keys(data).forEach(function(event_key) {

          if (self.testVerbose())
            console.log(data.server_name + ':' + event_key, data[event_key]);

          setTimeout(function() {
            self.eventemitter2.emit(data.server_name + ':' + event_key, data[event_key]);
          }, Math.floor((Math.random() * 4) + 1));
        });
      });

      primus.on('heapdump:ready', function(data) {
        var event_name = data.server_name + ':' + data.app_name + ':' + data.pm_id + ':' + 'heapdump:ready';
        if (self.testVerbose()) console.log(event_name, data);
        self.eventemitter2.emit(event_name, data);
      });

      primus.on('cpuprofile:ready', function(data) {
        var event_name = data.server_name + ':' + data.app_name + ':' + data.pm_id + ':' + 'cpuprofile:ready';
        if (self.testVerbose()) console.log(event_name, data);
        self.eventemitter2.emit(event_name, data);
      });

      if (typeof cb != 'undefined' && cb != null)
        return cb(null, bucket);
    });
};

Realtime.prototype.close = function() {
  if (this.primus)
    this.primus.destroy();
};

Realtime.prototype.unregister = function(cb) {
  var self = this;

  request
    .post(this.url + 'bucket/' + this.bucket_id + '/setUnactive')
    .send({})
    .set('Authorization', 'Bearer ' + this.token)
    .end(function(err, bucket) {
      if (err) return cb(err);
      self.close;
      return cb(null, bucket)
    });
};

module.exports = Realtime;