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
            html: require('handlebars')
        },
        layout: true,
        partialsPath: 'templates/partials',
        isCached: !development
    },
    payload: {
        uploads: config.get('tmpDir')
    },
    cache: require('catbox-memory'),
    labels: ['web'],
    load: {
        sampleInterval: 500
    },
    debug: {
        request: ['error']
    },
    state: {
        cookies: {
            failAction: 'ignore'
        }
    }
};

var server = new Hapi.Server('0.0.0.0', config.get('port'), serverOptions);

server.state('session', {
    ttl: 24 * 60 * 60 * 1000,
    isSecure: false,
    path: '/',
    encoding: 'base64json',

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
    var msg = [pack.name, 'v' + pack.version, 'started on port', config.get('port'), 'logs at', config.get('logFileName')].join(' ');
    log.info(msg);
    console.log(msg);
} else {
    console.log('Running server.js in NODE_ENV=test');
}


module.exports = server;
