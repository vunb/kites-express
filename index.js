var _ = require('lodash');
var main = require('./lib/main');
var config = require('./kites.config');

module.exports = function express(options) {
    // extend options
    _.merge(config.options, options);
    config.directory = __dirname;
    config.main = main;
    return config;
}