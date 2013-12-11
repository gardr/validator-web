var logger = require('./logger.js');
var count = 0;
var db = {};

function get(key) {
    return key ? db[key] : db;
}

function set(setkey, value){
    if (Object.keys(db).length > 20) {
        var entry, key;
        for(key in db){
            entry = db[key];
            // only clear processed
            if (!entry || !!entry.processed){
                delete db[key];
            }

        }
        logger.info('Cleared database');
    }
    db[setkey] = value;
    return db[setkey];
}


function map(handler){
    return Object.keys(db).map(function(key, index, list){
        return handler(db[key], key, index, list);
    });
}

module.exports = {
    get: get,
    set: set,
    map: map
};
