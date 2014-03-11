var pack = require('../package.json');
var config      = require('./config.js');
var isDevelopment = config.get('env') !== 'production';

module.exports = function (view, request, reply) {

    view.base = '/';
    view.pack = pack;

    view.session = request.state.session;
    view.isProduction = !isDevelopment;
    view.isDevelopment = isDevelopment;
    view.minifyExtention = isDevelopment ? '' : '.min';

    if (!view.viewport || Object.keys(view.viewport).length === 0){
        view.viewport = config.get('options').viewportOptions.tablet;
    }

    var sites = config.get('sites');
    view.sites = Object.keys(sites).map(function (siteKey) {
        var site = sites[siteKey];
        site.siteName = siteKey;
        return site;
    });

    var type = request.params.type;
    var site = request.params.siteName;
    if (type !== undefined) {
        var viewports = sites[site].type['default'].viewport;
        view.viewports = Object.keys(viewports).map(function (key) {
            var viewport = viewports[key];
            viewport.viewportName = key;
            viewport.width = viewports[key].width;
            viewport.height = viewports[key].height;
            return viewport;
        });
    }

    view.type = type;
    view.site = site;

    if (isDevelopment || request.query.debug) {
        view.debugInfo = JSON.stringify(view, null, 2);
        if (request.query.debug) {
            view.debugInfo += '\n\nHeaders:\n' + JSON.stringify(request.raw.req.headers, null, 2);
        }
    }

    return view;
};
