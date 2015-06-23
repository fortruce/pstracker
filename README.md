# PSTracker

A Node.js module for tracking process spawning and killing.

PSTracker emits `spawned` and `killed` events for a particular process tracked
by either pid or command (as provided by [ps-node](https://www.npmjs.com/package/ps-node)).

## Install

```bash
$ npm install pstracker
```

## Usage

Create a tracker for a particular process with a specified `pid`:

```javascript
var psn = require('pstracker');

var t = psn({ pid: 12345 });

// registers listeners for 'spawned' and 'killed' events
t.on('spawned', function (proc) {
  console.log('spawned:', proc);
});
t.on('killed', function (proc) {
  console.log('killed:', proc);
});
```

Or use a RegExp to filter `command` and `arguments` to track a process(es):

```javascript
var psn = require('pstracker');

var t = psn({
  command: 'node',
  arguments: '--debug'
});

// register listeners for 'spawned and 'killed' events
...
```

**Note: When multiple process match a filter, individual `spawned` and `killed`
events will be fired per process match.**