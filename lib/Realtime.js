'use strict';

var request = require('superagent');
var io = require('socket.io-client');

function Realtime(bucket_id, url, token) {
  this.url = url;
  this.token = token;
  this.bucket_id = bucket_id;
  this.readyStatus = false;
  this.socket = null;
}


Realtime.prototype.setToken =  function(token) {
  this.token = token;
};

Realtime.prototype.register = function() {
    var self = this;

    request
    .post(this.url + 'bucket/' + this.bucket_id + '/setActive')
    .send({})
    .set('Authorization', 'Bearer ' + this.token)
    .end(function(err, res) {
      var bucket = res.body;

      var web_url = bucket.node_cache.endpoints.web;
      var ws_url = bucket.node_cache.endpoints.web;


      /***********************************
       * Development url overidde
       * test if on client or NodeJs 
       ***********************************/

      if (typeof window != 'undefined') {
        if (window.location.host.indexOf('km.io') > -1) {
          web_url = web_url.replace('9001', '3000');
          ws_url  = ws_url.replace('9001', '4020');
        }
        window.API_URL = web_url;
      }
      else if (process.env.NODE_ENV == "development") {
        web_url = web_url.replace('9001', '3000');
        ws_url  = ws_url.replace('9001', '4020');
      }

      console.log(ws_url);
      self.socket = io.connect(ws_url, {
        path: '/primus',
        query: 'token=' + self.token
      });

      self.socket.on('open', function () {
        console.log('authenticated');
      })

      self.socket.on('close', function () {
        console.log('disconnected');
      });

      self.socket.on('connection:success', function(myself) {
        console.log('success for ' + myself);
      });

      self.socket.on('message', function (data) {
        console.log(data);
      });      

      console.log(self.socket);
    });
};

module.exports = Realtime;