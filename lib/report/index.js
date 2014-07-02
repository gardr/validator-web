var log = require('../logger.js');
var Hoek = require('hoek');
var spawnValidator = require('gardr-validator');

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
    // console.log(msg);
    spawnValidator(data.runnerConfig, callback);
};
