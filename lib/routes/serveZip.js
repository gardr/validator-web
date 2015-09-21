var fs = require('fs');
var pathLib = require('path');
var storage = require('../storage.js');
var config = require('../config.js');
var getTmpDir = require('../tmpDir.js');

var day7 = 1000 * 60 * 60 * 24 * 7;
var staticCacheConfig = {
    'expiresIn': day7,
    'privacy': 'public'
};



function getContentTypeFromExt(ext) {
    var result = 'application/javascript';

    switch(ext) {
        case 'css':
            result = 'text/css';
            break;
        case 'png':
        case 'jpg':
        case 'jpeg':
        case 'gif':
            result = 'image/' + ext;
            break;
        case 'svg':
            result = 'image/svg+xml';
            break;
        case 'otf':
            result = 'font/opentype';
            break;
        case 'woff':
        case 'woff2':
            result = 'application/font-' + ext;
            break;
        case 'ttf':
            result = 'application/octet-stream';
            break;
        case 'eot':
            result = 'application/vnd.ms-fontobject'
            break;
    }

    return result;
}


function handler(request, reply) {
    var id = request.params.id;
    var path = request.params.path||'';

    if (!id || !path){
        return reply('The resource was not found').code(404);
    }

    storage.get(id, function (err, data) {
        // we only serve if we got data
        if (data && data.id) {
            var filePath = pathLib.join(getTmpDir(id), 'zip', path);
            fs.exists(filePath, function(exists){
                if (exists){
                    var fileExt = path.substring(path.lastIndexOf('.') + 1);
                    reply(fs.createReadStream(filePath)).type(getContentTypeFromExt(fileExt));
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
