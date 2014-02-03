var tool = require('../lib/getLatestJquery.js');

function getLastest(harvested, output, next) {
    var collected = harvested.jquery.version;
    output('versionObj', tool.createVersionObj(collected));

    tool.getLatest(function (versions) {
        output('versions', versions);
        next();
    });
}

module.exports = {
    dependencies: ['jquery'],
    preprocess: function (harvested, output, next, options) {
        if (harvested.jquery.version) {
            getLastest(harvested, output, next, options);
        } else {
            next();
        }
    }
};

