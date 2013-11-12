var tool = require('./getLatestJquery.js');

module.exports = {
    validate: function (harvested, report, next) {
        // validate jquery animate
        if (harvested.jquery && harvested.jquery.length > 0){
            harvested.jquery.forEach(function(collection){
                if (collection.length > 0){
                    var trace = collection.map(function(v){return v.trace;});
                    report.error('Found refrences of jquery animation usage, please use CSS animations instead', {'trace': trace});
                }
            });
        }

        if (harvested.jquery_version){
            var versionObj = tool.createVersionObj(harvested.jquery_version);

            // validate that jq is within latest
            tool.getLatest(function(versions){
                harvested.jquery_versions = versions;
                harvested.jquery_version_obj = versionObj;

                var isOk = versions.some(function(o){
                    return versionObj.sortKey === o.sortKey;
                });

                if (!isOk){
                    report.error('Wrong jQuery version: '+harvested.jquery_version + '. Please use version '+ versions.map(function(v){return 'v'+[v.major, v.minor,v.patch].join('.');}).join(' or '));
                } else {
                    report.info('Correct jQuery version '+harvested.jquery_version );
                }
                next();
            });
        } else {
            next();
        }

    }
};
