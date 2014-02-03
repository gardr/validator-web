var config = require('../../config.js');
var os = require('os');
var pathLib = require('path');

module.exports = function getTmpDir(id){
    var tmpDir = config.get('tmpDir');
    if (!tmpDir || typeof tmpDir === 'undefined' || tmpDir === 'undefined'){
        tmpDir = os.tmpdir();
    }
    return pathLib.resolve(pathLib.join(tmpDir, id));
};