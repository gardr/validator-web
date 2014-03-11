var log = require('../logger.js');
var pathLib = require('path');
var Hoek = require('hoek');
var spawnValidator = require('gardr-validator');
var getTmpDir = require('../tmpDir.js');

function resolve(url) {
    var args = [__dirname, '..', '..'].concat(url.split('/'));
    var result = pathLib.join.apply(null, args);
    return pathLib.resolve(result);
}

// todo fetch from defaults/sites
var options = {
    hooks: {
        'errors': true,
        'har': true,
        'log': true,
        'actions': true,
        'css': true,
        'script': true,
        'screenshots': true,
        'timers': true,
        'jquery': true,
        'gardr': true
    },
    preprocessors: {
        'screenshots': true,
        'har': true
    },
    validators: {
        'errors': true,
        'log': true,
        'css': true,
        'timers': true,
        'jquery': true,
        'gardr': true,
        'sizes': true,
        'codeUsage': true
    },
    pageRunTime: 10000
};

module.exports = function (data, callback) {
    if (!data || !data.output || data.output && !data.output.url) {
        if (callback){
            return callback({message: 'Missing phantom url'}, null);
        } else {
            throw new Error('Missing callback');
        }
    }
    var opts = Hoek.clone(options);

    opts.id         = data.id;
    opts.scriptUrl  = data.output.url;
    opts.options    = data.options;
    opts.target     = data.options.target;
    opts.userAgent  = data.options.userAgent;
    opts.outputDirectory = getTmpDir(opts.id);
    if (data.options && data.options.viewport){
        opts.width  = data.options.viewport.width;
        opts.height = data.options.viewport.height;
    }
    log.info('Processing', opts.id, 'output to', opts.outputDirectory, '. Spawning in ', opts.width, 'x', opts.height);
    spawnValidator(opts, callback);
};
