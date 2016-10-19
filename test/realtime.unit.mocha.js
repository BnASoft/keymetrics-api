'use strict';

var should     = require('should');
var Keymetrics = require('../lib/keymetrics');

describe('Realtime connection', function() {
  var keymetrics;

  before(function(done) {
    keymetrics = new Keymetrics({
      token      : 'uowlliax2q40soi2poduwq982y3vyglchrpd8iyih586v6nkhx92y5glqyh6cfkv',
      public_key : '80ml91k1h9nxgn5'
    });

    keymetrics.init(done);
  });

  it('Should start realtime connection', function(done) {
    keymetrics.bus.once('realtime:auth', function() {
      done();
    })
    keymetrics.realtime.init({
      endpoint: keymetrics.bucket.current_raw.node_cache.endpoints.web,
      public_id: keymetrics.bucket.public_id
    });
  });

  it('Should close realtime connection', function(done) {
    keymetrics.bus.once('realtime:off', function() {
      done();
    });
    keymetrics.realtime.unregister(function(err, bucket) {
      should.not.exist(err);
      bucket._id.should.be.equal(keymetrics.realtime.bucket_id);
    });
  });

  it('Should retrieve bucket status', function(done) {
    keymetrics.bucket.Data.status(function(err, res) {
      should.not.exist(err);
      res.length.should.be.above(0);
      done();
    })
  });

  it('Should retrieve list of authorized users', function(done) {
    keymetrics.bucket.User.authorized(function(err, res) {
      should.not.exist(err);
      res.length.should.be.above(0);
      done();
    });
  });

});
