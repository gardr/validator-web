 var Hapi = require('hapi');
 var hoek = require('hoek');
 var moment = require('moment');
 var storage = require('../storage.js');

 var prepare = require('../view.js');

 function handler(request, reply) {
     var id = request.query.id;

     storage.get(id, function (err, data) {
         var view;
         if (!data) {
            view = {
                error: true,
                err: {
                    'message': 'ID has expired'
                }
            };
         } else {
            view = hoek.clone(data);
            view.totalTestRuntime = 17000;
         }

         if (view.error) {
             return reply.view('index.html', prepare(view, request, reply));
         }

         if (view.report !== null) {
            if (view.state.started){
                view.formattedStarted = moment(view.state.started).format('MMMM Do YYYY, h:mm:ss a');
            }
            if (view.state.processed){
                view.formattedProcessed = moment(view.state.processed).fromNow();
                view.totalRuntime =  moment(view.state.processed).diff(view.state.started, 'seconds') + ' seconds';
            }
            return reply.view('report.html', prepare(view, request, reply));
         }
         if (view.state.processed === null) {
             view.runtime = moment().diff(view.state.started);
             view.reloadIn = (view.totalTestRuntime - view.runtime);
             return reply.view('preview.html', prepare(view, request, reply));
         }
         reply.view('index.html', prepare(view, request, reply));
     });

 }

 module.exports = {
     method: 'GET',
     path: '/result',
     config: {
         handler: handler,
         validate: {
             query: {
                 id: Hapi.types.String().required(),
                 debug: Hapi.types.Boolean().optional()
             }
         }
     }
 };
