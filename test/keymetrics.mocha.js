'use strict';

var should     = require('should');
var Keymetrics = require('../lib/keymetrics');


describe('Keymetrics module', function() {
  var keymetrics;

  describe('Keymetrics object', function() {
    it('should instanciate Keymetrics obj', function() {
      keymetrics = new Keymetrics({
        token      : 'uowlliax2q40soi2poduwq982y3vyglchrpd8iyih586v6nkhx92y5glqyh6cfkv',
        public_key : '80ml91k1h9nxgn5'
      });
    });
  });


  describe('Get access_token', function() {
    it('Should get access_token and bucket with refresh_token', function(done) {
      keymetrics.bus.once('bucket:active', function(id) {
        keymetrics.bucket.current_raw.public_id.should.be.equal('80ml91k1h9nxgn5');
        done();
      });

      keymetrics.init(function(err, token) {
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

  describe('test', function() {
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
