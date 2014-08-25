var pack = require('../package.json');
var config      = require('./config.js');
var isDevelopment = config.get('env') !== 'production';

var newFormatUrl = require('./newFormatUrl.js');

module.exports = function (view, request, reply) {

    view.base = '/';
    view.pack = pack;

    view.session = request.state.session;
    view.isProduction = !isDevelopment;
    view.isDevelopment = isDevelopment;
    view.minifyExtention = isDevelopment ? '' : '.min';
    view.iframeUrl = config.get('runner').iframeUrl||'./preview/built/iframe.html';

    view.newFormatUrl = newFormatUrl;

    if (isDevelopment || request.query.debug) {
        view.debugInfo = JSON.stringify(view, null, 2);
        if (request.query.debug) {
            view.debugInfo += '\n\nHeaders:\n' + JSON.stringify(request.raw.req.headers, null, 2);
        }
    }

    return view;
};
