var pathLib = require('path');

function getTraceOfTypes(obj) {
    return {
        trace: Object.keys(obj).map(function (str) {
            return {
                'sourceURL': str
            };
        })
    };
}

function validEntries(data, entry){
    var _data = data[entry.select];
    return _data && _data.total && _data.total.requests > 0;
}

var RE_LAST_URL_SECTION = /([^\/]+)\/?$/i;
var RE_QUERY = /\?.*$/;
function getName(str){
    var output;
    if (typeof str !== 'string'){
        return str;
    }
    str = str.trim().replace(/\?.*$/, '');

    output = pathLib.basename(str);

    if (!output){
        var m = str.match(RE_LAST_URL_SECTION);
        if (m && m[1]){
            output = m[1];
        }
    }

    if (!output){
        output = pathLib.dirname(str);
    }

    return !output ? str : output;
}

function formatRaw(o){
    if (!o){return;}
    var ignoreKeys = ['base64Content'];
    return Object.keys(o).map(function(key){
        var raw = o[key];
        var output = {};
        Object.keys(raw).filter(function(key){
            if (ignoreKeys.indexOf(key) === -1){
                output[key] = raw[key];
            }
        });
        var title = getName(output.url);
        output.title = title && title.substring(0, 30);
        return output;
    });
}

function outputEntries(data, entry){
    var _data = data.summary[entry.select];
    var raw =  formatRaw(data.types[entry.select]);
    return {
        title: _data.total.requests + ' ' + entry.name[0] + (_data.total.requests > 1 ? entry.name[1] : ''),
        data: _data.total,
        raw: raw,
        hasRaw: raw && raw.length > 0
    };
}

function outputSummary(summary, report, thresholdBytes, sizeThresholdBytes, options) {

    var totalSummaryView;
    var cursor;
    if (summary.typed && summary.typed.summary)  {
        totalSummaryView = [
            {
                'name': ['Script','s'],
                'select': 'script'
            },
            {
                'name': ['CSS',' files'],
                'select': 'style'
            },
            {
                'name': ['Image','s'],
                'select': 'image'
            },
            {
                'name': ['Other / Undefined',' files'],
                'select': 'other'
            },
            {
                'name': ['Requesterror', 's'],
                'select': 'errors'
            }

        ].filter(validEntries.bind(null, summary.typed.summary))
         .map(outputEntries.bind(null, summary.typed));
    }

    report.meta(summary.total.rawRequests + ' Requests', {
        'decrease': summary.total.size,
        'hasSummary': totalSummaryView && totalSummaryView.length > 0,
        'summary': totalSummaryView
    });

    if (summary.total.size === 0 || summary.total.size < 100) {
        report.error('Total payload size (' + summary.total.size + ') is zero or close to zero to be able to serve a valid banner/displayad.');
    }

    if (summary.typed && summary.typed.types && summary.typed.types.script) {
        var scripts = getTraceOfTypes(summary.typed.types.script);
        var scriptsLength = scripts.trace.filter(function(entry){return entry.sourceURL.indexOf('user-entry.js') === -1;}).length;
        if (scriptsLength > 2) {
            report.warn('Please do not use (' + scriptsLength + ') more than maximum 2 external javascript files', scripts);
        }
    }

    if (summary.typed && summary.typed.types && summary.typed.types.style) {
        var styles = getTraceOfTypes(summary.typed.types.style);
        if (styles.trace.length > 0) {
            report.error('Please do not use (' + styles.trace.length + ') more than maximum 0 external CSS files', styles);
        }
    }

    if (summary.total.requestErrors > 0) {
        report.error('There are ' + summary.total.requestErrors + ' request error' + (summary.total.requestErrors > 1 ? 's' : ''), getTraceOfTypes(summary.typed.types.errors));
    }

    var metas = report.getResult().meta;

    var collected = metas.reduce(collectTotalMeta, {'total': 0, 'threshold': 0});

    report.meta('Total'+(collected.total > 0 ? ' rest value' : ' over threshold'), {
        restValue: collected.total,
        threshold: collected.threshold,
        success: collected.total >= 0,
        error: collected.total < 0
    });

    if (collected.total < 0) {
        report.error('Total payload size ' + collected.total + ' bytes is to high, ' + collected.threshold + ' bytes is the maximum for ' + options.target);
    } else {
        report.info('Total payload size ' + summary.total.size + ' is verified and within the limit of ' + collected.threshold + '.');
    }


}

function collectTotalMeta(totalObj, value){
    if (value.data){
        if (value.data.increase_threshold){
            totalObj.total += value.data.increase_threshold;
            totalObj.threshold += value.data.increase_threshold;
        } else if (value.data.decrease){
            totalObj.total -= value.data.decrease;
        }
    }
    return totalObj;
}

var RE_ADFORM = /(Adform\.Bootstrap|Adform\.RMB|Adform\.DHTML|EngagementTracker)/i;
function outputAdformThreshold(rawFileDataSummary, report, options){
    if (!rawFileDataSummary || !rawFileDataSummary.typed || !rawFileDataSummary.typed.types || !rawFileDataSummary.typed.types.script){
        return;
    }

    var size = 0;
    var data = rawFileDataSummary.typed.types.script;
    Object.keys(data).forEach(function(scriptUrlKey){
        if (RE_ADFORM.test(scriptUrlKey)){
            size += data[scriptUrlKey].bodyLength;
        }
    });

    if (size){
        report.meta('Adform', {
            'increase_threshold': size
        });
    }
}


function validate(harvested, report, next, options) {

    var hasJquery = !! harvested.jquery && harvested.jquery.version;

    var thresholdBytes = (options.target === 'tablet' ? 100000 : 50000);
    //sizeThresholdBytes is actual threshold
    var sizeThresholdBytes = thresholdBytes;

    report.meta('Base for ' + options.target, {
        'increase_threshold': thresholdBytes
    });
    // give threshold more bytes if jquery is present
    var JQUERY_GZIP_MINIFIED = 33369; // as of 1.10.11
    if (hasJquery) {
        sizeThresholdBytes += JQUERY_GZIP_MINIFIED;
        report.meta('jQuery', {
            'increase_threshold': JQUERY_GZIP_MINIFIED
        });
    }

    // give threshold for adform scripts





    var rawFileDataSummary = harvested.har.rawFileDataSummary;
    if (rawFileDataSummary) {
        outputAdformThreshold(rawFileDataSummary, report, options);
        outputSummary(rawFileDataSummary, report, thresholdBytes, sizeThresholdBytes, options);
    } else {
        report.error('Something went wrong. Missing file data summary.');
    }

    next();
}

module.exports = {
    dependencies: ['har', 'jquery'],
    validate: function (harvested, report, next, options) {
        if (harvested) {
            validate.apply(this, Array.prototype.slice.call(arguments));
        } else {
            next();
        }
    }
};
