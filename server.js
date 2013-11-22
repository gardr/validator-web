var pack = require('./package.json');
var development = process.env.NODE_ENV !== 'production';
var log = require('./lib/logger.js');
var Hapi = require('hapi');
var config = require('./lib/config.js');
Hapi.joi.version('v2');

var run = require('./lib/getReport.js');

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

var CleanCSS = require('clean-css');
var cssMinifier = new CleanCSS().minify;
var dataTypes = {
    'js': 'application/javascript',
    'css': 'text/css',
    'html': 'text/html'
};


function doWrite(str){
    return 'document.write(\''+str+'\');';
}


var htmlparser = require('htmlparser2');
var soupselect = require('soupselect');
var select = soupselect.select;
var toHtml = require('htmlparser-to-html');
function trimHtml(str) {
    var output = {
        body: ''
    };
    var handler = new htmlparser.DomHandler(function(err, dom) {
        var body = select(dom, 'body')[0];
        if (body){
            output.body = toHtml(body.children);
        } else {
            output.body = toHtml(dom);
        }

    });
    new htmlparser.Parser(handler).parseComplete(str);
    return output.body.replace(/(\r\n|\n|\r)/gm, '\\n').replace(/'/gmi, "\\'");
}

server.route({
    method: 'GET',
    path: '/user-input.js',
    config: {
        handler: function (request, response) {
            var id      = request.query.id;
            var dataKey = request.query.key;
            var data    = simpleStorage[id];

            if (id && data && !dataKey){
                // if no key, append all
                var res = '';

                if (data.css) {
                    res += doWrite('<style>'+cssMinifier(data.css)+'</style>');
                }

                if (data.html) {
                    var trimmed = trimHtml(data.html);
                    res += doWrite(trimmed);
                }

                var scriptUrl = data.url + '&key=js&';
                res += doWrite("<script src=\\'"+scriptUrl+"\\'></script>");

                this.reply(res).type('application/javascript');
                log.info('served composed file');
            } else if (id && data && data[dataKey]) {
                this.reply(data[dataKey]).type(dataTypes[dataKey]);
                log.info('served '+dataTypes[dataKey]+' ok:' + id);
            } else {
                this.reply('console.log("ID ('+id+') has expired.");').type('application/javascript');
                log.warn('served '+dataTypes[dataKey]+' fail:' + id);
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

var fs = require('fs');
var path = require('path');
server.route({
    method: 'GET',
    path: '/screenshots/{id}/{filename}',
    config: {
        handler: function (request, response){
            var id          = this.params.id;
            var filename    = this.params.filename;
            var data        = simpleStorage[id];
            if (data){
                var imagePath = path.join(data.harvest.imageOutputDir, filename);
                this.reply(fs.createReadStream(imagePath)).type('image/png');
            } else {
                this.reply('The image was not found').code(404);
            }

        }
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
            var html = request.payload.html;
            var css = request.payload.css;

            simpleStorage.count++;
            if (simpleStorage.count > 20){
                simpleStorage = {count: 0};
            }

            simpleStorage[id] = {
                id: id,
                time: new Date(),
                url: url,
                js: js,
                html: html,
                css: css
            };

            //console.log(request);

            if (js) {
                simpleStorage[id].previewUrl = simpleStorage[id].url = 'http://' + request.info.host + '/user-input.js?id=' + id + '&timestamp=' + Date.now();
            } else {
                simpleStorage[id].previewUrl = simpleStorage[id].url;
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
                js: Hapi.types.String().optional().allow(''),
                css: Hapi.types.String().optional().allow(''),
                html: Hapi.types.String().optional().allow('')
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

var hoek = require('hoek');
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
                view = hoek.clone(simpleStorage[id]);
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

            if (view.showForm){
                if (!view.js){
                    view.hideCodeInput = true;
                }
            }

            if (development) {
                view.debugInfo = JSON.stringify(view, null, 2);
            }

            this.reply.view('index.html', view);
        },
        validate: {
            query: {
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

server.route({
    method: 'GET',
    path: '/client/{path*}',
    handler: {
        directory: {
            path: './client',
            listing: false,
            index: true
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

server.start();

log.info(pack.name, 'v' + pack.version, 'started on port', PORT);
