var fs = require('fs');
var path = require('path');
var storage = require('../storage.js');
var getTmpDir = require('../tmpDir.js');

var day7 = 1000 * 60 * 60 * 24 * 7;
var staticCacheConfig = {
    //mode: 'client',
    expiresIn: day7,
    privacy: 'public'
};

function handler(request, reply) {
    var id          = request.params.id;
    var filename    = request.params.filename;
    storage.get(id, function(err, data){
        if (data && data.harvest) {
            var imagePath = path.join(getTmpDir(id), filename);
            reply(fs.createReadStream(imagePath)).type('image/png');
        } else {
            reply('The image was not found').code(404);
        }
    });


}

module.exports = {
    method: 'GET',
    path: '/screenshots/{id}/{filename}',
    config: {
        handler: handler,
        cache: staticCacheConfig
    }
};
