const ease = require('./easing.js').ease;

class Anim {
  constructor(resolution = 20) {
    this.fxStack = [];
    this.interval = null;
    this.resolution = resolution;
  }

  add(to, duration = this.resolution, options = {}) {
    options.easing = options.easing || 'linear';

    this.fxStack.push({ 'to': to, 'duration': duration, 'options': options });
    return this;
  }

  delay(duration) {
    this.add({}, duration);
    return this;
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
    }

    this.fxStack = [];
  }

  run(universe, onFinish) {
    let config = {};
    let startTime = 0;
    let duration = 0;
    let animationStep;
    let iid = null;

    const stack = [ ...this.fxStack ];

    const animSetup = () => {
      animationStep = stack.shift();
      // don't believe setInterval will be accurate
      // (most importantly with a resolution of 1ms...)
      startTime = performance.now();

      /**
       * Set duration and force to be at least one
       * @type Number
       */
      duration = !isNaN(animationStep.duration) && animationStep.duration < this.resolution ?
        this.resolution : animationStep.duration;

      config = {};

      for (const k in animationStep.to) {
        config[k] = {
          'start': universe.get(k),
          'end': animationStep.to[k],
          'options': animationStep.options,
        };
      }
    };

    const animStep = () => {
      const newValues = {};
      const now = performance.now();
      const dt = now - startTime;

      for (const k in config) {
        const entry = config[k];
        const easing = ease[entry.options.easing];
        const { start, end } = entry;

        const factor = easing(Math.min(dt, duration), 0, 1, duration);

        newValues[k] = Math.round(start + factor * (end - start));
      }

      universe.update(newValues);

      if (dt > duration) {
        if (stack.length > 0) {
          animSetup();
        } else {
          clearInterval(iid);

          if (onFinish) {
            onFinish();
          }
        }
      }
    };

    animSetup();

    iid = this.interval = setInterval(animStep, this.esolution);

    return this;
  }

  runLoop(universe) {
    const doAnimation = () => {
      this.run(universe, () => {
        setImmediate(doAnimation);
      });
    };

    doAnimation();

    return this;
  }
}

module.exports = Anim;
