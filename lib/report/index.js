var log = require('../logger.js');
var pathLib = require('path');
var Hoek = require('hoek');
var spawnValidator = require('pasties-validator');
var os = require('os');

function resolve(url) {
    var args = [__dirname, '..', '..'].concat(url.split('/'));
    var result = pathLib.join.apply(null, args);
    return pathLib.resolve(result);
}

var options = {
    hooks: {
        errors: true,
        har: true,
        log: true,
        actions: resolve('lib/report/hook/actions.js'),
        css: resolve('lib/report/hook/css.js'),
        images: resolve('lib/report/hook/images.js'),
        timers: resolve('lib/report/hook/timers.js'),
        jquery: resolve('lib/report/hook/jquery.js'),
        pasties: resolve('lib/report/hook/pasties.js')
    },
    validators: {
        errors: true,
        har: true,
        log: true,
        css: resolve('lib/report/validator/css.js'),
        images: resolve('lib/report/validator/images.js'),
        timers: resolve('lib/report/validator/timers.js'),
        jquery: resolve('lib/report/validator/jquery.js'),
        pasties: resolve('lib/report/validator/pasties.js')
    },
    pageRunTime: 10000
};

var resolveFilepathsToOptions = {
    parentUrl: 'lib/report/resources/parent.html',
    managerScriptPath: 'node_modules/pasties-js/target/pasties-js/js/pasties/mobile.js',
    iframeUrl: 'node_modules/pasties-js/target/pasties-js/html/pasties/mobile.htm',
    managerInitPath: 'lib/report/resources/manager.js'
};

Object.keys(resolveFilepathsToOptions).forEach(function (key) {
    options[key] = resolve(resolveFilepathsToOptions[key]);
});

module.exports = function (scriptUrl, id, callback) {
    if (!scriptUrl) {
        return callback({message: 'Missing url'}, null);
    }
    var opts = Hoek.clone(options);
    opts.id = id;
    opts.outputDirectory = pathLib.resolve(pathLib.join(os.tmpdir(), id));
    opts.scriptUrl = scriptUrl;

    log.info('validator processing', id, 'output to', opts.outputDirectory);
    spawnValidator(opts, callback);
};
