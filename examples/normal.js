var Keymetrics = require('../lib/keymetrics');

var km = new Keymetrics({
  refresh_token: process.env.TEST_TOKEN,
  token_type: 'refresh_token',
  public_key: process.env.TEST_PUB_KEY,
  realtime: true
});

//Get authenticated
km.init(function(err, res) {
  //Get user role
  km.bucket.fetchUserRole(function(err, res) {
    console.log('Current permissions: ' + res);
  });


  km.user.refreshUser(function(err, res) {
    console.log(res);
  })
  //Print recieved data
  km.bus.on('data:**', function(data) {
    console.log('-- INC ---');
    console.log(km.bucket);
  });
});
