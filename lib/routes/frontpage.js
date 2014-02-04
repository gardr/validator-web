var storage = require('../storage.js');
var moment = require('moment');
var prepare = require('../view.js');

var REG_EXP_UUID = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}-/;

function mapToObject(sessionId) {
    return function (_data) {
        var data = _data.value;
        var id = data.id;
        var harvest = data.harvest;
        var report = data.report;
        var filename;
        if (harvest && harvest.screenshots && harvest.screenshots.images && harvest.screenshots.images.length > 0) {
            filename = '/screenshots/' + id + '/' + harvest.screenshots.images[harvest.screenshots.images.length - 1].filename;
        }

        return {
            id: id,
            formattedTitle: id && id.replace(REG_EXP_UUID, ''),
            time: data.time,
            formattedTime: data.time && moment(data.time).fromNow(),
            statusText: data.error ? 'Failed' : report ? 'Valdiated' : 'Validation in progress',
            filename: filename,
            hasImage: !! filename,
            success: report && report.error.length === 0,
            target: data.target,
            erroredOut: data.error,
            hasWarnings: report && report.warn.length > 0,
            warnings: report && report.warn.length,
            hasErrors: report && report.error.length > 0,
            errors: report && report.error.length,
            hasInfo: report && report.info.length > 0,
            infos: report && report.info.length,
            fullSize: report && harvest.har.rawFileDataSummary && harvest.har.rawFileDataSummary.total.fullSize
        };
    };
}


function sortByTimeKey(a, b) {
    return (a.time > b.time ? -1 : 1);
}

module.exports = {
    method: 'GET',
    path: '/',
    config: {
        handler: function (request, reply) {

            if (!(request.state.session && request.state.session.id)) {

            }
            var sessionId = request.state.session.id;
            storage.startsWith(sessionId, function (err, list) {
                var resultIds = list.map(mapToObject(sessionId)).sort(sortByTimeKey);
                var view = {
                    ids: resultIds,
                    hasIds: resultIds && resultIds.length > 0
                };

                reply.view('index.html', prepare(view, request, reply));
            });

        }
    }
};
