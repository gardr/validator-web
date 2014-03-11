var log         = require('../logger.js');
var storage     = require('../storage.js');
var getReport   = require('../report');
var config      = require('../config.js');
var unzip       = require('../unzip.js');
var uuid        = require('node-uuid');
var Hoek        = require('hoek');
var request     = require('request');

var defaultOptions = config.get('options');
var ua = defaultOptions.userAgentOptions;

function generateUrl(id) {
    return [
        'http://', config.get('host'),
        '/user-entry.js?id=', id,
        '&timestamp=', Date.now()
    ].join('');
}
function getValidationData(id, payload, callback){

    var data  = {
        'id': id,
        'state': {
            'started': new Date(),
            'processed': null,
        },
        'input': {
            'html': payload.html||null,
            'css': payload.css||null,
            'url': payload.url||null,
            'js': payload.js||null,
            'zip': payload.zipfile||null
        },
        'output': {
            // url for preview and runner
            // css, js, html for code editor
        },
        'options': Hoek.applyToDefaults(defaultOptions, (typeof payload.options === 'object' ? payload.options : {})),
        'report': null,
        'harvest': null,
        'error': null
    };

    data.options.target    = payload.target !== 'mobile' ? 'tablet' : 'mobile';
    data.options.userAgent = data.options.userAgent||ua[data.options.target];

    if (payload.copyOptionsFromId){
        storage.get(payload.copyOptionsFromId, function(err, previousData){
            if (!err && previousData){
                log.info('Copied options from '+payload.copyOptionsFromId);
                data.options = Hoek.merge(previousData.options, data.options);
            }
            callback(data);
        });
    } else {
        callback(data);
    }
}

function setViewport(opt){
    if (!opt.viewport || (typeof opt.viewport === 'object' && Object.keys(opt.viewport).length === 0)){
        opt.viewport = defaultOptions.viewportOptions[opt.target];
    }
    if (opt.viewport && !opt.viewport.width){
        opt.viewport.width = defaultOptions.viewportOptions[opt.target].width;
    }
    if (opt.viewport && !opt.viewport.height){
        opt.viewport.height = defaultOptions.viewportOptions[opt.target].height;
    }
    return opt;
}

function hasCodePayload(input){
    return !!(input.js || input.html || input.zip && typeof input.zip.bytes === 'undefined' || input.zip && input.zip.bytes > 0);
}

function hasZipFile(z){
    return z && z.headers && z.headers['content-type'] && z.headers['content-type'].indexOf('zip') > -1 && z.bytes > 0;
}

function hasInvalidUrl(url){
    return !url || url.indexOf('http') !== 0;
}

function handler(req, reply) {

    var session = req.state.session;
    if (!session) {
        session = {
            id: uuid.v4()
        };
    }
    session.last = Date.now();
    var id = storage.createId(session.id);

    function runValidation(data){
        setViewport(data.options);

        if ( hasCodePayload(data.input) ) {
            data.output.url  = generateUrl(id);
            data.output.html = data.input.html||null;
            data.output.css  = data.input.css||null;
            data.output.js   = data.input.js||null;

            if (hasZipFile(data.input.zip)) {
                unzip(data.input.zip, data, saveAndReply);
            } else {
                saveAndReply();
            }
        } else {

            if (hasInvalidUrl(data.input.url)) {
                data.error = {
                    error: true,
                    message: 'Invalid URL passed in: ' + data.input.url + '. Code 033'
                };
                return saveAndReply();
            }
            data.output.url = data.input.url;
            requestInititalDataPayload(data, saveAndReply);
        }

        function saveAndReply() {
            storage.set(data.id, data, function(){

                reply().redirect('/result?id=' + id).state('session', session);

                if (!data.error) {
                    run(data);
                }
            });
        }
    }

    getValidationData(id, req.payload, runValidation);
}

function requestInititalDataPayload(data, saveAndReply){
    request.get(data.output.url, { 'timeout': 1000, 'User-Agent': data.options.userAgent }, resultHandler);

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
                message: 'URL returns invalid response-code: ' + response.statusCode+ '. Code 031'
            };
            return saveAndReply();
        }

        var contentType = response.headers['content-type'];
        if (contentType && contentType.indexOf('javascript') > -1) {
            data.output.js  = body.toString('utf8');
            data.output.url = generateUrl(data.id);
        } else if (contentType && contentType.indexOf('html') > -1) {
            data.output.html = body.toString('utf8');
            data.output.url  = generateUrl(data.id);
        } else {
            data.error = {
                error: true,
                message: 'Invalid content-type header from URL. Supported types are html or javascript. Code 032'
            };
        }
        saveAndReply();
    }
}

function bytesToClosestUnit(bytes) {
    var sizes = ['', 'KB', 'MB', 'GB', 'TB'];
    if (bytes == 0) {
        return '0';
    }
    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1000)), 10);
    return Math.round(bytes / Math.pow(1000, i), 2) + ' ' + sizes[i];
}

function formatSize(obj, key){
    var value = obj[key];

    if (typeof value !== 'undefined'){
        if (value < 0){
            obj[key+'_kb'] = '-'+bytesToClosestUnit(Math.abs(value));
        } else {
            obj[key+'_kb'] = bytesToClosestUnit(value);
        }

    }
}

function formatReport(report) {
    if (!report){
        return report;
    }

    var keys = Object.keys(report);

    report.full = [];

    var viewClasses = {
        'warn': 'warning',
        'error': 'danger'
    };

    keys.forEach(function (type) {
        var reportList = report[type];

        // add Booleans for view
        report['has'+type.substring(0, 1).toUpperCase()+type.substring(1)] = reportList && reportList.length > 0;

        reportList.forEach(function (entry) {
            entry.type = type;
            entry.typeClass = viewClasses[type] || '';

            //format kb sizes on meta data
            if (type === 'meta' && entry.data){
                formatSize(entry.data, 'increaseThreshold');
                formatSize(entry.data, 'decrease');
                formatSize(entry.data, 'restValue');
                formatSize(entry.data, 'threshold');
                if (entry.data.hasSummary){
                    entry.data.summary.forEach(function(summaryEntry){
                        formatSize(summaryEntry.data, 'size');
                        if (summaryEntry.hasRaw){
                            summaryEntry.raw.forEach(function(rawEntry){
                                formatSize(rawEntry, 'bodyLength');
                            });
                        }
                    });
                }
            }


            report.full.push(entry);
        });
    });
    report.success = report.error.length === 0;
    return report;
}

function run(_data) {
    log.info('PhantomJS running ' + _data.output.url + ' from id ' + _data.id);

    getReport(_data, function (err1, harvest, report) {
         storage.get(_data.id, function (err2, data) {
            if (err2 || !data) {
                return storage.set(_data.id, {
                    error: {
                        error: true,
                        err: err2,
                        message: 'Something went wrong. Code 001'
                    }
                });
            }

            data.state.processed = new Date();
            if (err1) {
                data.error = {
                    error: true,
                    err: err1,
                    message: 'An error occured. Code 002. '+err1.message
                };
                log.error('An error occured. Code 002 (User input / Runnner Error):', err1);
            } else {

            }
            data.harvest = harvest;
            data.report = formatReport(report);
            storage.set(data.id, data);
        });
    });
}


module.exports = {
    method: 'POST',
    path: '/validate',
    config: {
        handler: handler,
        payload: {
            maxBytes: 500000,
            parse: true,
            output: 'file',
            uploads: config.get('tmpDir')
        }
    }
};
