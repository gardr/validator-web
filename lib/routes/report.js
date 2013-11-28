var Hapi = require('hapi');
Hapi.joi.version('v2');

module.exports = {
    method: 'GET',
    path: '/report',
    config: {
        'handler': function (request, response) {
            run(request.query.url, id, function (err, harvest, report) {
                if (err) {
                    return this.reply({
                        error: true,
                        err: err,
                        ref: '0'
                    });
                }
                this.reply({
                    harvest: harvest,
                    report: report
                });
            }.bind(this));
        },
        'validate': {
            query: {
                url: Hapi.types.String().required() //.regex(/^http/i)
            }
        }
    }
};