var pack        = require('./package.json');
var development = process.env.NODE_ENV !== 'production';
var log         = require('./lib/logger.js');
var Hapi        = require('hapi');
var config      = require('./lib/config.js');

Hapi.joi.version('v2');

// Create a server with a host and port
var PORT = config.get('httpServerPort');
var options = {
    views: {
        basePath: __dirname,
        path: 'templates',
        engines: {
            html: 'handlebars'
        },
        partialsPath: 'templates',
        isCached: !development
    },
    cache: {
        engine: 'memory'
    },
    labels: ['web']
};

var server = new Hapi.Server('0.0.0.0', PORT, options);

server.route(require('./lib/routes/frontpage.js'));
server.route(require('./lib/routes/userInput.js'));
server.route(require('./lib/routes/screenshots.js'));
server.route(require('./lib/routes/validate.js'));
server.route(require('./lib/routes/result.js'));
server.route(require('./lib/routes/status.js'));
server.addRoutes(require('./lib/routes/static.js').routes);

server.start();

log.info(pack.name, 'v' + pack.version, 'started on port', PORT, 'logs at', config.get('logFileName'));
