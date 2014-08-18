var fs = require('fs');
var pathLib = require('path');
var storage = require('../storage.js');
var config = require('../config.js');

var day7 = 1000 * 60 * 60 * 24 * 7;
var staticCacheConfig = {
    'expiresIn': day7,
    'privacy': 'public'
};

var getTmpDir = require('../tmpDir.js');

function handler(request, reply) {
    var id = request.params.id;
    var path = request.params.path;
    storage.get(id, function (err, data) {
        // we only serve if we got data
        if (data && data.id) {
            var filePath = pathLib.join(getTmpDir(id), 'zip', path);
            // TODO read file metadata instead
            var type = 'application/javascript';
            if (path.indexOf('css') > -1) {
                type = 'text/css';
            } else if (path.match(/\.(png|jpg|jpeg|gif)$/gi)) {
                type = 'image/' + path.substring(path.lastIndexOf('.') + 1);
            }

            fs.exists(filePath, function(exists){
                if (exists){
                    reply(fs.createReadStream(filePath)).type(type);
                } else {
                    reply('The file/image was not found').code(404);
                }
            });
        } else {
            reply('The image was not found').code(404);
        }
    });
}

module.exports = {
    method: 'GET',
    path: '/zip/{id}/{path*}',
    config: {
        handler: handler,
        cache: staticCacheConfig
    }
};
