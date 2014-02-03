var fs = require('fs');
var pathLib = require('path');
var storage = require('../storage.js');
var config  = require('../config.js');

var day7 = 1000 * 60 * 60 * 24 * 7;
var staticCacheConfig = {
    //mode: 'client',
    expiresIn: day7,
    privacy: 'public'
};

function handler(request, reply) {
    var id      = this.params.id;
    var path    = this.params.path;
    var data    = storage.get(id);

    // we only serve if we got data
    if (data) {
        var filePath = pathLib.join(config.get('tmpDir'), id, 'zip', path);

        // TODO read file metadata instead
        var type = 'application/javascript';
        if (path.indexOf('css')>-1){
            type = 'text/css';
        } else if (path.match(/\.(png|jpg|jpeg|gif)$/gi)){
            type = 'image/'+path.substring(path.lastIndexOf('.')+1);
        }

        reply(fs.createReadStream(filePath)).type(type);
    } else {
        reply('The image was not found').code(404);
    }

}

module.exports = {
    method: 'GET',
    path: '/zip/{id}/{path}',
    config: {
        handler: handler,
        cache: staticCacheConfig
    }
};
