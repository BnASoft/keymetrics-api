'use strict';

var DataMethods = require('./methods/BucketData.js');
var UserMethods = require('./methods/BucketUser.js');
var AlertMethods = require('./methods/BucketAlert.js');
var ActionMethods = require('./methods/BucketAction.js');

var Worker = require('./services/worker.js');
var Http = require('./utils/http.js');
var deep_extends = require('./utils/deep_extends.js');

/**
 * Bucket
 * @constructor
 * @memberof Keymetrics
 * @alias bucket
 *
 * @param {object}      opts                Options
 * @property {object}   _id          ID of currently selected bucket
 * @property {object}   current_raw  Raw data from current selected Bucket
 * @property {object}   servers      (Realtime) List of connected Bucket servers
 * @property {object}   apps         (Realtime) List of connected Bucket applications
 * @property {object}   apps_server  (Realtime) List of connected apps per server
 * @property {object}   mini_metrics (Realtime) List of metrics per app per server
 */

var Bucket = function (opts) {
  var self = this;
  if (!(this instanceof Bucket)) {
    return new Bucket(opts);
  }

  this._id = opts.bucket || null;
  this.bus = opts.bus;
  this.root_url = opts.root_url;
  this.current_raw = null;
  this.available = [];
  this.http = new Http();
  this.resetStateBucket();

  this.Data = new DataMethods(this);
  this.User = new UserMethods(this);
  this.Alert = new AlertMethods(this);
  this.Action = new ActionMethods(this);

  this.worker = new Worker(opts);

  this.bus.on('auth:ready', function (data) {
    // update Authorization header
    self.http.set('Authorization', 'Bearer ' + data.access_token);
  });

  this.bus.on('data:*:status', function (data) {
    deep_extends(self, data);
  });

  this.bus.on('data:*:process:exception', function (data) {
    if (self.exceptions_summary == null) return;

    data.forEach(function (excpt) {
      if (!self.exceptions_summary[excpt.process.server])
        self.exceptions_summary[excpt.process.server] = {};
      if (!self.exceptions_summary[excpt.process.server][excpt.process.name])
        self.exceptions_summary[excpt.process.server][excpt.process.name] = 0;
      self.exceptions_summary[excpt.process.server][excpt.process.name]++;
    });
  });
};

Bucket.prototype = {

  resetStateBucket: function () {
    var self = this;

    this.servers = {};
    this.current_raw = null;
    this.apps = {};
  },

  /**
   * Retrieve Bucket from public key
   *
   * @param  {string} public_id   Bucket public key
   * @param  {callback} cb        description
   */
  retrieve: function (public_id, cb) {
    var self = this;

    this.http
      .get(this.root_url + '/bucket')
      .end(function (err, res) {
        if (err)
          return cb(err);
        for (var i = 0; i < res.body.length; i++) {
          if (res.body[i].public_id === public_id) {
            self.current_raw = res.body[i];
            self._id = self.current_raw._id;
            self.URL = self.current_raw.node_cache.endpoints.web + '/api/bucket/' + self.current_raw._id;
            return cb(null, self.current_raw);
          }
        };
        return cb(new Error("Failed to find bucket"), null);
      });
  },


  /**
   * Connect to bucket from public key
   *
   * @param  {string} public_id Public key
   */
  connect: function (public_id) {
    var self = this;

    this.retrieve(public_id, function (err, bucket) {
      if (err) return self.bus.emit('error:bucket', err);
      self.bus.emit("bucket:active", { id: self.current_raw._id, endpoint: self.current_raw.node_cache.endpoints.web });
    });
  },

  /**
   * Retrieve Bucket from ID
   *
   * @param  {string} raw_id      Bucket ID
   * @param  {callback} cb        Callback
   */
  retrieveFromID: function (raw_id, cb) {
    var self = this;

    this.http
      .get(this.root_url + '/bucket/' + raw_id)
      .end(function (err, res) {
        if (err)
          return cb(err);
        self.current_raw = res.body;
        self._id = self.current_raw._id;
        self.URL = self.current_raw.node_cache.endpoints.web + '/api/bucket/' + self.current_raw._id;
        return cb(null, res.body);
      });
  },

  /**
   * Connect to bucket from id
   *
   * @param  {string} raw_id Bucket Id
   */
  connectFromID: function (raw_id) {
    var self = this;
    this.retrieveFromID(raw_id, function (err, bucket) {
      if (err) return self.bus.emit('error:bucket', err);

      self.bus.emit("bucket:active", { id: self.current_raw._id, endpoint: self.current_raw.node_cache.endpoints.web });
    });
  },

  /**
   * Populate all bucket information
   *
   * @param  {function} cb Callback
   */
  init: function (cb) {
    var self = this;
    this.all(function (err, buckets) {
      if (err) throw new Error(err);
      self.available = buckets;
      if (cb) return cb(null, buckets);
    });
  },

  /**
   * Retrieve all bucket information
   *
   * @param  {function} cb Callback
   */
  all: function (cb) {
    this.http
      .get(this.root_url + '/bucket')
      .end(function (err, res) {
        return cb(err, res.body);
      });
  },

  /**
   * Find current user role
   *
   * @param  {function} cb Callback
   */
  fetchUserRole: function (cb) {
    this.http
      .get(this.URL + '/current_role')
      .end(function (err, res) {
        if (err)
          return cb(err);
        return cb(null, res.text);
      });
  },

  /**
   * Retrieve current bucket information
   *
   * @param  {function} cb Callback
   */
  get: function (cb) {
    var self = this;

    this.http
      .get(this.URL)
      .end(function (err, res) {
        if (err)
          return cb(err);
        self.current_raw = res.body;
        return cb(null, res.body);
      });
  },

  /**
   * Retrieve avalaible Keymetrics plans
   *
   * @param  {function} cb Callback
   */
  getPlans: function (cb) {
    if (typeof window != 'undefined' && window.WIDGET_MODE === true)
      return cb(null, {});
    this.http
      .get(this.root_url + '/misc/plans')
      .end(function (err, res) {
        return cb(err, res.body);
      });
  },

  getCurrentPlan: function () {
    if (!this.current_raw || !this.current_raw.credits) return null;

    return this.current_raw.credits.offer_type;
  },

  /**
   * Retrieve probe data history
   *
   * @param  {object} opts Options
   * @param  {object} opts.app_name Application name
   * @param  {object} opts.server_name Server name
   * @param  {object} opts.minutes Minutes
   * @param  {object} opts.interval interval
   * @param  {function} cb Callback
   */
  getProbesHistory: function (opts, cb) {
    var URL = this.URL + '/data/probes/histogram';

    if (opts.app_name) URL += '?app_name=' + opts.app_name;
    if (opts.server_name) URL += '&server_name=' + opts.server_name;
    if (opts.minutes) URL += '&minutes=' + opts.minutes;
    if (opts.interval) URL += '&interval=' + opts.interval;

    this.http
      .get(URL)
      .end(function (err, res) {
        cb(err, res.body);
      });
  },

  /**
   * Retrieve probe meta history
   *
   * @param  {object} opts Options
   * @param  {object} opts.app_name Application name
   * @param  {object} opts.server_name Server name
   * @param  {object} opts.minutes Minutes
   * @param  {function} cb Callback
   */
  getProbesMeta: function (opts, cb) {
    var URL = this.URL + '/data/probes?app_name=' + opts.app_name;

    if (opts.minutes) URL += '&minutes=' + opts.minutes;
    if (opts.server_name) URL += '&server_name=' + opts.server_name;

    this.http
      .get(URL)
      .end(function (err, res) {
        return cb(err, res.body);
      });

  },

  /**
   * Retrieve servers metadata
   *
   * @param  {function} cb Callback
   */
  getMetaServers: function (cb) {
    this.http
      .get(this.URL + '/meta_servers')
      .end(function (err, res) {
        return cb(err, res.body);
      });
  },

  /**
   * Save server metadata
   *
   * @param  {object} server  Server
   * @param  {function} cb    Callback
   */
  saveMetaServer: function (server, cb) {
    this.http
      .post(this.URL + '/server/update', server)
      .send(server)
      .end(function (err, res) {
        if (err)
          return cb(err);
        return cb(null, res.body);
      });
  },

  /**
   * Update server metadata
   *
   * @param  {object} server  Server
   * @param  {function} cb    Callback
   */
  update: function (data, cb) {
    this.http
      .put(this.URL)
      .send(data)
      .end(function (err, res) {
        if (err)
          return cb(err);
        return cb(null, res.body);
      });
  },

  //Restricted, official client only
  retrieveCoupon: function (coupon, cb) {
    this.http
      .post(this.root_url + '/misc/stripe/retrieveCoupon', { coupon: coupon })
      .end(function (err, response) {
        return cb(err, response);
      });
  },

  claimTrial: function (bucket_id, cb) {
    if (typeof (bucket_id) == 'function') {
      cb = bucket_id;
      bucket_id = this.current_raw._id;
    }

    http
      .put(this.URL + '/start_trial')
      .end(function (err, response) {
        return cb(err, response);
      });
  },


  getSubscription: function (cb) {
    http.get(this.URL + '/subscription')
      .end(function (err, res) {
        return cb(err, res);
      });
  },

  refreshSubscription: function () {
    var self = this;

    this.getSubscription(function (err, subscription) {
      if (err) return console.error(err.message || err);
      if (subscription.trial_end && moment().diff(subscription.trial_end * 1000) < 0) {
        subscription.trial_ends_in = moment(subscription.trial_end * 1000).fromNow();
        subscription.is_trial = true;
      }
      else
        subscription.is_trial = false;
      self.current_subscription = subscription;
    });
  },

  delete: function (cb) {
    var self = this;
    var old_id = this.current_raw._id;

    http
      .delete(this.URL)
      .end(function (err, items) {
        if (err) return cb(err);

        self.unset();

        self.available.forEach(function (_buck, i) {
          if (_buck._id == old_id)
            self.available.splice(i, 1);
        });
        return cb(null, items);
      });
  },

  createClassic: function (data, cb) {
    this.http.post(this.root_url + '/bucket/create_classic')
      .send(data)
      .end(function (err, res) {
        return cb(err, res.body);
      });
  },

  upgrade: function (data, cb) {
    this.http.post(this.URL + '/upgrade', data)
      .end(function (err, response) {
        if (err)
          return cb(err);
        Bucket.set(response['bucket']);
        return cb(err, response);
      });
  },

  sendFeedback: function (feedback, cb) {
    this.http.put(this.URL + '/feedback', {
      feedback: feedback
    }).success(function (err, items) {
      return cb(err, items);
    });
  },

  //Formatting in front end
  sortByLoadAvg: function (new_status) {
    var index = this
      .sorted_servers
      .map(function (dt) {
        return dt[0];
      })
      .indexOf(new_status.server_name);

    if (index == -1) {
      this.sorted_servers.push([
        new_status.server_name,
        Math.floor(new_status.data.server.loadavg[0])
      ]);
    }
    else {
      this.sorted_servers[index] = [
        new_status.server_name,
        new_status.data.server.loadavg[0]
      ];
    }

    if (_refresh_sorting == (Bucket.sorted_servers.length * 5)) {
      _refresh_sorting = 0;
      this.sorted_servers.sort(function (a, b) {
        return a[1] < b[1] ? 1 : -1;
      });
      console.log(this.sorted_servers);
    }
    _refresh_sorting++;
  },

  appIsShowable: function (app_name) {
    if (this.selected_app_name) {
      if (this.selected_app_name == app_name)
        return true;
      else
        return false;
    }
    else
      return true;
  },

  isServerActive: function (server_name) {
    if (this.servers[server_name] && this.servers[server_name].data.active)
      return true;
    return false;
  },

  isAppActive: function (app_name) {
    if (!this.getAppObjectFromAppName(app_name))
      return false;
    return true;
  },

  findServerByName: function (name) {
    var self = this;
    var ret_server;

    Object.keys(this.servers).forEach(function (server_key) {
      if (self.servers[server_key].server_name == name)
        ret_server = self.servers[server_key];
    });

    return ret_server;
  },

  findMemoryForServer: function (name) {
    var server = this.findServerByName(name);

    return server.data.server.total_mem;
  },

  dumpModuleToConsole: function (app_name) {
    var k = Object.keys(this.apps[app_name].organization)[0];
    var j = Object.keys(this.apps[app_name].organization[k]);
    console.log(JSON.stringify(this.apps[app_name].organization[k][j].status));
  },

  findByName: function (name) {
    var buck;

    this.available.forEach(function (bucket) {
      if (bucket.name == name) {
        buck = bucket;
      }
    });
    return buck;
  },

  activeServers: function () {
    var self = this;
    var active_servers = {};

    Object.keys(this.servers).forEach(function (server_key) {
      if (self.servers[server_key].data &&
        self.servers[server_key].data.active) {
        active_servers[server_key] = self.servers[server_key];
      }
    });
    return active_servers;
  },

  activeProcesses: function () {
    var active_servers = this.activeServers();
    var active_processes = [];

    Object.keys(active_servers).forEach(function (server_key) {
      active_processes = active_processes.concat(active_servers[server_key].data.processes);
    });

    return active_processes;
  },

  getAppObjectFromAppName: function (app_name) {
    var servers = Object.keys(this.apps_server);
    var app = null;

    for (var i = 0; i < servers.length; i++) {
      app = this.apps_server[servers[i]][app_name];

      if (app) break;
    }

    return app;
  },

  serverIsShowable: function (server_name) {
    if (this.selected_server_name) {
      if (this.selected_server_name == server_name)
        return true;
      else
        return false;
    }
    else
      return true;
  },

  appOptionIsEnabled: function (app_name, option) {
    var ret = false;
    var self = this;

    Object
      .keys(this.apps[app_name].organization)
      .forEach(function (server) {
        var app = self.apps[app_name].organization[server];

        Object.keys(app).forEach(function (sub_app_key) {
          var sub_app = app[sub_app_key];

          if (sub_app.status.axm_options[option])
            ret = true;
        });
      });
    return ret;
  }
};

Bucket.prototype.set = function (bucket) {
  var self = this;

  this.resetStateBucket();
  this.current_raw = bucket;
  this.current_name = bucket.name;

  this.getPlans(function (err, plans) {
    self.current_plan = plans[self.current_raw.credits.offer_type];
  });
};

Bucket.prototype.unset = function () {
  this.resetStateBucket();
  this.current_raw = null;
  this.current_name = '';
  this.current_plan = {};
};

module.exports = Bucket;
