var pack = require('../package.json');
var config = require('./config.js');
var winston  = require('winston');
var mkdirp = require('mkdirp');

var logsFolder = config.get('logFileName');
mkdirp.sync(logsFolder);

winston.add(winston.transports.DailyRotateFile, {
  filename: logsFolder,
  datePattern: '.yyyyMMdd.log'
});
winston.remove(winston.transports.Console);

module.exports =  winston;
