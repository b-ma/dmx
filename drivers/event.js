const { EventEmitter } = require('events');

class NullDriver extends EventEmitter {
  constructor(deviceId, options) {
    super();

    options = options || {};
    this.universe = Buffer.alloc(513, 0);
  }

  start() {}

  stop() {}

  close(callback) {
    callback(null);
  }

  update(u) {
    for (const c in u) {
      this.universe[c] = u[c];
    }

    this.emit('update', u, this.universe.slice(1));
  }

  updateAll(v) {
    const obj = {};

    for (let i = 1; i <= 512; i++) {
      obj[i] = v;
    }

    this.update(obj);
  }

  get(c) {
    return this.universe[c];
  }
}

module.exports = NullDriver;
