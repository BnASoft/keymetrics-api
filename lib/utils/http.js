'use strict';

var request = require('superagent');
var protoMethods = Object.keys(request.Request.prototype);


var methods = [
  'get',
  'post',
  'put',
  'head',
  'delete',
  'options',
  'trace',
  'copy',
  'lock',
  'mkcol',
  'move',
  'purge',
  'propfind',
  'proppatch',
  'unlock',
  'report',
  'mkactivity',
  'checkout',
  'merge',
  'm-search',
  'notify',
  'subscribe',
  'unsubscribe',
  'patch',
  'search',
  'connect'
];

module.exports = Http;


function Http(superagent) {
  if (!(this instanceof Http)) return new Http(superagent);
  this.request = superagent || request;
  this.stack = []; // store the default operation on the Http
}
var proto = Http.prototype = {};

// setup methods for Http

each(protoMethods, function(method) {
  // blacklist unsupported functions
  if (~['end'].indexOf(method)) return;

  proto[method] = function() {
    this.stack.push({
      method: method,
      args: arguments
    });

    return this;
  }
});

proto.applyStack = function(req) {
  this.stack.forEach(function(operation) {
    req[operation.method].apply(req, operation.args);
  });
};

// generate HTTP verb methods

each(methods, function(method) {
  var targetMethod = method == 'delete' ? 'del' : method;
  var httpMethod = method.toUpperCase();
  proto[method] = function(url, fn) {
    var r = this.request;
    var req = r instanceof Function ?
      r(httpMethod, url) :
      r[targetMethod](url);

    // Do the attaching here
    this.applyStack(req);

    fn && req.end(fn);
    return req;
  };
});

proto.del = proto['delete'];

function each(arr, fn) {
  for (var i = 0; i < arr.length; ++i) {
    fn(arr[i], i);
  }
}