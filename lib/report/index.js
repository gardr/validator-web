var log = require('../logger.js');
var Hoek = require('hoek');
var spawnValidator = require('gardr-validator');
var mkdirp = require('mkdirp');
var fs = require('fs');
var pathLib = require('path');

module.exports = function (data, callback) {
    if (!data || !data.output || !data.output.url ) {
        if (callback){
            return callback({message: 'Missing phantom url'}, null);
        } else {
            throw new Error('Missing callback');
        }
    }

    data.runnerConfig.scriptUrl = data.output.url;

    var msg = ['Spawning / Processing', data && data.id, ' Spawning in ', data && data.runnerConfig.width, 'x', data && data.runnerConfig.height].join(' ');
    log.info(msg);

    if (data && data.runnerConfig && data.runnerConfig.outputDirectory){
        mkdirp(data.runnerConfig.outputDirectory, function(err){
            if (!err){
                log.info('writing input for phantomjs to: '+data.runnerConfig.outputDirectory);
                fs.writeFile(pathLib.join(data.runnerConfig.outputDirectory, 'debug-input-'+Date.now()+'.json'), JSON.stringify(data));
            }
        });
    }
    // console.log(msg);
    spawnValidator(data.runnerConfig, callback);
};
