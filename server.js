var pack        = require('./package.json');
var development = process.env.NODE_ENV !== 'production';
var log         = require('./lib/logger.js');
var Hapi        = require('hapi');
var config      = require('./lib/config.js');

var serverOptions = {
    views: {
        basePath: __dirname,
        path: 'templates',
        engines: {
            html: 'handlebars'
        },
        layout: true,
        partialsPath: 'templates/partials',
        isCached: !development
    },
    payload: {
        uploads: config.get('tmpDir')
    },
    cache: {
        engine: 'catbox-memory'
    },
    labels: ['web'],
    load: {
        sampleInterval: 500
    }
};

var server = new Hapi.Server('0.0.0.0', config.get('port'), serverOptions);

server.state('session', {
    ttl: 24 * 60 * 60 * 1000,
    isSecure: false,
    path: '/',
    encoding: 'base64json'
});

server.route(require('./lib/routes/frontpage.js'));
server.route(require('./lib/routes/entry.js'));
server.route(require('./lib/routes/userInput.js'));
server.route(require('./lib/routes/screenshots.js'));
server.route(require('./lib/routes/serveZip.js'));
server.route(require('./lib/routes/validate.js'));
server.route(require('./lib/routes/result.js'));
server.route(require('./lib/routes/static.js').routes);
server.route({
    method: 'GET',
    path: '/status',
    config: {
        handler: function (request, reply) {
            var hasSomeLoad = server.load.eventLoopDelay < 10;
            var healthStatus = hasSomeLoad ? 'ok' : 'load';

            reply({
                health: healthStatus,
                load: server.load
            });
        }
    }
});


if (process.env.NODE_ENV !== 'test'){
    server.start();
    log.info(pack.name, 'v' + pack.version, 'started on port', config.get('port'), 'logs at', config.get('logFileName'));
}


module.exports = server;
