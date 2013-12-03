var pack = require('../../package.json');
var development = process.env.NODE_ENV !== 'production';
var Hapi = require('hapi');
Hapi.joi.version('v2');
var hoek = require('hoek');
var moment = require('moment');
var storage = require('../storage.js');

function getNoIDView() {
    return {
        processed: false,
        error: true,
        err: {
            message: 'ID has expired'
        },
        showForm: true,
        showStatus: false,
        isMobileTarget: true,
        isTabletTarget: false
    };
}


module.exports = {
    method: 'GET',
    path: '/result',
    config: {
        handler: function (request, response) {
            var id = request.query.id;
            var view;
            var data = storage.get(id);

            if (!data) {
                view = getNoIDView();
            } else {
                view = hoek.clone(data);
            }

            view.isMobileTarget = view.target === 'mobile';
            view.isTabletTarget = view.target === 'tablet';

            view.pack = pack;
            view.showForm = true;

            if (view.js && view.url) {
                view.hideUrlInput = true;
            }

            view.totalTestRuntime = 15000;

            if (view.report) {
                view.showStatus = false;
                view.showResultTable = (view.report.error.length > 0 || view.report.warn.length > 0 || view.report.info.length > 0);
            } else if (typeof view.processed === 'undefined') {
                view.showStatus = true;
                view.runtime = moment().diff(view.time);
                view.reloadIn = (view.totalTestRuntime - view.runtime);
            }

            if (view.showForm) {
                if (view.html || view.js) {

                } else {
                    view.hideCodeInput = true;
                }
            }

            if (development || request.query.debug) {
                view.debugInfo = JSON.stringify(view, null, 2);
                if (request.query.debug) {
                    view.debugInfo += '\n\nHeaders:\n' + JSON.stringify(this.raw.req.headers, null, 2);
                }
            }

            this.reply.view('index.html', view);
        },
        validate: {
            query: {
                id: Hapi.types.String().required().regex(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i),
                debug: Hapi.types.Boolean().optional()
            }
        }
    }
};
