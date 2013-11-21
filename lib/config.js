var convict = require('convict');
var pckage = require('../package.json');

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
        env: 'PASTIES_HTTP_PORT'
    },
    logFileName: {
        doc: 'Log file location',
        format: '*',
        'default': './logs/' + pckage.name,
        env: 'PASTIES_LOG_FILE_NAME'
    }
});

var env = conf.get('env');
var configFile = '../config/' + env + '.json';
conf.loadFile(configFile);
conf.validate();

// Export merged configuration to the application

module.exports = conf;
