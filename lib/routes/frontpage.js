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
    var site = request.params.siteName,
        type = request.params.type,
        id = request.params.id;

    // if (sites &&
    //     sites[site] &&
    //     sites[site].type[type] &&
    //     sites[site].type[type].viewport[id]){

    //     reply().redirect('/sites/' + site + '/' + type + '/' + id + '/');
    // }

    if (sites &&
        sites[site] &&
        sites[site].type[type] &&
        !id){

        return reply.view('viewportselector.html', prepare({}, request, reply));
    }

    if (site &&
        sites[site] &&
        !type) {
        reply().redirect('/sites/' + site + '/default/');
    }

    // if (sites && Object.keys(sites).length === 1){
    //     console.log('2');
    //     reply().redirect('/sites/' + Object.keys(sites)[0] + '/');
    // }

    if (!site) {
        return reply.view('siteselector.html', prepare({}, request, reply));
    }


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
    path: '/sites/',
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
    path: '/sites/{siteName}/{type}/',
    config: {
        handler: handler
    }
},
{
    method: 'GET',
    path: '/sites/{siteName}/{type}/{id}/',
    config: {
        handler: handler
    }
}
];
