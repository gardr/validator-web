var Hoek = require('hoek');
var moment = require('moment');
var storage = require('../storage.js');
var prepare = require('../view.js');
var config = require('../config.js');

var formats = config.get('formats');
var internals = {};

var REG_EXP_UUID = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}-/;
internals.formatRecentEntriesFromSessionId = function (sessionId) {
    return function (_data) {
        var data = _data.value;
        var id = data.id;
        var harvest = data.harvest;
        var report = data.report;
        var filename;
        if (harvest && harvest.screenshots && harvest.screenshots.images && harvest.screenshots.images.length > 0) {
            filename = '/screenshots/' + id + '/' + harvest.screenshots.images[harvest.screenshots.images.length - 1].filename;
        }

        //console.log(data.options);

        return {
            'id': id,
            'formattedTitle': id && id.replace(REG_EXP_UUID, ''),
            'time': data.state.started,
            'formatId': data.format && data.format.id,
            'formatData': internals.createFormatter(data.runnerConfig, {'formatId': data.format.id, 'formatSubId': data.format.subId})({
                'width': data.runnerConfig.width,
                'height': data.runnerConfig.height
            }, data.format.index),
            'formattedTime': data.state.started && moment(data.state.started).fromNow(),
            'statusText': data.error ? 'Failed' : report ? 'Validated' : 'Validation in progress',
            'filename': filename,
            'hasImage': !! filename,
            'success': report && report.error.length === 0,
            'target': data.format.id,
            'erroredOut': data.error,
            'hasWarnings': report && report.warn.length > 0,
            'warnings': report && report.warn.length,
            'hasErrors': report && report.error.length > 0,
            'errors': report && report.error.length,
            'hasInfo': report && report.info.length > 0,
            'infos': report && report.info.length,
            'fullSize': report && harvest.har && harvest.har.rawFileDataSummary && harvest.har.rawFileDataSummary.total.fullSize
        };
    };
};

internals.sortByTimeKey = function (a, b) {
    return (a.time > b.time ? -2 : 1);
};

internals.isNonSubFormat = function (params, current) {
    return (
        params.formatSubId !== 'default' && current &&
        (!current.subFormats ||
            (current.subFormats && (!(params.formatSubId in current.subFormats)))
        )
    );
};

internals.numToPx = function (v) {
    return v === 'string' ? v : v + 'px';
};

internals.createFormatter = function (current, params) {
    return function (format, index) {
        var width1 = format.width.min ? format.width.min : format.width;
        var height1 = format.height.min ? format.height.min : format.height;
        var title1 = width1 + ' x ' + height1;
        var width2 = format.width.max ? format.width.max : format.width;
        var height2 = format.height.max ? format.height.max : format.height;
        var title2 = width2 + ' x ' + height2;

        var isMultipleFormat = false;
        var t = [];

        t.push(width1);
        t.push('x');
        t.push(height1);

        if (format.width.max && format.width.max !== format.width.min || format.height.max && format.height.max !== format.height.min) {
            isMultipleFormat = true;
            t.push(' and values up to ');
            t.push(width2);
            t.push('x');
            t.push(height2);
        }

        var viewport = format.viewport || current.viewport;
        if (viewport && (viewport.width !== width2 && viewport.height !== height2)) {
            t.push('(Viewport: ' + viewport.width);
            t.push('x');
            t.push(viewport.height + ')');
        }

        var containerWidth = viewport ? viewport.width : width2;
        var containerHeight = viewport ? viewport.height : height2;

        return {
            'isMultipleFormat': isMultipleFormat,
            'format': format,
            'width': internals.numToPx(containerWidth),
            'height': internals.numToPx(containerHeight),
            'title1': title1,
            'width1': internals.numToPx(width1),
            'height1': internals.numToPx(height1),
            'title2': title2,
            'width2': internals.numToPx(width2),
            'height2': internals.numToPx(height2),
            'link': '/formats/' + params.formatId + '/' + params.formatSubId + '/' + index + '/',
            'title': t.join(' '),
            'description': format.description
        };
    };
};

internals.splash = function(request, reply){

    if (config.get('env') === 'production'){
        if (request.info.host.indexOf('www.gardr.org') !== 0){
            return reply().redirect('http://www.gardr.org/splash');
        }
    }

    return reply.view('splash.html', prepare({}, request, reply), {layout: false});
};



internals.requestHandler = function (request, reply) {


    if (config.get('env') === 'production'){

        // gardr.org goes to splash
        if (request.path === '/' &&
            (request.info.host.indexOf('www.gardr.org') === 0||request.info.host.indexOf('gardr.org') === 0)
            ){
            return reply().redirect('http://www.gardr.org/splash');
        }

        // validator enforces subdomain
        if (request.info.host.indexOf('validator.gardr.org') !== 0){
            return reply().redirect('http://validator.gardr.org');
        }
    }



    var params = request.params;

    var current;

    // Get site specific data
    formats.some(function (format) {
        if (params.formatId == format.name) {
            current = Hoek.clone(format);
            return true;
        }
    });

    // Check if valid site data
    if (formats && params.formatId && params.formatSubId && !params.formatIndex) {
        // if only one format, redirect
        if (current && current.formats && current.formats.length === 1) {
            return reply().redirect('/formats/' + params.formatId + '/' + params.formatSubId + '/0/');
        }

        return reply.view('formatselector.html', prepare({
            'formats': current.formats.map(internals.createFormatter(current, params)),
            'formatId': params.formatId,
            'formatSubId': params.formatSubId
        }, request, reply));
    }

    // Forward to default setup if not done manually

    if (params.formatId && !params.formatSubId || internals.isNonSubFormat(params, current)) {
        return reply().redirect('/formats/' + params.formatId + '/default/');
    }

    // No arguments sent in, set up root view
    if (!params.formatId) {
        return reply.view('siteselector.html', prepare({
            "formats": formats
        }, request, reply));
    }

    // Check for all data, show validator
    if (params.formatId && params.formatSubId && params.formatIndex) {

        if (!(request.state.session && request.state.session.id)) {
            return reply.view('index.html', prepare({
                'formatId': params.formatId,
                'formatSubId': params.formatSubId,
                'formatIndex': params.formatIndex
            }, request, reply));
        }

        var sessionId = request.state.session.id;
        storage.startsWith(sessionId, function (err, list) {
            var mapper = internals.formatRecentEntriesFromSessionId(sessionId);
            var resultIds = list.map(mapper).sort(internals.sortByTimeKey);
            var view = {
                'formatId': params.formatId,
                'formatSubId': params.formatSubId,
                'formatIndex': params.formatIndex,
                'ids': resultIds,
                'hasIds': resultIds && resultIds.length > 0
            };
            reply.view('index.html', prepare(view, request, reply));
        });
    } else {
        return reply({
            statusCode: 404,
            error: "Not Found"
        }).code(404);
    }
};

module.exports = [
    {
        method: 'GET',
        path: '/',
        config: {
            handler: internals.requestHandler
        }
    },
    {
        method: 'GET',
        path: '/splash',
        config: {
            handler: internals.splash
        }
    },
    {
        method: 'GET',
        path: '/formats/{formatId}/',
        config: {
            handler: internals.requestHandler
        }
    },
    {
        method: 'GET',
        path: '/formats/{formatId}/{formatSubId}/',
        config: {
            handler: internals.requestHandler
        }
    },
    {
        method: 'GET',
        path: '/formats/{formatId}/{formatSubId}/{formatIndex}/',
        config: {
            handler: internals.requestHandler
        }
    }
];
