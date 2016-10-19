var Keymetrics = require('../lib/keymetrics');

var km = new Keymetrics({
  token: process.env.TEST_TOKEN,
  realtime: true,
  host: 'https://app.keymetrics.io'
});

//Get authenticated
km.init(process.env.TEST_PUB_KEY, function(err, res) {
  //Get user role
  km.bucket.fetchUserRole(function(err, res) {
    console.log('Current permissions: ' + res);
  });

  //Print recieved data
  km.bus.on('data:**', function(data) {
    console.log('-- INC ---');
    console.log(data);
  });

});

setTimeout(() => {
  console.log('-- QUIT --');
  km.close();
}, 10000);
