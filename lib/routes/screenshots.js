var fs = require('fs');
var path = require('path');
var storage = require('../storage.js');

var day7 = 1000 * 60 * 60 * 24 * 7;
var staticCacheConfig = {
    mode: 'client',
    expiresIn: day7,
    privacy: 'public'
};

function handler(request, response) {
    var id          = this.params.id;
    var filename    = this.params.filename;
    var data        = storage.get(id);
    if (data && data.harvest) {
        var imagePath = path.join(data.harvest.imageOutputDir, filename);
        this.reply(fs.createReadStream(imagePath)).type('image/png');
    } else {
        this.reply('The image was not found').code(404);
    }

}

module.exports = {
    method: 'GET',
    path: '/screenshots/{id}/{filename}',
    config: {
        handler: handler,
        cache: staticCacheConfig
    }
};
