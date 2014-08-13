var config = require('./config.js');
var pathLib = require('path');
var os = require('os');
var fs = require('fs');
var pack = require('../package.json');

var tmpDir;

function setup(){
    var appDir = pathLib.resolve(pathLib.join(__dirname, '..'));

    tmpDir = config.get('tmpDir');

    if (tmpDir){
        tmpDir = pathLib.resolve(tmpDir);
    }

    if (!tmpDir || typeof tmpDir === 'undefined' || tmpDir === 'undefined'){
        tmpDir = os.tmpdir();
    }

    if (appDir == tmpDir || !tmpDir) {
        tmpDir = pathLib.join(appDir, 'phantom_output_files_' + pack.version + '-' + (process.env.NODE_ENV||'X'));
        try{
            fs.mkdirSync(tmpDir);
        }catch(e){}
    }
}

module.exports = function(id){
    if (!tmpDir){
        setup();
    }
    return pathLib.join(tmpDir, id||'');
};
