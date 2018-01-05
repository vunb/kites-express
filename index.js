var main = require('./lib/kites.express');
var config = require('./kites.config');

module.exports = function (options) {
    config.options = options;
    config.directory = __dirname;
    config.main = main;
    return config;
}