'use strict';

var should     = require('should');
var Keymetrics = require('../lib/keymetrics');

var keymetrics = new Keymetrics({
  refresh_token : 'uowlliax2q40soi2poduwq982y3vyglchrpd8iyih586v6nkhx92y5glqyh6cfkv',
  token_type    : 'refresh_token',
  public_key    : '80ml91k1h9nxgn5'
});

describe('Keymetrics module', function() {
  describe('Get access_token', function() {
    it('Should get access_token with refresh_token', function(done) {
      keymetrics.bus.once('auth:ready', function(token) {
        keymetrics.auth.access_token.should.be.equal(token.access_token);
        done();
      });

      keymetrics.init(keymetrics.options,  function(err, token) {
        should.not.exist(err);
      });
    });

    it('Should retrieve current role', function(done) {
      keymetrics.bucket.fetchUserRole(function(err, role) {
        should.not.exist(err);
        role.should.be.equal('owner');
        done();
      });
    });
  });

  describe.skip('test', function() {
    it('Should retrieve bucket', function(done) {
      keymetrics.bus.once('bucket:active', function(id) {
        should.exist(id);
        id.should.be.equal(keymetrics.realtime.bucket_id);
        done();
      });

      keymetrics.bucket.connect(process.env.TEST_PUB_KEY);
    });

    it('Should start realtime connection', function(done) {
      keymetrics.bus.once('realtime:auth', function() {
        done();
      })
      keymetrics.realtime.init(function (err, bucket) {
        should.not.exist(err);
        bucket._id.should.be.equal(keymetrics.realtime.bucket_id);
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

});
