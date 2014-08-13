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

function scriptLogErrorMessage(msg){
    return 'var msg = "'+msg+'";console.log(msg);document.write(msg);throw new Error(msg);';
}

function handler(request, reply) {
    var id = request.query.id;
    var dataKey = request.query.key;

    if (!id){
        return reply(scriptLogErrorMessage('Missing ID parameter.')).type(DATA_TYPES.js);
    }

    function getData(data){

        var result = {
            str: str,
            type: DATA_TYPES.js
        };

        if (dataKey && data.output[dataKey]) {
            log.info('Served raw ' + DATA_TYPES[dataKey] + ' ok:' + id, {id: id});
            return reply(data.output[dataKey]).type(DATA_TYPES[dataKey]);
        }

        if (dataKey && !data.output[dataKey]){
            log.warn('Tried to request non-existant datatype', {id: id});
            return reply(scriptLogErrorMessage('ID (' + id + ') has no type '+dataKey+'.')).type(DATA_TYPES.js);
        }

        var output = data.output;
        var base = data.base;
        if (!base) {
            base = data.host + '/zip/' + id + '/';
        }

        // if only javascript, serve right ahead
        if (output.js && (!output.html || !output.css)) {
            log.info('Served raw js input', {id: id});
            return reply(output.js).type(DATA_TYPES.js);
        }

        if (output.html) {
            result.str += toDocumentWrite(parseAndResolve(base, output.html));
        }

        if (output.css) {
            result.str += toDocumentWrite(minifyCSS(output.css), 'style');
        }

        if (output.js) {
            var scriptUrl = data.output.url + '&key=js&';
            result.str += toDocumentWrite("<scr\'+\'ipt src=\\'" + scriptUrl + "\\'></scr\'+\'ipt>");
        }

        if (result.str === ''){
            result.str = scriptLogErrorMessage('Something went wrong. Missing actual content.');
        }

        return output;
    }


    storage.get(id, function (err, data) {

        if (err || !data){
            return  reply(scriptLogErrorMessage('ID (' + id + ') has expired.')).type(DATA_TYPES.js);
        }


        var result;
        var str;
        var type;
        try{
            result = getData(data);
            str = result.str;
            type = result.type;
            log.info('Served "composed" file for '+id, {id: id});
        } catch(e){
            log.error('Something went wrong serving user input', {debug: {message: e.message, stack: e.stack}});
            str = scriptLogErrorMessage('ID (' + id + ') failed with message:'+e.message);
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
