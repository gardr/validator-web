var config = require('../config.js');
var log = require('../logger.js');
var CleanCSS = require('clean-css');
var storage = require('../storage.js');
var rewriteHtml = require('../html.js');

function cssMinifier(str) {
    var instance = new CleanCSS();
    return instance.minify(str).replace(/'|"/gm, '\"');
}

var dataTypes = {
    'js': 'application/javascript',
    'css': 'text/css',
    'html': 'text/html'
};

function doWrite(str) {
    return 'document.write(\'' + str + '\');';
}

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
            log.info('Served raw ' + dataTypes[dataKey] + ' ok:' + id);
            return reply(data.output[dataKey]).type(dataTypes[dataKey]);
        }

        if (dataKey && !data.output[dataKey]){
            return reply(scriptLogErrorMessage('ID (' + id + ') has no type '+dataKey+'.')).type(dataTypes.js);
        }

        var output = data.output;
        var base = data.base;
        if (!base) {
            base = 'http://' + config.get('host') + '/zip/' + id + '/';
        }

        // if only javascript, serve right ahead
        if (output.js && (!output.html || !output.css)) {
            return reply(output.js).type(dataTypes.js);
        }


        var resultHtmlString = '';

        if (output.html) {
            var trimmed = rewriteHtml.fix(base, output.html);
            if (trimmed.style) {
                resultHtmlString += doWrite('<style>' + cssMinifier(trimmed.style) + '</style>');
            }
            resultHtmlString += doWrite(trimmed.content);
        }

        if (output.css) {
            resultHtmlString += doWrite('<style>' + cssMinifier(output.css) + '</style>');
        }

        if (output.js) {
            var scriptUrl = data.output.url + '&key=js&';
            resultHtmlString += doWrite("<script src=\\'" + scriptUrl + "\\'></script>");
        }

        if (resultHtmlString === ''){
            resultHtmlString = scriptLogErrorMessage('Something went wrong. Missing actual content.');
        }

        reply(resultHtmlString).type('application/javascript');
        log.info('Served composed file');

    });
}

module.exports = {
    method: 'GET',
    path: '/user-input.js',
    config: {
        handler: handler
    }
};
