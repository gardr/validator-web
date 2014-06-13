var uuid = require('node-uuid');
var urlLib = require('url');
var request = require('request');
var Joi = require('joi');

var log = require('../logger.js');
var storage = require('../storage.js');
var config = require('../config.js');
var unzip = require('../unzip.js');
var getReport = require('../report/index.js');
var runnerConfig = require('../report/runnerConfig.js');
var formatReport = require('../formatReport.js');


var internals = {};


var jobs = require('../jobs.js');

internals.phantomWorker = function(data, next){
    getReport(data, function (err, harvest, report) {
        data.state.processed = new Date();
        if (err) {
            data.error = {
                error: true,
                err: {
                    message: err.message,
                    stack: err.stack
                },
                message: 'An error occured. Code 002. ' + err.message
            };
            log.error('An error occured. Code 002 (User input / Runnner Error):', err);
            return storage.set(data.id, data);
        }

        var hasPredefinedError = (data && !data.error);
        var hasOutput = harvest && report;

        if (hasPredefinedError || ((!err || hasPredefinedError) && data && hasOutput)) {
            data.harvest = harvest;
            data.report = formatReport(report);
        }

        storage.set(data.id, data, next);
     });
};

var _queue;
internals.queue = function(id){
    if (!_queue){
        _queue = jobs(internals.phantomWorker, 5, 60)
    }
    _queue.push(id);
}

internals.generateUserEntryUrl = function (host, id) {
    return [host, '/user-entry.js?id=', id, '&timestamp=', Date.now()].join('');
};

internals.createValidationDataStartpoint = function (id, payload) {
    var data = {
        'id': id,
        // base is populated with user entry base path
        'base': null,
        // host for entry scripts
        'host': 'http://127.0.0.1:' + config.get('port'),
        'state': {
            'started': new Date(),
            'queued': null,
            'processed': null,
        },
        'input': {
            'html': payload.html || null,
            'css': payload.css || null,
            'url': payload.url || null,
            'js': payload.js || null,
            'zip': payload.zipfile || null
        },
        'output': {
            // url for preview and runner
            // css, js, html for code editor
        },
        'format': {
            'id': payload.formatId,
            'subId': payload.formatSubId,
            'index': payload.formatIndex
        },
        'runnerConfig': null,
        'report': null,
        'harvest': null,
        'error': null
    };

    data.runnerConfig = runnerConfig(data);

    return (data);
};

internals.hasCodePayload = function (input) {
    return !!(input.js || input.html || input.zip && typeof input.zip.bytes === 'undefined' || input.zip && input.zip.bytes > 0);
};

internals.hasZipFile = function (z) {
    return z &&
        z.headers &&
        z.headers['content-type'] &&
        (
            z.headers['content-type'].indexOf('zip') > -1 ||
            // some browsers uses wrong contentType
            z.headers['content-type'].indexOf('application/octet-stream') > -1
        ) &&
        z.bytes > 0;
};

internals.hasInvalidUrl = function (url) {
    return !url || url.indexOf('http') !== 0;
};

var HOST_HEADERS = ["x-forwarded-host", "host"];
internals.getHost = function (headers) {
    var result;
    HOST_HEADERS.some(function (key) {
        if (headers && key && headers[key]) {
            result = 'http://' + headers[key];
            return true;
        }
    });
    return result;
};

internals.getBase = function (url) {
    var parsed, output;
    try {
        parsed = urlLib.parse(url);
        delete parsed.search;
        delete parsed.path;
        delete parsed.query;
        delete parsed.hash;
        output = urlLib.resolve(urlLib.format(parsed), './');
    } catch (e) {}
    return output || url;
};

internals.requestInititalDataPayload = function (data, saveAndReply) {
    var conf = data.runnerConfig;

    if (!conf.userAgent) {
        throw new Error('Missing UserAgent from configuration');
    }

    request.get(data.output.url, {
        'timeout': 1000,
        'User-Agent': conf.userAgent
    }, resultHandler);

    function resultHandler(err, response, body) {
        if (err) {
            data.error = {
                error: true,
                err: err,
                message: 'URL request returns error. Code 030'
            };
            return saveAndReply();
        } else if (response.statusCode !== 200) {
            data.error = {
                error: true,
                message: 'URL returns invalid response-code: ' + response.statusCode + '. Code 031'
            };
            return saveAndReply();
        }

        var contentType = response.headers['content-type'];
        if (contentType && contentType.indexOf('javascript') > -1) {
            data.base        = internals.getBase(data.output.url);
            data.output.js   = body.toString('utf8');
            data.output.url  = internals.generateUserEntryUrl(data.host, data.id);
        } else if (contentType && contentType.indexOf('html') > -1) {
            data.base        = internals.getBase(data.output.url);
            data.output.html = body.toString('utf8');
            data.output.url  = internals.generateUserEntryUrl(data.host, data.id);
        } else {
            data.error = {
                error: true,
                message: 'Invalid content-type header from URL. Supported types are html or javascript. Code 032'
            };
        }
        saveAndReply();
    }
};

internals.requestHandler = function(req, reply) {

    var session = req.state.session;
    if (!session) {
        session = {
            id: uuid.v4()
        };
    }
    session.last = Date.now();
    var id = storage.createId(session.id);
    var data = internals.createValidationDataStartpoint(id, req.payload);

    var host = internals.getHost(req.raw.req.headers);
    if (host) {
        data.host = host;
    }

    if (internals.hasCodePayload(data.input)) {
        data.output.url  = internals.generateUserEntryUrl(data.host, id);
        data.output.html = data.input.html || null;
        data.output.css  = data.input.css || null;
        data.output.js   = data.input.js || null;

        if (internals.hasZipFile(data.input.zip)) {
            unzip(data.input.zip, data, saveAndReply);
        } else {
            saveAndReply();
        }
    } else {
        if (internals.hasInvalidUrl(data.input.url)) {
            data.error = {
                error: true,
                message: 'Invalid URL passed in: ' + data.input.url + '. Code 033'
            };
            return saveAndReply();
        }
        data.output.url = data.input.url;
        // fetch first resource and store it for local serving
        internals.requestInititalDataPayload(data, saveAndReply);
    }

    function saveAndReply() {
        storage.set(data.id, data, function () {
            if (!data.error) {
                internals.queue(data.id);
            }
            reply().redirect('/result?id=' + id).state('session', session);

        });
    }
};

module.exports = {
    method: 'POST',
    path: '/validate',
    config: {
        handler: internals.requestHandler,
        validate: {
            query: false,
            payload: {
                'formatId': Joi.string().required(),
                'formatSubId': Joi.string().required(),
                'formatIndex': Joi.number().required().min(0),
                'html': Joi.string().without('url').without('zipfile').optional().allow(''),
                'css': Joi.string().optional().allow(''),
                'js': Joi.string().optional().allow(''),
                'url': Joi.string().optional().without('html').without('zipfile'),
                'zipfile': Joi.any().optional()
            }
        },
        payload: {
            maxBytes: 500000,
            parse: true,
            output: 'file',
            uploads: config.get('tmpDir')
        }
    }
};
