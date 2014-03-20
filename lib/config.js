var os = require('os');
var convict = require('convict');
var pckage = require('../package.json');
var path = require('path');

// temp hack
var defaultPort = process.env.HTTP_PORT||process.env.PORT||8000;
var defaultHost = 'localhost:'+defaultPort;

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
        'default': defaultPort,
        env: 'PORT'
    },
    host: {
        doc: 'Default host',
        format: '*',
        'default': defaultHost,
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
    }
});



var env = conf.get('env');
function addFile(name){
    return path.resolve(path.join(__dirname, '..', 'config', name+'.json'));
}

function addFileCWD(name){
    return path.resolve(path.join(process.cwd(), name));
}


conf.loadFile(addFile('defaults'));
conf.loadFile(addFile(env));
if (process.env.CONFIG_FILE_BASE){
    var configFilePath = addFileCWD(process.env.CONFIG_FILE_BASE+'_'+env+'.json');
    conf.loadFile(configFilePath);
}
conf.validate();

// Export merged configuration to the application

module.exports = conf;
