# Keymetrics API Wrapper

This module allows you implement a fully customizable Keymetrics client, recieving live data from the Keymetrics API.

You will need to retrieve your Keymetrics user token to use it.

We designed 2 ways to start the module: via callback or events.

## Basic use - callbacks

```javascript
var Keymetrics = require('../lib/keymetrics');

var km = new Keymetrics({
  refresh_token: '[token]',
  token_type: 'refresh_token',
  public_key: '[public_key]',
  realtime: true
});

km.init(function(err, res) {
  if (err) return console.log(err);
  //Get user role
  km.bucket.fetchUserRole(function(err, res) {
    console.log('Current permissions: ' + res);
  });

  //Print recieved status
  km.bus.on('data:*status', function(data) {
    console.log(data);
  });
});
```

### Options

*   `public_key`: when defined, lets you retrieve the correct Bucket.
*   `realtime`: when defined with public_key, launches the websocket session.

This snippet makes 3 successive calls (if all options set):

*   POST to get and access_token from the servers
*   GET to retrieve the correct bucket informations
*   POST to set the Bucket active and initialize the Websocket connection.

## Basic use - events

`bus` is broadcasting events corresponding to every step of the authentication process.

In this example we start the authentication, then retrieve the bucket and finally start the realtime interaction.

```javascript
var km = new Keymetrics({
  refresh_token: '[token]',
  token_type: 'refresh_token'
});

//Retrieve bucket when authenticated
km.bus.on('auth:ready', function(token) {
  km.bucket.connect('[public_key]');
});

//Start realtime when bucket is retrieved
km.bus.on('bucket:active', function(id) {
  //Fetch user role
  km.bucket.fetchUserRole(function(err, res) {
    console.log('Current permissions: ' + res);
  });

  //Start realtime
  km.realtime.init();
});

//When realtime is started, do actions
km.bus.on('realtime:on', function(id) {
  console.log('Realtime started!')
});

//Retrieve access_token
km.init();
```

### List of broadcasted events:

#### Authenticate

*   auth:ready


#### Bucket

*   bucket:active

#### Realtime

*   realtime:on
*   realtime:off
*   realtime:reconnect
*   realtime:reconnect-timeout
*   realtime:auth
*   data:\[server_name\]:status
*   data:\[server_name\]:server_name
*   data:\[server_name\]:monitoring

#### Error

*   error:auth
*   error:realtime
*   error:bucket

### Realtime

The keymetrics.realtime.init() function makes 1 call:
*   POST to set the current session as active and start retrieving the data.

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

`DEBUG=*` allows verbose mode for recieved realtime data.
