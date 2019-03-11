const util = require('util');
const EventEmitter = require('events').EventEmitter;

class DMX extends EventEmitter {
  constructor(options) {
    super();

    const opt = options || {};
    const devices = opt.devices || {};

    this.universes = {};
    this.drivers = {};
    this.devices = Object.assign({}, require('./devices'), devices);
    this.animation = require('./anim');

    this.registerDriver('null', require('./drivers/null'));
    this.registerDriver('dmx4all', require('./drivers/dmx4all'));
    this.registerDriver('enttec-usb-dmx-pro', require('./drivers/enttec-usb-dmx-pro'));
    this.registerDriver('enttec-open-usb-dmx', require('./drivers/enttec-open-usb-dmx'));
    this.registerDriver('dmxking-ultra-dmx-pro', require('./drivers/dmxking-ultra-dmx-pro'));
    this.registerDriver('artnet', require('./drivers/artnet'));
    this.registerDriver('bbdmx', require('./drivers/bbdmx'));
  }

  registerDriver(name, module) {
    this.drivers[name] = module;
  }

  addUniverse(name, driver, deviceId, options) {
    this.universes[name] = new this.drivers[driver](deviceId, options);

    this.universes[name].on('update', (channels) => {
      this.emit('update', name, channels);
    });

    return this.universes[name];
  }

  update(universe, channels) {
    this.universes[universe].update(channels);
  }

  updateAll(universe, value) {
    this.universes[universe].updateAll(value);
    this.emit('updateAll', universe, value);
  }

  universeToObject(universeKey) {
    const universe = this.universes[universeKey];
    const u = {};

    for (let i = 0; i < 512; i++) {
      u[i] = universe.get(i);
    }
    return u;
  }
}

DMX.devices = require('./devices');
DMX.Animation = require('./anim');

module.exports = DMX;