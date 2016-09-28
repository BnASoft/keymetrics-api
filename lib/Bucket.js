'use strict';

var request = require('superagent');
var Data = require('./Bucket/Data.js');

function Bucket(URL, eventemitter2, id) {
  var self = this;
  if (!(this instanceof Bucket)) {
    return new Bucket(URL);
  }

  this._id = id || null;
  this.current_raw = null;
  this.baseURL = URL;
  this.URL = URL + '/bucket';
  this.eventemitter2 = eventemitter2;
  this.token = null;
  this.avalaible = [];

  this.resetStateBucket();
  this.ev_binded = false;
  this.isReady(this.bindEvents());
  this.Data = new Data(this.baseURL);

  this.eventemitter2.on('current:id', function(id) {
    self._id = id;
    self.URL = self.baseURL + '/bucket/' + id;
    self.Data.URL = self.URL;
  });

  this.eventemitter2.on('current:token', function(token) {
    self.token = token;
    self.Data.token = token;
  })
};

Bucket.prototype = {
  isReady: function(cb) {
    if (this.readyStatus == true && this.current_raw._id)
      setTimeout(cb, 1);
    else
      this.eventemitter2.on('realtime:ready', function(data) {
        return cb(data);
      });
  },

  resetStateBucket: function() {
    var self = this;

    this.servers = {};
    this.current_raw = null;
    this.apps = {};

    self = Object.assign(self, {
      current_raw          : null,
      current_subscription : {},
      current_plan         : {},

      servers              : {},
      apps_server          : {},
      apps                 : {},
      exceptions           : {},

      // Used as a limited size array for
      // Displaying mini charts on widgets
      mini_metrics         : {},

      // For select box
      selected_server_name : '',
      selected_app_name    : '',
      _server_list         : {}
    });
  },

  bindEvents: function() {
    var self = this;
    if (this.ev_binded == true) return;
    this.ev_binded = true;

    this.eventemitter2.on('*:status', function(data) {
      if (self.readyStatus == false) return;
      //console.log(data.data.active);
      //if (!data.data.active)
      //data.data.active = true;
      self.reformat(data);
    });

    this.eventemitter2.on('*:process:exception', function(data) {
      if (self.readyStatus == false) return;
      if (self.exceptions_summary == null) return;

      data.forEach(function(excpt) {
        if (!self.exceptions_summary[excpt.process.server])
          self.exceptions_summary[excpt.process.server] = {};
        if (!self.exceptions_summary[excpt.process.server][excpt.process.name])
          self.exceptions_summary[excpt.process.server][excpt.process.name] = 0;
        self.exceptions_summary[excpt.process.server][excpt.process.name]++;
      });
    });
  },

  reformat: function(status) {
      var self = this;
      // Populate Bucket.servers
      self.servers[status.server_name] = status;

      if (!self._server_list[status.server_name])
        // Mainly used for select box on navbar
        self._server_list[status.server_name] = {
          server_name : status.server_name
        };

      var k1 = Object.keys(self.apps);
      var l1 = k1.length;
      for (var i = 0; i < l1; i++) {
        self.apps[k1[i]].organization[status.server_name] = {};
      }

      /*********************
       * Aggregate application by name using all servers
       *********************/
      status.data.process.forEach(function(proc) {
        /**
         * If the server is not active don't take the app into account
         */
        //if (!status.data.active) return false;

        if (!self.apps[proc.name])
          self.apps[proc.name] = {
            name : proc.name,
            organization : {}
          };

        // if (!self.apps_flat_list[status.server_name + ':' + proc.name]) {
        //   self.apps_flat_list[status.server_name + ':' + proc.name] = {
        //     name : proc.name,
        //     server : status.server_name,
        //     raw : {}
        //   };
        // }


        if (!self.apps[proc.name].organization[status.server_name])
          self.apps[proc.name].organization[status.server_name] = {};

        if (!self.apps[proc.name].organization[status.server_name][proc.pm_id])
          self.apps[proc.name].organization[status.server_name][proc.pm_id] = {};

        return self.apps[proc.name].organization[status.server_name][proc.pm_id].status = proc;
      });

      /*********************
       * Aggregate application by name using only one server
       *********************/
      if (!self.apps_server)
        self.apps_server = {};

      if (!self.apps_server[status.server_name])
        self.apps_server[status.server_name] = {};

      self.apps_server[status.server_name] = {};

      status.data.process.forEach(function(proc) {
        if (self.apps_server[status.server_name][proc.name]) {
          self.apps_server[status.server_name][proc.name].process_count++;
          self.apps_server[status.server_name][proc.name].memory += proc.memory;
          self.apps_server[status.server_name][proc.name].raw[proc.pm_id] = angular.copy(proc);
          return false;
        }

        self.apps_server[status.server_name][proc.name] = angular.copy(proc);
        self.apps_server[status.server_name][proc.name].process_count = 1;
        self.apps_server[status.server_name][proc.name].raw = {};
        self.apps_server[status.server_name][proc.name].raw[proc.pm_id] = angular.copy(proc);

        return false;
      });


      Object.keys(self.apps_server[status.server_name]).forEach(function(proc_key) {
        var proc = self.apps_server[status.server_name][proc_key];

        if (!self.mini_metrics[status.server_name])
          self.mini_metrics[status.server_name] = {};

        if (!self.mini_metrics[status.server_name][proc.name])
          self.mini_metrics[status.server_name][proc.name] = {
            cpu : FixedQueue(60),
            mem : FixedQueue(60)
          };

        self.mini_metrics[status.server_name][proc.name].cpu.push(proc.cpu);
        self.mini_metrics[status.server_name][proc.name].mem.push(Math.round(proc.memory / (1024 * 1024)));
      });


      /**
       * Delete removed processes
       */
      Object.keys(self.apps).forEach(function(key) {
        if (Object.keys(self.apps[key].organization[status.server_name]).length == 0) {
          delete self.apps[key].organization[status.server_name];
        }
      });
    },


  activeServers: function() {
    var active_servers = {};

    Object.keys(this.servers).forEach(function(server_key) {
      if (this.servers[server_key].data &&
          this.servers[server_key].data.active) {
        active_servers[server_key] = this.servers[server_key];
      }
    });
    return active_servers;
  },

  activeProcesses: function() {
    var active_servers = this.activeServers();
    var active_processes = [];

    Object.keys(active_servers).forEach(function(server_key) {
      active_processes = active_processes.concat(active_servers[server_key].data.processes);
    });

    return active_processes;
  },

  getAppObjectFromAppName: function(app_name) {
    var servers = Object.keys(this.apps_server);
    var app     = null;

    for (var i = 0; i < servers.length ; i++) {
      app = this.apps_server[servers[i]][app_name];

      if (app) break;
    }

    return app;
  },

  getId: function(public_id, cb) {
    var self = this;

    request
      .get(this.URL)
      .set('Authorization', 'Bearer ' + this.token)
      .end(function(err, res) {
        if (err)
          return cb(err);
        for (var i = 0; i < res.body.length; i++) {
          if (res.body[i].public_id === public_id) {
            self.current_raw = res.body[i];
            return cb(null, self.current_raw._id);
          }
        };
        return cb(new Error("Failed to find bucket"), null);
      });
  },

  init: function(cb) {
    var self = this;
    this.all(function(err, buckets) {
      if (err) throw new Error(err);
      self.available = buckets;
      if (cb) return cb(null, buckets);
    });
  },

  all: function(cb) {
    request
      .get(this.baseURL + '/bucket')
      .set('Authorization', 'Bearer ' + this.token)
      .end(function(err, res) {
        return cb(err, res.body);
      });
  },

  fetchUserRole: function(cb) {
    var URL = this.URL + '/current_role';

    request
      .get(URL)
      .set('Authorization', 'Bearer ' + this.token)
      .end(function(err, res) {
        if (err)
          return cb(err);
        return cb(null, res.text);
      });
  },

  get: function(cb) {
    var self = this;
    var URL = this.URL;

    request
      .get(URL)
      .set('Authorization', 'Bearer ' + this.token)
      .end(function(err, res) {
        if (err)
          return cb(err);
        self.current_raw = res.body;
        return cb(null, res.body);
      });
  },

  getPlans: function(cb) {
    if (typeof window != 'undefined' && window.WIDGET_MODE === true)
        return cb(null, {});
    request
      .get(this.baseURL + '/misc/plans')
      .set('Authorization', 'Bearer ' + this.token)
      .end(function(err, res) {
        return cb(err, res.body);
      });
  },

  getCurrentPlan: function() {
    if (!this.current_raw || !this.current_raw.credits) return null;

    return this.current_raw.credits.offer_type;
  },

  getProbesHistory: function(opts, cb) {
      var URL = this.URL + '/data/probes/histogram';

      if (opts.app_name) URL += '?app_name=' + opts.app_name;
      if (opts.server_name) URL += '&server_name=' + opts.server_name;
      if (opts.minutes) URL += '&minutes=' + opts.minutes;
      if (opts.interval) URL += '&interval=' + opts.interval;

      request
        .get(URL)
        .set('Authorization', 'Bearer ' + this.token)
        .end(function(err, res) {
          cb(err, res.body);
        });
    },

  getProbesMeta: function(opts, cb) {
    var URL = this.URL + '/data/probes?app_name=' + opts.app_name;

    if (opts.minutes) URL += '&minutes=' + opts.minutes;
    if (opts.server_name) URL += '&server_name=' + opts.server_name;

    request
      .get(URL)
      .set('Authorization', 'Bearer ' + this.token)
      .end(function(err, res) {
        return cb(err, res.body);
      });

  },

  getMetaServers: function(cb) {
    var self = this;

    this.isReady(function() {
    var URL = self.URL + '/meta_servers';

    request
      .get(URL)
      .set('Authorization', 'Bearer ' + self.token)
      .end(function(err, res) {
        return cb(err, res.body);
      });
    });
  },

  saveMetaServer: function(server, cb) {
    var URL = this.URL + '/server/update';

    request
      .post(URL, server)
      .send(server)
      .set('Authorization', 'Bearer ' + this.token)
      .end(function(err, res) {
        if (err)
          return cb(err);
        return cb(null, res.body);
      });
  },

  update: function(data, cb) {
    var URL = this.URL;

    request
      .put(URL)
      .send(data)
      .set('Authorization', 'Bearer ' + this.token)
      .end(function(err, res) {
        if (err)
          return cb(err);
        return cb(null, res.body);
      });
  }
};

Bucket.prototype.set = function(bucket) {
  var self = this;

  this.resetStateBucket();
  this.current_raw = bucket;
  this.current_name = bucket.name;
  this.readyStatus = true;

  this.getPlans(function(err, plans) {
    self.current_plan = plans[self.current_raw.credits.offer_type];
  });
};

Bucket.prototype.unset = function() {
  this.resetStateBucket();
  this.current_raw = null;
  this.current_name = '';
  this.current_plan = {};
  this.readyStatus = false;
};

module.exports = Bucket;