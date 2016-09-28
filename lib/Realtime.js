'use strict';

var Http = require('./utils/http.js');
var Primus = require('./primus.js');
var moment = require('moment');

function Realtime(opts) {
  var self = this;
  if (!(this instanceof Realtime)) {
    return new Realtime(opts);
  }

  Object.assign(this, opts);
  this.http = new Http();

  this.bus.on('bucket:active', function(id) {
    self.bucket_id = id;
    self.init();
  });
  
  this.bus.on('auth:ready', function(data) {
    // update Authorization header
    self.http.set('Authorization', 'Bearer ' + data.access_token);
    self.token = data.access_token;
  })
};

Realtime.prototype.testVerbose = function() {
  if (typeof window != 'undefined' && window.VERBOSE) 
      return true;
  else if (process.env.NODE_ENV === 'development')
    return true;
  else
    return false;
};

Realtime.prototype.init = function(cb) {
  var self = this;

  this.http
    .post(this.root_url + '/bucket/' + this.bucket_id + '/setActive')
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

      primus.on('open', function() {
        console.log('[%s] Realtime connected', moment().format());
        self.bus.emit('realtime:on');
      });

      primus.on('close', function() {
        console.log('[%s] Realtime disconnected', moment().format());
        self.bus.emit('realtime:off');
      });

      primus.on('reconnect', function() {
        console.log('[%s] Realtime re-connection', moment().format());
        self.bus.emit('realtime:reconnect');
      });

      primus.on('reconnect timeout', function() {
        console.log('Websocket reconnect timeout');
        self.bus.emit('realtime:reconnect-timeout');
      });

      primus.on('connection:success', function(myself) {
        console.log('Websocket user authenticated');
        self.bus.emit('realtime:auth');
      });

      primus.on('error', function(err) {
        self.bus.emit('error:realtime', err);
      })

      primus.on('data:incoming', function(data) {
        Object.keys(data).forEach(function(event_key) {

          if (self.testVerbose())
            console.log('data:' + data.server_name + ':' + event_key, data[event_key]);

          if (event_key === 'status') 
            self.bus.emit('raw:' + data.server_name + ':' + event_key, data[event_key]);
          else
            self.bus.emit('data:' + data.server_name + ':' + event_key, data[event_key]);
        });
      });

      primus.on('heapdump:ready', function(data) {
        var event_name = 'data:' + data.server_name + ':' + data.app_name + ':' + data.pm_id + ':' + 'heapdump:ready';
        if (self.testVerbose()) console.log(event_name, data);
        self.bus.emit(event_name, data);
      });

      primus.on('cpuprofile:ready', function(data) {
        var event_name = 'data:' + data.server_name + ':' + data.app_name + ':' + data.pm_id + ':' + 'cpuprofile:ready';
        if (self.testVerbose()) console.log(event_name, data);
        self.bus.emit(event_name, data);
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

  this.http
    .post(this.root_url + '/bucket/' + this.bucket_id + '/setUnactive')
    .end(function(err, bucket) {
      if (err) return cb(err);
      self.close();
      return cb(null, bucket)
    });
};

module.exports = Realtime;
