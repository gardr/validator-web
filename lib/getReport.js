var pathLib = require('path');
var Hoek = require('hoek');
var spawnValidator = require('../../validator/index.js');

function joinAndResolve(url) {
    var args = [__dirname, '..'].concat(url.split('/'));
    var result = pathLib.join.apply(null, args);
    return pathLib.resolve(result);
}

var options = {
    hooks: {
        errors: true,
        har: true,
        log: true,
        timers: joinAndResolve('lib/hook/timers.js'),
        jquery: joinAndResolve('lib/hook/jquery.js'),
        pasties: joinAndResolve('lib/hook/pasties.js')
    },
    validators: {
        errors: true,
        har: true,
        log: true,
        timers: joinAndResolve('lib/validator/timers.js'),
        jquery: joinAndResolve('lib/validator/jquery.js'),
        pasties: joinAndResolve('lib/validator/pasties.js')
    },
    pageRunTime: 1000
};

var resolveFilepathsToOptions = {
    parentUrl: 'lib/resources/parent.html',
    managerScriptPath: 'node_modules/pasties-js/target/pasties-js/js/pasties/mobile.js',
    iframeUrl: 'node_modules/pasties-js/target/pasties-js/html/pasties/mobile.htm',
    managerInitPath: 'lib/resources/manager.js',
    fallbackScriptUrl: 'lib/resources/inframe.js'
};

Object.keys(resolveFilepathsToOptions).forEach(function (key) {
    options[key] = joinAndResolve(resolveFilepathsToOptions[key]);
});

module.exports = function (scriptUrl, callback) {
    if (!scriptUrl) {
        return callback(new Error('Missing scriptUrl'), null);
    }
    var opts = Hoek.clone(options);
    opts.scriptUrl = scriptUrl || options.fallbackScriptUrl;

    spawnValidator(opts, callback);
};
