var MAX_CALLS = [3, 1, 0];
var METHODS = ['setTimeout', 'setInterval', 'requestAnimationFrame'];

function validate(harvested, report, next) {
    if (!(harvested.timers)) {
        console.log('Missing harvested.timers', harvested.timers);
        return next();
    }

    METHODS.forEach(function (method, methodIndex) {
        // filter out internal

        var list = harvested.timers[method];
        if (!list || list.length === 0) {
            //console.log('no entries for ' + method, harvested.timers);
            return;
        }

        // handle lists in lists
        var listsInLists = Array.isArray(list[0]);
        //console.log('listsInLists', listsInLists, list);
        if (listsInLists) {
            list.forEach(collectionInCollection);
        } else {
            collectionInCollection(list, 0, list);
        }

        function collectionInCollection(collection, index, list) {
            collection = collection.filter(isHttp);
            var msg;
            var trace = {trace: collection.map(function(v){
                return v.trace;
            })};
            if (collection.length > MAX_CALLS[methodIndex]) {
                msg = ['Overusage of ', method, '.', ' In practice ', collection.length, ' times when maximum is ', (MAX_CALLS[methodIndex])].join('');
                report.error(msg, trace);
            } else if (collection.length > 0 && collection.length <= MAX_CALLS[methodIndex]) {
                msg = ['Usage of ', method, '.', ' ', collection.length, ' times used when maximum is ', (MAX_CALLS[methodIndex])].join('');
                report.warn(msg, trace);
            }
        }

    });
    next();
}

function isHttp(entry) {
    return (entry && entry.trace && entry.trace.sourceURL && entry.trace.sourceURL.indexOf('http') === 0);
}

module.exports = {
    validate: validate
};
