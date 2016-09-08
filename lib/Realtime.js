'use strict';

var request = require('superagent');

function Realtime(bucket_id, url, token) {
  this.url = url;
  this.token = token;
  this.bucket_id = bucket_id;
  this.readyStatus = false;
}

Realtime.prototype = {
  register: function() {
    var self = this;

    request
    .post(this.url + '/setActive', {})
    .set('authorization', this.token)
    .end(function(err, res) {
      var bucket = res.body;

      var web_url = bucket.node_cache.endpoints.web;
      var ws_url  = bucket.node_cache.endpoints.web;


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


    })
  }
};