
function validateLatest(harvested, report, next) {
    var jq = harvested.jquery;
    var key = jq.versionObj.sortKey;
    var isOk = jq.versions.some(function (o) {
        return  key === o.sortKey;
    });

    if (!isOk) {
        var suggestion = jq.versions.map(function (v) {
            return 'v' + [v.major, v.minor, v.patch].join('.');
        }).join(' or ');
        report.error('Wrong jQuery version: ' + jq.version + '. Please use version ' + suggestion);
    } else {
        report.info('Correct jQuery version ' + jq.version);
    }
    next();
}


module.exports = {
    dependencies: ['jquery'],
    validateLatest: validateLatest,
    validate: function (harvested, report, next, options) {
        // validate jquery animate
        var data = harvested.jquery;
        if (data && data.animate && data.animate.length > 0) {
            data.animate.forEach(function (collection) {
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

        if (data && data.versions){
            validateLatest(harvested, report, next);
        } else {
            next();
        }


    }
};
