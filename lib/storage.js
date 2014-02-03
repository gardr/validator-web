var logger = require('./logger.js');
var levelup = require('levelup');
var pack = require('../package.json');
var dbName = './results-db-' + pack.version;
var db = levelup(dbName, {
    encoding: 'json'
});

function get(key, callback) {
    db.get(key, callback);
}

function set(key, value, callback) {
    db.put(key, value, callback);
}

function startsWith(prefix, callback) {
    var list = [];
    var stream = db.createReadStream({
        start: prefix + '',
        end: prefix + '\xFF'
    });
    stream.on('data', function (data) {
        list.push(data);
    });
    stream.on('error', callback);
    stream.on('close', function () {
        callback(null, list);
    });
}

var d = new Date();
var prefix = [d.getDate(), d.getHours(), d.getMinutes(), '-'].join('');
var FORMAT_LEN = 7;

function format(num) {
    num = (num + '');
    return [prefix, new Array(FORMAT_LEN - num.length).join('0'), num].join('');
}

// for now this is a 1-process-server and IDs can just be stored inprocess and disregarded in high fashion.
var counter = 1;

function createId(pre) {
    return (pre = pre || 'R') + '-' + format(counter++);
}

function destroyDatabase(callback) {
    db.close();
    require('leveldown').destroy(dbName, callback);
}

module.exports = {
    get: get,
    set: set,
    startsWith: startsWith,
    _destroyDatabase: destroyDatabase,
    createId: createId
};
