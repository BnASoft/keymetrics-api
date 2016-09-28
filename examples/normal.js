var Keymetrics = require('./lib/keymetrics');

var km = new Keymetrics({
  token: "amkwpkvd5x8vca3g0t1d8wfklkmq51sesvxb6aaxs6u674qzlreu6k429b5lbmdx" 
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
