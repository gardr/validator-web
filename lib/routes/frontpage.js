var pack = require('../../package.json');
var storage = require('../storage.js');

function mapToObject(data, id) {
    var harvest = data.harvest;
    var filename = harvest && harvest.images && ('/screenshots/' + id + '/' + harvest.images[harvest.images.length - 1].filename);
    return {
        id: id,
        filename: filename,
        hasImage: !! filename,
        success: data.report && data.report.error.length === 0 && data.report.warn.length === 0
    };
}

module.exports = {
    method: 'GET',
    path: '/',
    config: {
        handler: function (request) {
            var resultIds = storage.map(mapToObject);
        
            request.reply.view('index.html', {
                pack: pack,
                showForm: true,
                ids: resultIds,
                hasIds: resultIds && resultIds.length > 0
            });
        }
    }
};