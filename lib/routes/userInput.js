var config = require('../config.js');
var log = require('../logger.js');
var CleanCSS = require('clean-css');
var storage = require('../storage.js');
var rewriteHtml = require('../rewriteHtml.js');

var cssMinifier = new CleanCSS().minify;
var dataTypes = {
    'js': 'application/javascript',
    'css': 'text/css',
    'html': 'text/html'
};

function doWrite(str) {
    return 'document.write(\'' + str + '\');';
}

var REG_EXP_ABS_URL = /^(\/\/|http)/i;
function fixHtml(data) {
    if (!data.trimmed){
        data.trimmed = rewriteHtml(data.html, function (url) {
            if (REG_EXP_ABS_URL.test(url) !== true) {
                url = data.base + url;
            }
            // resolve protocol relative
            if (url.indexOf('//') === 0) {
                url = 'http:' + url;
            }
            return url;
        });
    }
    return data.trimmed;
}

function handler(request, response) {
    var id = request.query.id;
    var dataKey = request.query.key;
    var data = storage.get(id);

    //console.log('Serve', id, request.headers['accept-encoding'], request.headers['user-agent'], request.info.referrer);

    if (!data.base){
        data.base = 'http://' + config.get('host') + '/zip/' + id + '/';
    }

    if (id && data && !dataKey) {
        // if no key, append all
        var res = '';

        if (data.html) {
            data.trimmed = fixHtml(data); // fixes input html or zip input index.html

            if (data.trimmed.style) {
                res += doWrite('<style>' + cssMinifier(data.trimmed.style) + '</style>');
            }

            res += doWrite(data.trimmed.content);
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
