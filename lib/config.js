var os = require('os');
var convict = require('convict');
var pckage = require('../package.json');
var path = require('path');

var conf = convict({
    env: {
        format: ['development', 'production'],
        'default': 'development',
        env: 'NODE_ENV'
    },
    port: {
        format: 'port',
        'default': process.env.HTTP_PORT || 8000,
        env: 'PORT'
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
    formats: {
        doc: 'Options/defaults for formats',
        format: '*',
        'default': {}
    }
});

if (process.env.CONFIG_FILE) {
    console.log('process.env.CONFIG_FILE', process.env.CONFIG_FILE);
    conf.loadFile(
        path.resolve(
            path.join(process.cwd(), process.env.CONFIG_FILE)
        )
    );
}

//conf.loadFile(addFile('defaults'));
conf.load({"formats": require('../config/formats.js')});
conf.validate();

module.exports = conf;
