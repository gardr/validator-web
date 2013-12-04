var convict = require('convict');
var pckage = require('../package.json');
var path = require('path');

var conf = convict({
    env: {
        doc: 'Applicaton environments',
        format: ['development', 'production'],
        'default': 'development',
        env: 'NODE_ENV'
    },
    httpServerPort: {
        doc: 'Node port',
        format: 'port',
        'default': 8000,
        env: 'HTTP_PORT'
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
        env: 'TMP_DIR'
    }
});

var env = conf.get('env');
var configFile = path.resolve(path.join(__dirname, '..', 'config', env+'.json'));
conf.loadFile(configFile);
conf.validate();

// Export merged configuration to the application

module.exports = conf;
