'use strict';

var should     = require('should');
var Keymetrics = require('../lib/keymetrics');

describe('Keymetrics module', function() {
  var keymetrics;

  describe('Keymetrics object', function() {
    it('should instanciate Keymetrics obj', function() {
      keymetrics = new Keymetrics({
        token      : 'uowlliax2q40soi2poduwq982y3vyglchrpd8iyih586v6nkhx92y5glqyh6cfkv'
      });
    });

    it('should trigger error because no public key set', function(done) {
      keymetrics.init(function(err, bucket) {
        should.exists(err);
        done();
      });
    });

    it('should close instance', function() {
      keymetrics.close();
    });

    it('should instanciate Keymetrics obj', function() {
      keymetrics = new Keymetrics({
        token      : 'uowlliax2q40soi2poduwq982y3vyglchrpd8iyih586v6nkhx92y5glqyh6cfkv'
      });
    });

    it('should initiate connection', function(done) {
      keymetrics.init('80ml91k1h9nxgn5', function(err, bucket) {
        should.not.exists(err);
        done();
      });
    });

    it('should retrieve status', function(done) {
      keymetrics.bucket.Data.status(function(err, status) {
        should(status.length).eql(1);
        done();
      });
    });

    it('should close instance', function() {
      keymetrics.close();
    });
  });

  describe('Base behavior', function() {
    after(function() {
      keymetrics.close();
    });

    before(function() {
      keymetrics = new Keymetrics({
        token      : 'uowlliax2q40soi2poduwq982y3vyglchrpd8iyih586v6nkhx92y5glqyh6cfkv',
        public_key : '80ml91k1h9nxgn5'
      });
    });

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

    it('Should retrieve new token when expiration date comes', function(done) {
      this.timeout(5000);
      keymetrics.auth.expire_at = Date.now();
      keymetrics.auth.checkExpiration();
      keymetrics.bus.once('auth:ready', function(token) {
        done();
      });
    });
  });

  describe('Realtime', function() {
    this.timeout(5000);

    after(function() {
      keymetrics.close();
    });

    before(function(done) {
      keymetrics = new Keymetrics({
        token      : 'uowlliax2q40soi2poduwq982y3vyglchrpd8iyih586v6nkhx92y5glqyh6cfkv',
        public_key : '80ml91k1h9nxgn5',
        realtime   : true
      });

      keymetrics.init(done);
    });

    it('should receive status', function(done) {
      keymetrics.bus.once('data:*:status', function(ev, data) {
        done();
      });
    });
  });

});
