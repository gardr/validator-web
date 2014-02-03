 var Hapi = require('hapi');
 var hoek = require('hoek');
 var moment = require('moment');
 var storage = require('../storage.js');

 var prepare = require('../view.js');

 module.exports = {
     method: 'GET',
     path: '/result',
     config: {
         handler: function (request, reply) {
             var id = request.query.id;
             var view;
             storage.get(id, function (err, data) {

                 if (!data) {
                     view = {
                         error: true,
                         err: {
                             'message': 'ID has expired'
                         }
                     };
                 } else {
                     view = hoek.clone(data);
                 }

                 view.isMobileTarget = view.target === 'mobile';
                 view.isTabletTarget = view.target === 'tablet';

                 view.totalTestRuntime = 15000;

                 if (view.error) {
                     return reply.view('index.html', prepare(view, request, reply));
                 }

                 if (view.report) {
                     return reply.view('report.html', prepare(view, request, reply));
                 } else if (typeof view.processed === 'undefined') {
                     view.runtime = moment().diff(view.time);
                     view.reloadIn = (view.totalTestRuntime - view.runtime);
                     return reply.view('preview.html', prepare(view, request, reply));
                 }

                 reply.view('index.html', prepare(view, request, reply));
             });

         },
         validate: {
             query: {
                 id: Hapi.types.String().required(),
                 debug: Hapi.types.Boolean().optional()
             }
         }
     }
 };
