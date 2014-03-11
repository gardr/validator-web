var os = require('os');
var convict = require('convict');
var pckage = require('../package.json');
var path = require('path');

var conf = convict({
    env: {
        doc: 'Applicaton environments',
        format: ['development', 'production', 'local'],
        'default': 'development',
        env: 'NODE_ENV'
    },
    httpServerPort: {
        doc: 'Node port',
        format: 'port',
        'default': 8000,
        env: 'HTTP_PORT'
    },
    host: {
        doc: 'Default host',
        format: '*',
        'default': 'localhost:8000',
        env: 'HOST'
    },
    logFileName: {
        doc: 'Log file location',
        format: '*',
        'default': './logs/' + pckage.name,
        env: 'LOG_FILE_NAME'
    },
    tmpDir: {
        doc: 'Tmp location for files',
        format: '*',
        'default': os.tmpdir(),
        env: 'TMP_DIR'
    },
    options: {
        doc: 'Options/defaults for input',
        format: '*',
        'default': {}
    },
    sites: {
        doc: 'Options/defaults for input',
        format: '*',
        'default': {}
    }

});

var env = conf.get('env');

function addFile(name){
    return path.resolve(path.join(__dirname, '..', 'config', name+'.json'));
}

conf.loadFile(addFile('defaults'));
conf.loadFile(addFile('sites'));
conf.loadFile(addFile(env));
conf.validate();

// Export merged configuration to the application

module.exports = conf;
