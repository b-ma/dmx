const { EventEmitter } = require('events');

class NullDriver extends EventEmitter {
  constructor(deviceId, options) {
    super();

    options = options || {};
    this.universe = Buffer.alloc(513, 0);
    this.start();
    this.timeout = null;
  }

  start() {
    // prevent starting twice...
    clearInterval(this.timeout);

    this.timeout = setInterval(() => {
      console.log(this.universe);
    }, 1000);
  }

  stop() {
    clearInterval(this.timeout);
  }

  close(cb) {
    cb(null);
  }

  update(u) {
    for (const c in u) {
      this.universe[c] = u[c];
    }

    console.log(this.universe.slice(1));

    this.emit('update', u);
  }

  updateAll(v) {
    for (let i = 1; i <= 512; i++) {
      this.universe[i] = v;
    }
  }

  get(c) {
    return this.universe[c];
  }
}

module.exports = NullDriver;
