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

function filter(handler){
    return Object.keys(db).filter(function(key, index, list){
        return handler(db[key], key, index, list);
    });
}

var d = new Date();
var prefix = [d.getDate(), d.getHours(), d.getMinutes(), '-'].join('');
var FORMAT_LEN = 7;
function format(num){
    num = (num+'');
    return [prefix, new Array(FORMAT_LEN - num.length).join('0'), num].join('');
}

// for now this is a 1-process-server and IDs can just be stored inprocess and disregarded in high fashion.
var counter = 1;
function createId(pre){
    return (pre = pre||'R')+'-'+format(counter++);
}

module.exports = {
    get: get,
    set: set,
    map: map,
    filter: filter,
    createId: createId
};
