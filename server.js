var bunyan = require('bunyan');
var Hapi = require('hapi');
var run = require('./lib/getReport.js');

// Create a server with a host and port
var PORT = 8000;

var options = {
    views: {
        path: 'templates',
        engines: {
            html: 'handlebars'
        },
        isCached: false // dev only
    },
    cache: {
        engine: 'memory'
    }
};

var server = Hapi.createServer('0.0.0.0', PORT, options);


var config = {
    'handler': function (request, response) {
        console.log('handling', request.query.url);
        run(request.query.url, function (err, harvest, report) {
            if (err) {
                return this.reply({
                    error: true,
                    err: err
                });
            }
            this.reply({
                harvest: harvest,
                report: report
            });
        }.bind(this));
    },
    'validate': {
        query: {
            url: Hapi.types.String().required().regex(/^http/i)
        }
    }
};

// report json endpoint
server.route({
    method: 'GET',
    path: '/report',
    config: config
});

// report json endpoint
server.route({
    method: 'GET',
    path: '/validate',
    config: {
        handler: function(request, response){
            run(request.query.url, function (err, harvest, report) {
                if (err) {
                    return this.reply.view('index.html', {
                        url: request.query.url,
                        error: true,
                        err: err,
                        debugInfo: JSON.stringify(err, null, 4)
                    });
                }
                var viewData = {
                    'url': request.query.url,
                    'harvest': harvest,
                    'report': report,
                    'success': report.error.length === 0,
                    'debugInfo': JSON.stringify({ harvest: harvest, report: report }, null, 4)
                };
                this.reply.view('index.html', viewData);
            }.bind(this));
        },
        validate: {
            query: {
                url: Hapi.types.String().required().regex(/^http/i)
            }
        }
    }
});

var browserify = require('browserify');
server.route({
    method: 'GET',
    path: '/main.js',
    config: {
        'handler': function (request, response) {
            var b = browserify();
            b.add('./client/main.js');
            this.reply(b.bundle()).type('application/javascript');
        },
        cache: { expiresIn: 9000000000 }
    }
});

// static files endpoint
server.route({
    method: 'GET',
    path: '/fixtures/{path*}',
    handler: {
        directory: {
            path: './test/unit/fixtures',
            listing: false,
            index: true
        }
    }
});

// preview
server.route({
    method: 'GET',
    path: '/preview/{path*}',
    handler: {
        directory: {
            path: './node_modules/pasties-js/target/pasties-js',
            listing: false,
            index: true
        }
    }
});

// bootstrap css
server.route({
    method: 'GET',
    path: '/components/{path*}',
    handler: {
        directory: {
            path: './bower_components',
            listing: false,
            index: true
        }
    }
});

var pack = require('./package.json');
var preview = {
    handler: function (request) {
        // Render the view with the custom greeting
        request.reply.view('index.html', {
            pack: pack
        });
    }
};

// preview endpoint
server.route({
    method: 'GET',
    path: '/',
    config: preview
});

server.route({
    method: 'GET',
    path: '/status',
    config: {
        handler: function(){
            this.reply('ok');
        }
    }
});

// Start the server
server.start();

var pack = require('./package.json');
console.log(pack.name, 'v' + pack.version, 'running on port', PORT);
