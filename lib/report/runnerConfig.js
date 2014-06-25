var Hoek    = require('hoek');
var gardr   = require('gardr-validator');
var config  = require('../config.js');
var getTmpDir = require('../tmpDir.js');
var config = require('../config.js');

function normalizeSizeValue(obj, keyList) {
    keyList.forEach(function(key) {
        obj[key] = (
            typeof obj[key] === 'number'  || typeof obj[key] === 'string' ? {
                min: obj[key],
                max: obj[key]
            } :
            obj[key]
        );
    });
}

var formats = config.get('formats');
var runnerConfigDefaults  = config.get('runner');

/**
 * Get config by user selected params.
 */
module.exports = function (data) {

    var result;
    var output;

    if (config.get('env') === 'development'){
        require('colors');
        console.log(
            '\n$.format.id:    '.red + data.format.id,
            '\n$.format.subId: '.red + data.format.subId,
            '\n$.format.index: '.red + data.format.index
        );
    }


    formats.some(function(format) {
        if (data.format.id == format.name) {
            result = Hoek.clone(format);
            return true;
        }
    });

    if (!result) {
        throw new Error('data.format.id not found in serverconfiguration. Please check formats.js');
    }


    var subFormatConfig;
    if (data.format.subId !== 'default' && result.subFormats) {
        if (result.subFormats[data.format.subId]) {
            subFormatConfig = result.subFormats[data.format.subId];
        } else {
            throw new Error('Missing subformat');
        }
    }

    if (result.formats && result.formats.length > 0) {
        // default or custom format
        if (result.formats[data.format.index]) {
            output = result.formats[data.format.index];
        } else {
            output = result.formats[0];
        }

        if (typeof output.width === 'undefined' && typeof result.width !== 'undefined') {
            output.width = result.width;
        }

        if (typeof output.height === 'undefined' && typeof result.height !== 'undefined') {
            output.height = result.height;
        }

        if (typeof output.viewport === 'undefined' && typeof result.viewport !== 'undefined') {
            output.viewport = result.viewport;
        }

        normalizeSizeValue(output, ['width', 'height']);

        if (result.config) {
            // merge config with default
            output.config = Hoek.merge(result.config, output.config);
        }

        if (subFormatConfig){
            output = Hoek.merge(output, subFormatConfig);
        }

        if (!output.viewport){
            output.viewport = {};
            if (typeof output.height.max === 'number'){
                output.viewport.height = output.height.max;
            }
            if (typeof output.width.max === 'number'){
                output.viewport.width = output.width.max;
            }
        }

    } else {
        throw new Error('No formats defined.');
    }

    if (config.get('env') === 'development'){
        require('colors');
        console.log('RUNNER CONFIG - output:'.blue, (JSON.stringify(output, null, 4)+'').blue.bold);
    }


    // output runnerConfig defaults
    Object.keys(runnerConfigDefaults).forEach(function(key){
        if (!output[key]){
            output[key] = runnerConfigDefaults[key];
        }
    });

    output.format = {
        id: data.format.id,
        subId: data.format.subId,
        index: data.format.index
    };

    output.outputDirectory = getTmpDir(data.id);
    output.id = data.id;
    // todo validate input


    // get runner defaults from gardr-validator
    output = Hoek.applyToDefaults(gardr.defaults, output);

    // console.log('getSelectedConfig extended', output);

    return output;
};

// module.exports({format: {id: 'finn', subId: 'default', index: 2}, output: {}, id: 'ads'});
// module.exports({format: {id: 'finn-responsive', subId: 'default', index: 2}, output: {}, id: 'ads'});
// module.exports({format: {id: 'mobil-vg', subId: 'tactus', index: 0}, output: {}, id: 'ads'});
// module.exports({format: {id: 'mobil-vg', subId: 'default', index: 3}, output: {}, id: 'ads'});
