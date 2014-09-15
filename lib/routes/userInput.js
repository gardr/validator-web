var config = require('../config.js');
var log = require('../logger.js');
var storage = require('../storage.js');
var rewriteHtml = require('document-write-html');
var toDocumentWrite = rewriteHtml.toDocumentWrite;
var parseAndResolve = rewriteHtml.parseAndResolve;
var minifyCSS = rewriteHtml.minifyCSS;

var DATA_TYPES = {
    'js': 'application/javascript',
    'css': 'text/css',
    'html': 'text/html'
};

function scriptLogErrorMessage(msg) {
    return 'var msg = "' + msg + '";console.log(msg);document.write(msg);throw new Error(msg);';
}

function getData(data, dataKey, id) {

    var result = {
        str: '',
        type: DATA_TYPES.js
    };

    if (dataKey && data.output[dataKey]) {
        result.str = data.output[dataKey];
        result.type = DATA_TYPES[dataKey];
        return result;
    }

    if (dataKey && !data.output[dataKey]) {
        log.warn('Tried to request non-existant datatype', {
            id: id
        });
        result.str = scriptLogErrorMessage('ID (' + id + ') has no type ' + dataKey + '.');
        result.type = DATA_TYPES.js;
        return result;
    }

    var output = data.output;

    // if only javascript, serve right ahead
    if (output.js && (!output.html && !output.css)) {
        result.str = ';' + output.js + ';';
        return result;
    }

    if (output.css) {
        result.str += toDocumentWrite(minifyCSS(output.css), 'style') + '\n';
    }

    if (output.html) {
        result.str += toDocumentWrite(parseAndResolve(data.base, output.html)) + '\n';
    }

    if (output.js) {
        var scriptUrl = data.output.url + '&key=js&';
        result.str += toDocumentWrite("<scr__MANGLE_SCRIPT_TAG__ipt src=\\'" + scriptUrl + "\\'></scr__MANGLE_SCRIPT_TAG__ipt>") + '\n';
    }

    if (result.str === '') {
        result.str = scriptLogErrorMessage('Something went wrong. Missing actual content.');
    }

    return result;
}

function handler(request, reply) {
    var id = request.query.id;
    var dataKey = request.query.key;

    if (!id) {
        return reply(scriptLogErrorMessage('Missing ID parameter.')).type(DATA_TYPES.js);
    }

    storage.get(id, function (err, data) {

        if (err || !data) {
            return reply(scriptLogErrorMessage('ID (' + id + ') has expired.')).type(DATA_TYPES.js);
        }

        var result;
        var str;
        var type;
        try {
            result = getData(data, dataKey, id);
            str = result.str;
            type = result.type;
            log.info('Served "composed" file for (' + id + ') with type: ' + result.type, {
                id: id
            });
        } catch (e) {
            log.error('Something went wrong serving user input', {
                debug: {
                    message: e.message,
                    stack: e.stack
                }
            });
            str = scriptLogErrorMessage('ID (' + id + ') failed with message:' + e.message);
            type = DATA_TYPES.js;
        }

        reply(str).type(type);

        // throw new Error('asd');
    });
}

module.exports = {
    method: 'GET',
    path: '/user-input.js',
    config: {
        handler: handler
    }
};
