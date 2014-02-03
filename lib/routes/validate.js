
var log         = require('../logger.js');
var storage     = require('../storage.js');
var getReport   = require('../report');
var config      = require('../config.js');
var unzip       = require('../unzip.js');
var ua          = require('../userAgent.js');
var uuid        = require('node-uuid');

var request = require('request');


function generateUrl(id) {
    return [
        'http://', config.get('host'),
        '/user-input.js?id=', id,
        '&timestamp=', Date.now()
    ].join('');
}

function handler(req, reply) {

    var session = req.state.session;
    if (!session) {
        session = { id: uuid.v4() };
    }
    session.last = Date.now();

    var id          = storage.createId(session.id);
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

    data.userAgent = ua[data.target];

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
            return done();
        } else {

            // fetch initial request data and store as javascript or html
            request.get(data.url, {'timeout': 1000, 'User-Agent': data.userAgent}, function(err, response, body){
                if (err){
                    data.error = {
                        error: true,
                        err: err,
                        message: 'Url request returns error.'
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

        reply().redirect('/result?id=' + id).state('session', session);//.redirect('/result?id=' + id);

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
            entry.typeClass = viewClasses[type]||'';
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
            //mode: 'parse',
            parse: true,
            maxBytes: 500000,
            //maxFieldBytes: 500000,
            //maxFields: 20,
            //mode: 'file',
            uploads: config.get('tmpDir')
        }
    }
};
