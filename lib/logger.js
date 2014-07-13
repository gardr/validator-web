var pack = require('../package.json');
var config = require('./config.js');
var winston  = require('winston');
var mkdirp = require('mkdirp');
var path = require('path');

var logFileName = config.get('logFileName');
mkdirp.sync(path.dirname(logFileName));

if (winston.alreadyLoaded !== true){
    // needed for mocha --watch to not cause errors
    winston.alreadyLoaded = true;
    if (process.env.NODE_ENV !== 'test'){
        winston.add(winston.transports.DailyRotateFile, {
          filename: logFileName,
          datePattern: '.yyyyMMdd.log'
        });
        winston.remove(winston.transports.Console);
    }    
}

module.exports =  winston;
