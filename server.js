var pack = require('./package.json');
var development = process.env.NODE_ENV !== 'production';
var log = require('./logger.js')
var Hapi = require('hapi');

Hapi.joi.version('v2');

var run = require('./lib/getReport.js');

var uuidValidator = Hapi.types.String().required().regex(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);

// Create a server with a host and port
var PORT = 8000;

var options = {
    views: {
        basePath: __dirname,
        path: 'templates',
        engines: {
            html: 'handlebars'
        },
        partialsPath: 'templates',
        isCached: false // dev only
    },
    cache: {
        engine: 'memory'
    },
    labels: ['web']
};

var server = Hapi.createServer('0.0.0.0', PORT, options);

// report json endpoint
server.route({
    method: 'GET',
    path: '/report',
    config: {
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
                url: Hapi.types.String().required() //.regex(/^http/i)
            }
        }
    }
});

// report json endpoint
var uuid = require('node-uuid');
var simpleStorage = {count: 0};

server.route({
    method: 'GET',
    path: '/user-input.js',
    config: {
        handler: function (request, response) {
            var id = request.query.id;
            if (id && simpleStorage[id] && simpleStorage[id].js) {
                this.reply(simpleStorage[id].js).type('application/javascript');
                log.info('served javascript ok:' + id);
            } else {
                this.reply('console.log("Missing input");').type('application/javascript');
                log.warn('served javascript fail:' + id);
            }
        }
        /*, validate forces parameters, but we dont know what comes from pasties-js
        validate: {
            query: {
                id: uuidValidator,
                timestamp: Hapi.types.String().optional().allow('')
            }
        }*/
    }
});

server.route({
    method: 'POST',
    path: '/validate',
    config: {
        handler: function (request, response) {
            var id = uuid.v4();
            var url = request.payload.url;
            var js = request.payload.js;

            simpleStorage.count++;
            if (simpleStorage.count > 20){
                simpleStorage = {count: 0};
            }

            simpleStorage[id] = {
                id: id,
                time: new Date(),
                url: url,
                js: js
            };

            //console.log(request);

            if (js) {
                simpleStorage[id].url = 'http://' + request.info.host + '/user-input.js?id=' + id + '&timestamp=' + Date.now();
            }

            this.reply.redirect('/result?id=' + id);

            //var options = {};
            run(simpleStorage[id].url, id, function (err, harvest, report) {
                simpleStorage[id].processed = new Date();
                if (err) {
                    simpleStorage[id].error = {
                        error: true,
                        err: err
                    };
                    log.error('Run Error:', err);
                } else {
                    simpleStorage[id].harvest = harvest;
                    simpleStorage[id].report = report;
                    log.info('Run done:'+ id);
                }

            });
        },
        validate: {
            payload: {
                url: Hapi.types.String().regex(/^http/i).allow(''), //.without('js')
                js: Hapi.types.String().optional().allow('')
            }
        }
    }
});

var moment = require('moment');

function getNoIDView() {
    return {
        processed: false,
        error: true,
        err: {
            message: 'ID has expired'
        },
        showForm: true,
        showStatus: false
    };
}

server.route({
    method: 'GET',
    path: '/result',
    config: {
        handler: function (request, response) {
            var id = request.query.id;
            var view;

            if (!simpleStorage[id]) {
                view = getNoIDView();
            } else {
                view = simpleStorage[id];
            }

            view.pack = pack;
            view.showForm = true;

            if (view.js && view.url){
                view.hideUrlInput = true;
            }

            if (view.report) {
                view.showStatus = false;
                view.showResultTable = (view.report.error.length > 0 || view.report.warn.length > 0 || view.report.info.length > 0);
            } else if (typeof view.processed === 'undefined') {
                view.showStatus = true;
                view.runtime = moment().diff(view.time);
                view.reloadIn = (15000 - moment().diff(view.time));
            }

            if (development) {
                view.debugInfo = JSON.stringify(view, null, 2);
            }

            this.reply.view('index.html', view);
        },
        validate: {
            query: {
                id: uuidValidator
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

server.route({
    method: 'GET',
    path: '/',
    config: {
        handler: function (request) {
            request.reply.view('index.html', {
                pack: pack,
                showForm: true
            });
        }
    }
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

log.info(pack.name, 'v' + pack.version, 'started on port', PORT);
