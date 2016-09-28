var Keymetrics = require('../lib/keymetrics');

var km = new Keymetrics({
  refresh_token: "eim9bea23p21l7nfuvyas2vf1yug35vw70kd9o245o3ekgb6a1bp4fm3lxgsxug6",
  token_type: 'refresh_token'
}, function (err, data) {
  console.log(err || data);
});

km.bus.on('error:*', function (err) {
  console.log(err);
})