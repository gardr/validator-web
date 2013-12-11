var pack = require('../../package.json');
var storage = require('../storage.js');
var moment = require('moment');

function mapToObject(data, id) {
    var harvest = data.harvest;
    var filename = harvest && harvest.images && ('/screenshots/' + id + '/' + harvest.images[harvest.images.length - 1].filename);
    return {
        time: data.time,
        formattedTime: data.time && moment(data.time).fromNow(),
        statusText: data.error ? 'Failed' : data.report ? 'Valdiated' : 'Validation in progress',
        id: id,
        filename: filename,
        hasImage: !! filename,
        success:    data.report && data.report.error.length === 0,
        target: data.target,
        erroredOut: data.error,
        hasWarnings: data.report && data.report.warn.length > 0,
        warnings:   data.report && data.report.warn.length,
        hasErrors:  data.report && data.report.error.length > 0,
        errors:     data.report && data.report.error.length,
        hasInfo:    data.report && data.report.info.length > 0,
        infos:      data.report && data.report.info.length,
        fullSize:   data.report && data.harvest.rawFileDataSummary.total.fullSize
    };
}

module.exports = {
    method: 'GET',
    path: '/',
    config: {
        handler: function (request) {
            var resultIds = storage.map(mapToObject).sort(function(a, b){ return (a.time > b.time ? -1 : 1);});

            var view = {
                pack: pack,
                base: '/',
                showForm: true,
                ids: resultIds,
                hasIds: resultIds && resultIds.length > 0
            };

            view.debugInfo = JSON.stringify(view, null, 2);

            request.reply.view('index.html', view);
        }
    }
};
