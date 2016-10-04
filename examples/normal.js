var Keymetrics = require('../lib/keymetrics');

var km = new Keymetrics({
  refresh_token: 'dwiirnbukadhx7i1spbvtxq0r7eodo5d0a53eo37uh7w5rmiuv0bnb16ub16nua3',
  token_type: 'refresh_token',
  public_key: 'g3aylnb5xbsmvno',
  realtime: 'startup'
});

//Get authenticated
km.init(function(err, res) {
  //Get user role
  km.bucket.fetchUserRole(function(err, res) {
    console.log('Current permissions: ' + res);
  });

  //Print recieved data
  km.bus.on('data:**', function(data) {
    console.log(data);
  });
});
