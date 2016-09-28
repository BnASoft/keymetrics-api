'use strict';

var threads = require('threads');

var Worker = module.exports = function (opts) {
  var self = this;
  if (!(this instanceof Worker)) {
    return new Worker(opts);
  }

  Object.assign(this, opts);

  this.bus.on('raw:*:status', function (data) {
    data.event = this.event;
    self.formatStatus.send(data);
  })
  this.formatStatus.on('message', function (data) {
    self.bus.emit(data.event.replace('raw:', 'data:'), data);
  })
}

Worker.prototype.formatStatus = threads.spawn(function (status, done) {
  var formatted = { servers: {}, _server_list: {}, apps: {}, apps_server: {}, mini_metrics: {}, event: status.event};

  // Populate Bucket.servers
  formatted.servers[status.server_name] = status;

  if (!formatted._server_list[status.server_name])
    // Mainly used for select box on navbar
    formatted._server_list[status.server_name] = {
      server_name: status.server_name
    };

  var k1 = Object.keys(formatted.apps);
  var l1 = k1.length;
  for (var i = 0; i < l1; i++) {
    formatted.apps[k1[i]].organization[status.server_name] = {};
  }

  /*********************
   * Aggregate application by name using all servers
   *********************/
  status.data.process.forEach(function (proc) {
    /**
     * If the server is not active don't take the app into account
     */

    if (!formatted.apps[proc.name])
      formatted.apps[proc.name] = {
        name: proc.name,
        organization: {}
      };


    if (!formatted.apps[proc.name].organization[status.server_name])
      formatted.apps[proc.name].organization[status.server_name] = {};

    if (!formatted.apps[proc.name].organization[status.server_name][proc.pm_id])
      formatted.apps[proc.name].organization[status.server_name][proc.pm_id] = {};

    formatted.apps[proc.name].organization[status.server_name][proc.pm_id].status = proc;
  });

  /*********************
   * Aggregate application by name using only one server
   *********************/
  if (!formatted.apps_server)
    formatted.apps_server = {};

  if (!formatted.apps_server[status.server_name])
    formatted.apps_server[status.server_name] = {};

  formatted.apps_server[status.server_name] = {};

  /*status.data.process.forEach(function (proc) {
    if (formatted.apps_server[status.server_name][proc.name]) {
      formatted.apps_server[status.server_name][proc.name].process_count++;
      formatted.apps_server[status.server_name][proc.name].memory += proc.memory;
     // formatted.apps_server[status.server_name][proc.name].raw[proc.pm_id] = JSON.parse(JSON.stringify(proc));
    }
    else {
      formatted.apps_server[status.server_name][proc.name] = {}
      //formatted.apps_server[status.server_name][proc.name] = JSON.parse(JSON.stringify(proc));
      formatted.apps_server[status.server_name][proc.name].process_count = 1;
      formatted.apps_server[status.server_name][proc.name].raw = {};
      //formatted.apps_server[status.server_name][proc.name].raw[proc.pm_id] = JSON.parse(JSON.stringify(proc));
    }
  });*/


  Object.keys(formatted.apps_server[status.server_name]).forEach(function (proc_key) {
    var proc = formatted.apps_server[status.server_name][proc_key];

    if (!formatted.mini_metrics[status.server_name])
      formatted.mini_metrics[status.server_name] = {};

    if (!formatted.mini_metrics[status.server_name][proc.name])
      formatted.mini_metrics[status.server_name][proc.name] = {
        cpu: FixedQueue(60),
        mem: FixedQueue(60)
      };

    formatted.mini_metrics[status.server_name][proc.name].cpu.push(proc.cpu);
    formatted.mini_metrics[status.server_name][proc.name].mem.push(Math.round(proc.memory / (1024 * 1024)));
  });


  /**
   * Delete removed processes
   */
  Object.keys(formatted.apps).forEach(function (key) {
    if (Object.keys(formatted.apps[key].organization[status.server_name]).length == 0) {
      delete formatted.apps[key].organization[status.server_name];
    }
  });

  return done(formatted);
})
