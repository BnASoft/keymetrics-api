'use strict';

var request = require('superagent');

function Bucket(id, url, token) {
  var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");
  if (!(id && checkForHexRegExp.test(id)))
    return null;
  
  this._id = id;
  this._params = null;
  this.url = url + 'bucket/' + this._id;
  this.token = token;
}

Bucket.prototype = {
  retrieve: function(cb) {
    var self = this;
    var url = this.url;

    request
      .get(url)
      .set('authorization', this.token)
      .end(function(err, res) {
        console.log(res.text);
        if (err)
          return cb(err);
        self._params = res.body;
        return cb(null, self._params);
      });
  },

  fetchUserRole: function(cb) {
    var url = this.url + '/current_role';

    request
      .get(url)
      .set('authorization', this.token)
      .end(function(err, res) {
        if (err)
          return cb(err);
        return cb(null, res.text);
      });
  }
};


module.exports = Bucket;
