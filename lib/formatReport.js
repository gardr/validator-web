function bytesToClosestUnit(bytes) {
    var sizes = ['', 'KB', 'MB', 'GB', 'TB'];
    if (bytes == 0) {
        return '0';
    }
    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1000)), 10);
    return Math.round(bytes / Math.pow(1000, i), 2) + ' ' + sizes[i];
}


function formatSize(obj, key) {
    var value = obj[key];

    if (typeof value !== 'undefined') {
        if (value < 0) {
            obj[key + '_kb'] = '-' + bytesToClosestUnit(Math.abs(value));
        } else {
            obj[key + '_kb'] = bytesToClosestUnit(value);
        }
    }
}

module.exports = function formatReport(report) {
    if (!report || typeof report !== 'object') {
        return report;
    }

    var keys = Object.keys(report);

    report.full = [];

    var viewClasses = {
        'warn': 'warning',
        'error': 'danger'
    };

    keys.forEach(function(type) {
        var reportList = report[type];
        // add Booleans for view
        report['has' + type.substring(0, 1).toUpperCase() + type.substring(1)] = reportList && reportList.length > 0;
        reportList.forEach(function(entry) {
            entry.type = type;
            entry.typeClass = viewClasses[type] || '';

            //format kb sizes on meta data
            if (type === 'meta' && entry.data) {
                formatSize(entry.data, 'increaseThreshold');
                formatSize(entry.data, 'decrease');
                formatSize(entry.data, 'restValue');
                formatSize(entry.data, 'threshold');
                if (entry.data.hasSummary) {
                    entry.data.summary.forEach(function(summaryEntry) {
                        formatSize(summaryEntry.data, 'size');
                        if (summaryEntry.hasRaw) {
                            summaryEntry.raw.forEach(function(rawEntry) {
                                formatSize(rawEntry, 'bodyLength');
                            });
                        }
                    });
                }
            }
            report.full.push(entry);
        });
    });
    report.success = report.error.length === 0;
    return report;
};
