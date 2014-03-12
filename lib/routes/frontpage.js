var storage = require('../storage.js');
var moment = require('moment');
var prepare = require('../view.js');
var config = require('../config.js');

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
            time: data.state.started,
            formattedTime: data.state.started && moment(data.state.started).fromNow(),
            statusText: data.error ? 'Failed' : report ? 'Validated' : 'Validation in progress',
            filename: filename,
            hasImage: !! filename,
            success: report && report.error.length === 0,
            target: data.options.target,
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

var sites = config.get('sites');

function handler(request, reply) {
    var requestData = {
        site: request.params.siteName,
        setup: request.params.setup,
        id: request.params.id
    };
    var site;
    var setup;
    var viewport;

    // Get site specific data
    if (requestData.site) {
        for (var i in sites) {
            if (sites[i].name === requestData.site) {
                site = sites[i];

                if (requestData.setup) {
                    for (var j in site.setup) {
                        if (site.setup[j].name === requestData.setup) {
                            setup = site.setup[j];
                            setup.viewports = site.setup[0].viewport;
                        }
                    }
                }
            }
        }
    }

    // Check if valid site data
    if (sites && site && setup && !requestData.id) {
        return reply.view('viewportselector.html', prepare({
            viewports: setup.viewports,
            site: site.name,
            setup: setup.name
        }, request, reply));
    }

    // Forward to default setup if not done manually
    if (requestData.site && !requestData.setup) {
        reply().redirect('/sites/' + requestData.site + '/default/');
    }

    // No arguments sent in, set up root view
    if (!requestData.site) {
        return reply.view('siteselector.html', prepare({"sites": sites}, request, reply));
    }

     // Check if valid viewport
    if (requestData.id && setup) {
        if (setup.viewport[requestData.id]) {
            viewport = setup.viewport[requestData.id];
        }
    }

    // Check for all data, show validator
    if (sites && site && setup && viewport) {

        if (!(request.state.session && request.state.session.id)) {
           return reply.view('index.html', prepare({}, request, reply));
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
    } else {
        return reply({
            statusCode: 404,
            error: "Not Found"
        }).code(404);
    }

}

module.exports = [
{
    method: 'GET',
    path: '/',
    config: {
        handler: handler
    }
},
{
    method: 'GET',
    path: '/sites/{siteName}/',
    config: {
        handler: handler
    }
},
{
    method: 'GET',
    path: '/sites/{siteName}/{setup}/',
    config: {
        handler: handler
    }
},
{
    method: 'GET',
    path: '/sites/{siteName}/{setup}/{id}/',
    config: {
        handler: handler
    }
}
];
