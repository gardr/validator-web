
var uuid        = require('node-uuid');
var log         = require('../logger.js');
var storage     = require('../storage.js');
var getReport   = require('../report');
var config      = require('../config.js');
var unzip       = require('../unzip.js');



function handler(request, response) {
    var id          = uuid.v4();
    var payload     = request.payload;
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
        data.url = [
            'http://', config.get('host'),
            '/user-input.js?id=', id,
            '&timestamp=', Date.now()
        ].join('');
    }

    if (zipfile && zipfile.type === 'application/zip' && zipfile.size > 0) {
        unzip(zipfile, data, done);
    } else {
        done();
    }

    function done(){
        data.previewUrl = data.url;
        storage.set(id, data);

        request.reply.redirect('/result?id=' + id);

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
