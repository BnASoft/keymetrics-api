# Keymetrics API Wrapper

This module allows you implement a fully customizable Keymetrics client, recieving live data from the Keymetrics API.

You will need to retrieve your Keymetrics user token to use it.

## Basic use

```javascript
var Keymetrics = require('./lib/keymetrics')

var km = new Keymetrics({
  token: "[token]"
});

km.init("[public_key]", function(err, lel) {
  km.bucket.get(function(err, res) {
    console.log(res.name);
  });

  km.bucket.fetchUserRole(function(err, res) {
    console.log(res);
  });

  km.realtime.init();
});

```