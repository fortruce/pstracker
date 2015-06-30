var EventEmitter = require('events').EventEmitter;
var util = require('util');
var ps = require('node-ps');

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
  console.log('close');
  this._close = true;
  this.removeAllListeners();
};

PSNotifier.prototype._track = function() {
  if (this._close) {
    return;
  }

  ps.lookup(this._lookup, function (err, results) {
    if (err) {
      this._close = true;
      this.emit('error', err);
      return;
    }

    if (!this._current) {
      this._current = set(results);
      var spawned = diff(this._current, Object.create(null));
      this._emitArr('spawned', spawned);
      return;
    }

    var next = set(results);
    var spawned = diff(next, this._current);
    if (spawned) {
      this._emitArr('spawned', spawned);
    }

    var killed = diff(this._current, next);
    if (killed) {
      this._emitArr('killed', killed);
    }

    this._current = next;
  }.bind(this));

  setTimeout(this._track.bind(this), this._interval);
};

PSNotifier.prototype._emitArr = function(ev, arr) {
  arr.forEach(function (a) {
    this.emit(ev, a);
  }.bind(this));
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