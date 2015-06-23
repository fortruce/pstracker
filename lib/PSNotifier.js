var EventEmitter = require('events').EventEmitter;
var util = require('util');
var ps = require('ps-node');

function PSNotifier(lookup, opts) {
  if (!(this instanceof PSNotifier))
    return new PSNotifier(lookup);

  EventEmitter.call(this);

  this._lookup = lookup;
  this._current = undefined;

  // assign options or defaults
  opts = opts || {};
  this._interval = opts.interval || 5000;

  this._track();
}
util.inherits(PSNotifier, EventEmitter);

PSNotifier.prototype.close = function() {
  this._close = true;
};

PSNotifier.prototype._track = function() {
  if (this._close)
    return;

  ps.lookup(this._lookup, function (err, results) {
    if (!this._current) {
      this._current = set(results);
      return;
    }

    var next = set(results);
    var spawned = diff(next, this._current);
    if (spawned) {
      for (var i = 0; i < spawned.length; i++) {
        this.emit('spawned', spawned);
      }
    }

    var killed = diff(this._current, next);
    if (killed) {
      for (var q = 0; q < killed.length; q++) {
        this.emit('killed', killed);
      }
    }

    this._current = next;
  }.bind(this));

  setTimeout(this._track.bind(this), this._interval);
};

// Transform the results into a set
function set(results) {
  return results.reduce(function (coll, val) {
    coll[val.pid] = val;
    return coll;
  }, Object.create(null));
}

function diff(a, b) {
  var d = [];
  for (var k in a) {
    if (!(k in b))
      d.push(a[k]);
  }
  return d;
}

module.exports = PSNotifier;