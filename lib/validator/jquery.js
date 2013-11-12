var tool = require('./getLatestJquery.js');

function getLastest(harvested, report, next) {
    harvested.jquery_version_obj = tool.createVersionObj(harvested.jquery_version);

    tool.getLatest(function (versions) {
        harvested.jquery_versions = versions;
        validateLatest(harvested, report, next);
    });
}

function validateLatest(harvested, report, next) {
    var key = harvested.jquery_version_obj.sortKey;
    var isOk = harvested.jquery_versions.some(function (o) {
        return  key === o.sortKey;
    });

    if (!isOk) {
        var suggestion = harvested.jquery_versions.map(function (v) {
            return 'v' + [v.major, v.minor, v.patch].join('.');
        }).join(' or ');
        report.error('Wrong jQuery version: ' + harvested.jquery_version + '. Please use version ' + suggestion);
    } else {
        report.info('Correct jQuery version ' + harvested.jquery_version);
    }
    next();
}

module.exports = {
    validate: function (harvested, report, next) {
        // validate jquery animate
        if (harvested.jquery_animate && harvested.jquery_animate.length > 0) {
            harvested.jquery_animate.forEach(function (collection) {
                if (collection.length > 0) {
                    var trace = collection.map(function (v) {
                        return v.trace;
                    });
                    report.error('Usage of jquery animate detected, please use CSS animations instead', {
                        'trace': trace
                    });
                }
            });
        }
        if (harvested.jquery_version) {
            getLastest(harvested, report, next);
        } else {
            next();
        }

    },
    validateLatest: validateLatest
};
