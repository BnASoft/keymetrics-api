var Keymetrics = require('./lib/keymetrics');

var km = new Keymetrics({
  access_token: "n2aq17d6gsnr0brf0432c2wcivqeoc366nms5o2si0zhx86qvsguishcutkfl453vd0xd3f2iepgqownnbxeo7benm5e20f19gk9xwukw980rndo6h0ss8spxopxtbwc"
});

km.init("5fqz8bdggabnxdt", function(err, lel) {

  km.bucket.fetchUserRole(function(err, res) {
    console.log(res);
  });

  km.realtime.init(() => {
  }, (data) => {
    console.log(data);
  });
  
  km.bucket.getPlans((err, res) => {
    console.log(res);
  });

  km.bucket.getMetaServers((err, res) => {
    console.log(res);
  });
    
  setTimeout(() => {
    km.realtime.close();
  }, 10000);
});
