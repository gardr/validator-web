var pack = require('./package.json');
var development = process.env.NODE_ENV !== 'production';
var path = require('path');

var mkdirp = require('mkdirp');
var logsFolder = path.join(__dirname, 'logs');
mkdirp.sync(logsFolder);


/*var bunyan = require('bunyan');

//Bunyan doesnt support filename-template
module.exports = bunyan.createLogger({
    name:  pack.name,
    streams: [
        {
            type: 'rotating-file',
            path: path.join(logsFolder,  pack.name + '.log'),
            period: '1d'
        }
  ]
});*/

var winston  = require('winston');

winston.add(winston.transports.DailyRotateFile, {
  filename: path.join(logsFolder, pack.name + '.json.log'),
  datePattern: '.yyyyMMdd'
});
winston.remove(winston.transports.Console);

module.exports =  winston;