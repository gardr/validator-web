var uuid = require('node-uuid');
var log = require('../logger.js');
var storage = require('../storage.js');
var getReport = require('../report/getReport.js');

function handler(request, response) {
    var id = uuid.v4();
    var url = request.payload.url;
    var html = request.payload.html;
    var css = request.payload.css;
    var js = request.payload.js;

    var hasCodePayload = (js || html);

    var data = {
        id: id,
        time: new Date(),
        url: url,
        js: js,
        html: html,
        css: css
    };

    if (hasCodePayload) {
        var forwared = this.raw.req.headers['X-Forwarded-Host'];
        var host = forwared || request.info.host;
        data.url = 'http://' + host + '/user-input.js?id=' + id + '&timestamp=' + Date.now();
    }
    data.previewUrl = data.url;
    storage.set(id, data);

    this.reply.redirect('/result?id=' + id);

    run(url, id);
}

function run(url, id) {
    log.info('PhantomJS running '+url+' from id ' + id);
    getReport(url, id, function (err, harvest, report) {
        var data = storage.get(id);
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
            data.report = report;
            log.info('Runner done:' + id);
        }
        storage.set(id, data);
    });
}

var Hapi = require('Hapi');
Hapi.joi.version('v2');

var validate = {
    // payload: {
    //     url: Hapi.types.String().regex(/^http/i).allow(''),
    //     js: Hapi.types.String().optional().allow(''),
    //     css: Hapi.types.String().optional().allow(''),
    //     html: Hapi.types.String().optional().allow('')
    // }
};

module.exports = {
    method: 'POST',
    path: '/validate',
    config: {
        handler: handler,
        validate: validate
    }
};
