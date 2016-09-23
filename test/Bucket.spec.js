'use strict';

var should     = require('should');

var km = require('../lib/keymetrics')({
  access_token: process.env.TEST_TOKEN,
  bucket_id: process.env.TEST_ID
});
var Bucket = require('../lib/Bucket');
var bucket = km.bucket;

describe('Bucket', function() {
  describe('Bucket initialization', function() {
    it ('Should null when incorrect id', function() {
      var tmp = Bucket('WRONG', 'http://localhost', '1212');
      should.not.exist(tmp);
    });
  });

  describe('Basic functions', function() {
    it ('Should fetch user role', function(done) {
      bucket.fetchUserRole((err, res) => {
        should.not.exist(err);
        res.should.be.equal('owner');
        done();
      });
    });

    it ('Should get test bucket and populate current_raw', function(done) {
      bucket.get((err, res) => {
        should.not.exist(err);
        res._id.should.be.equal(bucket.current_raw._id);
        done();
      });
    });
    
  });
});