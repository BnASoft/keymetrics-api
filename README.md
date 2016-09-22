# Keymetrics API Wrapper

This module allows you implement a fully customizable Keymetrics client, recieving live data from the Keymetrics API.

You will need to retrieve your Keymetrics user token to use it.

## Basic use

```javascript
var Keymetrics = require('./lib/keymetrics');

var km = new Keymetrics({
  token: "token"
});

km.init("public_key", function(err, lel) {
  km.bucket.get(function(err, res) {
    console.log(res.name);
  });

  km.bucket.fetchUserRole(function(err, res) {
    console.log(res);
  });

  km.realtime.init();
});

```

### Initialisation of Keymetrics instance

The keymetrics.init() function makes 2 calls:
* POST to get an access_token from the server
* GET to retrieve the current bucket informations

```javascript
km.init(public_key, callback);
```

### Realtime

The keymetrics.realtime.init() function makes 1 call:
* POST to set the current session as active and start retrieving the data.

```javascript
km.realtime.init(callback, recurring);

//Just start the connection and broadcast with EventEmitter2
km.realtime.init();

//Start connection, print bucket after socket is initialized
km.realtime.init(function(err, bucket) {
  console.log(bucket);
});

//Print the data recieved at every iteration
km.realtime.init(null, function(data) {
    console.log(data);
});
```

Set NODE_ENV to development to allow verbose mode for a NodeJS process.

