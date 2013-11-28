var log = require('../logger.js');
var CleanCSS = require('clean-css');
var storage = require('../storage.js');
var trimHtml = require('../parseHtml.js');

var cssMinifier = new CleanCSS().minify;
var dataTypes = {
    'js': 'application/javascript',
    'css': 'text/css',
    'html': 'text/html'
};

function doWrite(str) {
    return 'document.write(\'' + str + '\');';
}

function handler(request, response) {
    var id = request.query.id;
    var dataKey = request.query.key;
    var data = storage.get(id);

    if (id && data && !dataKey) {
        // if no key, append all
        var res = '';

        var trimmed;
        if (data.html) {
            trimmed = trimHtml(data.html);

            if (trimmed.style) {
                res += doWrite('<style>' + cssMinifier(trimmed.style) + '</style>');
            }

            res += doWrite(trimmed.content);
        }

        if (data.css) {
            res += doWrite('<style>' + cssMinifier(data.css) + '</style>');
        }

        if (data.js) {
            var scriptUrl = data.url + '&key=js&';
            res += doWrite("<script src=\\'" + scriptUrl + "\\'></script>");
        }

        this.reply(res).type('application/javascript');
        log.info('served composed file');
    } else if (id && data && data[dataKey]) {
        this.reply(data[dataKey]).type(dataTypes[dataKey]);
        log.info('served ' + dataTypes[dataKey] + ' ok:' + id);
    } else {
        this.reply('console.log("ID (' + id + ') has expired.");').type('application/javascript');
        log.warn('served ' + dataTypes[dataKey] + ' fail:' + id);
    }
}


module.exports = {
    method: 'GET',
    path: '/user-input.js',
    config: {
        handler: handler
    }
};