
var uuid        = require('node-uuid');
var log         = require('../logger.js');
var storage     = require('../storage.js');
var getReport   = require('../report');
var config      = require('../config.js');
var unzip       = require('../unzip.js');

var request = require('request');

function generateUrl(id) {
    return [
        'http://', config.get('host'),
        '/user-input.js?id=', id,
        '&timestamp=', Date.now()
    ].join('');
}

function handler(req, res) {
    var id          = uuid.v4();
    var payload     = req.payload;
    var html        = payload.html;
    var css         = payload.css;
    var js          = payload.js;
    var zipfile     = payload.zipfile;

    var hasCodePayload = (js || html || zipfile && zipfile.size > 0);

    var data = {
        'id': id,
        'time': new Date(),
        'url': payload.url,
        'previewUrl': payload.url,
        'js': js,
        'html': html,
        'css': css,
        'zip': null,
        'target': payload.target !== 'mobile' ? 'tablet' : 'mobile',
        'advanced': payload.advanced === 'true' ? true : false
    };



    if (!!hasCodePayload){
        data.url = generateUrl(id);

        if (zipfile && zipfile.type === 'application/zip' && zipfile.size > 0) {
            unzip(zipfile, data, done);
        } else {
            done();
        }

    } else {

        if (!data.url || data.url.indexOf('http') !== 0){
            data.error = {
                error: true,
                message: 'Invalid url passed in: '+data.url
            };
            done();
        } else {

            // fetch initial request data and store as javascript or html
            request.get(data.url, function(err, response, body){

                if (err){
                    data.error = {
                        error: true,
                        err: err,
                        message: 'Url request returns error'
                    };
                    return done();
                } else if (response.statusCode !== 200){
                    data.error = {
                        error: true,
                        message: 'Url returns invalid response code: '+ response.statusCode
                    };
                    return done();
                }

                var contentType = response.headers['content-type'];
                if (contentType && contentType.indexOf('javascript') > -1){
                    data.js  = body.toString('utf8');
                    data.url = generateUrl(id);
                } else if (contentType && contentType.indexOf('html') > -1){
                    data.html = body.toString('utf8');
                    data.url  = generateUrl(id);
                } else {
                    data.error = {
                        error: true,
                        message: 'Invalid content-type header from URL. Supported types are html or javascript'
                    };
                }

                done();
            });
        }

    }


    function done(){
        data.previewUrl = data.url;
        storage.set(id, data);

        req.reply.redirect('/result?id=' + id);

        if (!data.error){
            run(data);
        }
    }
}

function formatReport(report){
    var keys = Object.keys(report);
    report.full = [];


    var viewClasses = {
        'warn': 'warning',
        'error': 'danger'
    };

    keys.forEach(function(type){
        var reportList = report[type];

        reportList.forEach(function(entry){
            entry.type = type;
            entry.typeClass = viewClasses[type];
            report.full.push(entry);
        });
    });

    report.success = report.error.length === 0;

    return report;
}

function run(input) {
    log.info('PhantomJS running '+input.url+' from id ' + input.id);
    getReport(input, function (err, harvest, report) {
        var data = storage.get(input.id);

        if (!data){
            return storage.set(input.id, {error: {error: true, message: 'Something went wrong. Errorcode 01'}});
        }

        data.processed = new Date();
        if (err) {
            data.error = {
                error: true,
                err: err,
                message: 'An error occured.'
            };
            log.error('User input / Runnner Error:', err);
        } else {
            data.harvest = harvest;
            data.report = formatReport(report);
            log.info('Runner done:' + data.id);
        }
        storage.set(data.id, data);
    });
}

var Hapi = require('hapi');
Hapi.joi.version('v2');

var validate = {
    // payload: {
    //     url: Hapi.types.String().regex(/^http/i).optional().allow(''),
    //     target: Hapi.types.String(),
    //     advanced: Hapi.types.String(),
    //     js: Hapi.types.String().optional().allow(''),
    //     css: Hapi.types.String().optional().allow(''),
    //     html: Hapi.types.String().optional().allow(''),
    //     zipfile: Hapi.types.any().optional().allow('')
    // }
};

module.exports = {
    method: 'POST',
    path: '/validate',
    config: {
        handler: handler,
        validate: validate,
        payload: {
            mode: 'parse',
            maxBytes: 500000,
            multipart: {
                maxFieldBytes: 500000,
                maxFields: 20,
                mode: 'file',
                uploadDir: config.get('tmpDir')
            }
        }
    }
};
