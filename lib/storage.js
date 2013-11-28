var count = 0;
var db = {};

function get(key) {
    return key ? db[key] : db;
}

function set(key, value){
    count++;
    if (count > 20) {
        db = {};
        count = 0;
    }
    db[key] = value;
    return db[key];
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