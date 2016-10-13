# Keymetrics API Wrapper

This module lets you implement a fully customizable Keymetrics client, receiving live data from the Keymetrics API.

You will need to retrieve your Keymetrics user token to use it.

For more informations about the data structures and API calls check out the [documentation](https://rawgit.com/keymetrics/keymetrics-api/master/doc/index.html).

We designed 2 ways to start the module: via callback or events.

## Install

With NPM:

```bash
$ npm install keymetrics-api --save
```

With YARN:

```bash
$ yarn add keymetrics-api
```

## Basic use - callbacks

```javascript
var Keymetrics = require('keymetrics-api');

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

  //Print received status
  km.bus.on('data:*:status', function(data) {
    console.log(data);
  });
});
```

### Options

*   `refresh_token` (Required): Refresh token obtained from the Keymetrics dashboard.
*   `token_type` (Required): Token type (`refresh_token` or `access_token`)
*   `public_key` (Optional): When defined, lets you retrieve the correct bucket.
*   `realtime` (Optional): When defined with public_key, launches the websocket session at start.

This snippet makes 3 successive calls (if all options are set):

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

//When authenticated
km.bus.on('auth:ready', function(token) {
  //Retrieve bucket
  km.bucket.connect('[public_key]');
});

//When bucket is retrieved
km.bus.on('bucket:active', function(id) {
  //Fetch user role
  km.bucket.fetchUserRole(function(err, res) {
    console.log('Current permissions: ' + res);
  });

  //Start realtime
  km.realtime.init();
});

//When realtime starts
km.bus.on('realtime:on', function() {
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
*   raw:\[server_name\]:status
*   data:\[server_name\]:status
*   data:\[server_name\]:server_name
*   data:\[server_name\]:monitoring

#### User

*   user:logged_in
*   user:logged_out

#### Error

*   error:auth
*   error:realtime
*   error:bucket

`DEBUG=*` allows verbose mode for received realtime data.
