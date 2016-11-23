var uuid = require('uuid');
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

var processStamp = '_' + Date.now() + process.pid;

var TIMEOUT_SECONDS = 120;

internals.phantomWorker = function(data, next){
    var id = data && data.id;
    log.info(id + ' processStamp', {processStamp: processStamp, id: id});

    var timeout = new Date(data.state.queued);
    timeout.setSeconds(timeout.getSeconds() + TIMEOUT_SECONDS);

    // dont allow same job to retry for too long, if level-jobs/queue-system doesnt abort job
    var now = new Date();
    if (now >= timeout){
        data.state.timedout = new Date();
        data.error = {
            error: true,
            message: 'Something went wrong, processing timed out. Code 002.'
        };
        log.error('Something went wrong, processing timed out. Code 002. (Runtime Error):', {id: id});
        return storage.set(id, data, next);
    }

    getReport(data, function (err, harvest, report) {

        data.state.processed = new Date();

        if (err) {
            data.error = {
                error: true,
                err: {
                    message: err.message,
                    stack: err.stack
                },
                message: 'An error occured. Code 002.\n\r ' + err.message
            };
            log.error('An error occured. Code 002. (Runtime Error):', {error: err, id: id});
            storage.set(id, data);
            // set success on job to avoid retries
            return next();
        }

        var hasNoAppError = (data && !data.error);
        var hasOutput = harvest && report;

        log.info('getReport returned result from phamtom', {
            'id': id,
            'hasNoAppError': !!hasNoAppError,
            'hasOutput': !!hasOutput
        });

        if (hasNoAppError || ((!err || hasNoAppError) && data && hasOutput)) {
            data.harvest = harvest;
            try{
                data.report = formatReport(report);
            } catch(e){
                data.error = {
                    message: 'Formatting of report failed for '+id,
                    error: true,
                    err: {
                        message: e.message,
                        stack: e.stack
                    }
                };
                log.error(data.error.message);
            }
        }

        log.info('Formating done, saving result.', {'id': id});
        storage.set(id, data, next);
     });
};

var _queue;
internals.queue = function(id){
    if (!_queue){
        _queue = jobs(internals.phantomWorker, 5, 60);
    }
    if (id){
        _queue.push(id);
    }
};

if (process.env.NODE_ENV !== 'test'){
    internals.queue();
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
        var host = data.runnerConfig.resourceDomainBase;
        var contentType = response.headers['content-type'];
        if (contentType && contentType.indexOf('javascript') > -1) {
            data.base        = internals.getBase(data.output.url);
            data.output.js   = body.toString('utf8');
            data.output.url  = internals.generateUserEntryUrl(host, data.id);
        } else if (contentType && contentType.indexOf('html') > -1) {
            data.base        = internals.getBase(data.output.url);
            data.output.html = body.toString('utf8');
            data.output.url  = internals.generateUserEntryUrl(host, data.id);
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

    log.info('Generating new validation '+id,{id: id});

    if (internals.hasCodePayload(data.input)) {

        data.output.url  = internals.generateUserEntryUrl(data.runnerConfig.resourceDomainBase, id);
        data.output.html = data.input.html || null;
        data.output.css  = data.input.css || null;
        data.output.js   = data.input.js || null;

        if (internals.hasZipFile(data.input.zip)) {
            data.base = data.host + '/zip/' + id + '/';
            unzip(data.input.zip, data, saveAndReply);
        } else {
            data.base = internals.getBase(data.output.url);
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

var payloadSchema = Joi.object().keys({
    'formatId': Joi.string().required(),
    'formatSubId': Joi.string().required(),
    'formatIndex': Joi.number().required().min(0),
    'html': Joi.string().optional().allow(''),
    'css': Joi.string().optional().allow(''),
    'js': Joi.string().optional().allow(''),
    'url': Joi.string().optional(),
    'zipfile': Joi.any().optional()
}).without('url', ['html', 'js', 'css']).without('zipfile', ['url', 'html', 'css', 'js']);

var getTmpDir = require('../tmpDir.js');

module.exports = {
    method: 'POST',
    path: '/validate',
    config: {
        handler: internals.requestHandler,
        validate: {
            query: false,
            payload: payloadSchema
        },
        payload: {
            maxBytes: 500000,
            parse: true,
            output: 'file',
            uploads: getTmpDir()
        }
    }
};
