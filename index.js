if (process.browser) { // this condition can be different but you get the point
  module.exports = require('./DMX-browser');
} else {
  module.exports = require('./DMX-node');
}
