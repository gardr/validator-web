var logger = require('./logger.js');
var levelup = require('levelup');
var Sublevel = require('level-sublevel');
var pack = require('../package.json');

var DB_NAME = './results-db-' + pack.version + '-' + (process.env.NODE_ENV||'X');
function createDb(){
    var _db;
    if (process.env.NODE_ENV === 'test'){
        console.log('INFO: Running storage backend in memory for test enviroment');
        _db = levelup('memorydb', {
            encoding: 'json',
            db: require('memdown')
        });
    } else {
        _db = levelup(DB_NAME, {
            encoding: 'json'
        });
    }

    return Sublevel(_db);
}

var db = createDb();

var generalDb = db.sublevel('general');

function get(key, callback) {
    return generalDb.get(key, callback);
}

function set(key, value, callback) {
    return generalDb.put(key, value, callback);
}

function startsWith(prefix, callback) {
    var list = [];
    var stream = generalDb.createReadStream({
        start: prefix + '',
        end: prefix + '\xFF'
    });
    stream.on('data', function(data) {
        list.push(data);
    });
    stream.on('error', callback);
    stream.on('close', function() {
        callback(null, list);
    });
}

function getSublevel(name) {
    return db.sublevel(name);
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
    require('leveldown').destroy(DB_NAME, callback);
    db = null;
    generalDb = null;
}

module.exports = {
    get: get,
    set: set,
    startsWith: startsWith,
    getSublevel: getSublevel,
    _destroyDatabase: destroyDatabase,
    createId: createId
};
