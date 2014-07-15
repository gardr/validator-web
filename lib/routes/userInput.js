var config = require('../config.js');
var log = require('../logger.js');
var storage = require('../storage.js');
var rewriteHtml = require('document-write-html');
var toDocumentWrite = rewriteHtml.toDocumentWrite;
var parseAndResolve = rewriteHtml.parseAndResolve;
var minifyCSS = rewriteHtml.minifyCSS;


var dataTypes = {
    'js': 'application/javascript',
    'css': 'text/css',
    'html': 'text/html'
};

function scriptLogErrorMessage(msg){
    return 'var msg = "'+msg+'";console.log(msg);document.write(msg);throw new Error(msg);';
}

function handler(request, reply) {
    var id = request.query.id;
    var dataKey = request.query.key;

    if (!id){
        return reply(scriptLogErrorMessage('Missing ID parameter.')).type(dataTypes.js);
    }

    storage.get(id, function (err, data) {

        if (err || !data){
            return  reply(scriptLogErrorMessage('ID (' + id + ') has expired.')).type(dataTypes.js);
        }

        if (dataKey && data.output[dataKey]) {
            log.info('Served raw ' + dataTypes[dataKey] + ' ok:' + id, {id: id});
            return reply(data.output[dataKey]).type(dataTypes[dataKey]);
        }

        if (dataKey && !data.output[dataKey]){
            log.warn('Tried to request non-existant datatype', {id: id});
            return reply(scriptLogErrorMessage('ID (' + id + ') has no type '+dataKey+'.')).type(dataTypes.js);
        }

        var output = data.output;
        var base = data.base;
        if (!base) {
            base = data.host + '/zip/' + id + '/';
        }

        // if only javascript, serve right ahead
        if (output.js && (!output.html || !output.css)) {
            log.info('Served raw js input', {id: id});
            return reply(output.js).type(dataTypes.js);
        }

        var resultHtmlString = '';
        if (output.html) {
            resultHtmlString += toDocumentWrite(parseAndResolve(base, output.html));
        }

        if (output.css) {
            resultHtmlString += toDocumentWrite(minifyCSS(output.css), 'style');
        }

        if (output.js) {
            var scriptUrl = data.output.url + '&key=js&';
            resultHtmlString += toDocumentWrite("<scr\'+\'ipt src=\\'" + scriptUrl + "\\'></scr\'+\'ipt>");
        }

        if (resultHtmlString === ''){
            resultHtmlString = scriptLogErrorMessage('Something went wrong. Missing actual content.');
        }

        reply(resultHtmlString).type('application/javascript');
        log.info('Served "composed" file for '+id, {id: id});

    });
}

module.exports = {
    method: 'GET',
    path: '/user-input.js',
    config: {
        handler: handler
    }
};
