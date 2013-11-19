var development = process.env.NODE_ENV !== 'production';
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
    },
    labels: ['web']
};

var server = Hapi.createServer('0.0.0.0', PORT, options);

var config = {
    'handler': function (request, response) {
        run(request.query.url, id, function (err, harvest, report) {
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
var uuid = require('node-uuid');

var simple = {};

server.route({
    method: 'GET',
    path: '/validate',
    config: {
        handler: function (request, response) {
            var id = uuid.v4();

            simple[id] = {time: new Date()};

            this.reply.redirect('/result?id=' + id + '&url=' + encodeURIComponent(request.query.url));

            //var options = {};
            run(request.query.url, id, function (err, harvest, report) {
                if (err) {
                    console.log('Error:', err);
                    return simple[id].error = {
                        url: request.query.url,
                        error: true,
                        err: err
                    };
                }
                simple[id].data = {
                    'harvest': harvest,
                    'report': report
                };
                console.log('done', id);
            });
        },
        validate: {
            query: {
                url: Hapi.types.String().required().regex(/^http/i)
            }
        }
    }
});

var moment = require('moment');

server.route({
    method: 'GET',
    path: '/result',
    config: {
        handler: function (request, response) {
            var id = request.query.id;

            var harvest;
            var report;
            if (simple[id] && simple[id].data){
                harvest = simple[id].data.harvest;
                report = simple[id].data.report;
            }


            var view = {
                url: request.query.url,
                id: request.query.id,
                hasId: !!simple[id],
                harvest: harvest,
                report: report,
                runtime: simple[id] && (moment().diff(simple[id].time) +'ms'),
                reloadIn: simple[id] && (15000 - moment().diff(simple[id].time)),
                showStatus: simple[id] && (!simple[id].data && !simple[id].error),
                error: simple[id] && simple[id].error,
                showResultTable: simple[id] && !!simple[id].data && (report.error.length > 0||report.warn.length > 0||report.info.length > 0)
            };

            if (!simple[id]){
                view.error = true;
                view.err = {message: 'ID has expired'};
            }

            if (development){
                view.debugInfo = JSON.stringify(view, null, 2);
            }

            this.reply.view('index.html', view);
        },
        validate: {
            query: {
                url: Hapi.types.String().required().regex(/^http/i),
                id: Hapi.types.String().required().regex(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i)
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
        cache: {
            expiresIn: 9000000000
        }
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
        handler: function () {
            this.reply('ok');
        }
    }
});

// Start the server
server.start();

var pack = require('./package.json');
console.log(pack.name, 'v' + pack.version, 'running on port', PORT);
