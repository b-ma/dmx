const ease = require('./easing.js').ease;
// const resolution = 1;

class Anim {
  constructor(resolution = 0.2) {
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
    // let ticks = 0;
    let startTime = 0;
    let duration = 0;
    let animationStep;
    let iid = null;

    const stack = [ ...this.fxStack ];

    const aniSetup = () => {
      animationStep = stack.shift();
      // ticks = 0;
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

    const aniStep = () => {
      const newValues = {};
      const now = performance.now();
      const dt = startTime - now;

      for (const k in config) {
        const entry = config[k];
        const easing = ease[entry.options.easing];
        const { start, end } = entry;
        const k = easing(Math.min(dt, duration), 0, 1, duration);

        newValues[k] = Math.round(start + k * (end - start));
      }

      // ticks = ticks + resolution;
      universe.update(newValues);

      if (dt > duration) {
        if (stack.length > 0) {
          aniSetup();
        } else {
          clearInterval(iid);

          if (onFinish) {
            onFinish();
          }
        }
      }
    };

    aniSetup();

    iid = this.interval = setInterval(aniStep, this.esolution * 1000);

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
