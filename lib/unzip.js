var pathLib = require('path');
var mkdirp = require('mkdirp');
var fs = require('fs');
var unzip = require('unzip');

var log = require('./logger.js');
var config = require('./config.js');
var html = require('./html.js');

module.exports = function (uploadedZipFile, data, done) {
    data.output.zip = {
        'path': pathLib.join(config.get('tmpDir'), data.id, 'zip')
    };

    mkdirp(data.output.zip.path, function (err) {
        if (err) {
            var msg = 'Failed creating tmp zip output directory: ' + data.output.zip.path;
            log.error(msg);
            data.error = {
                'message': msg
            };
            return done();
        }
        runUnzip(uploadedZipFile, data, done);
    });

};

var RE_PREFIX = /^\.|^__/;
function validPrefix(name){
    return !(RE_PREFIX.test(name));
}

var validExtentions = ['js', 'html', 'htm', 'css', 'json', 'jpeg', 'jpg', 'png', 'gif'];
function validExtention(ext){
    return validExtentions.indexOf(ext.substring(1)) > -1;
}

function runUnzip(uploadedZipFile, data, done) {

    function cleanup() {
        fs.unlink(uploadedZipFile.path, function (err) {
            log.info('Deleted file ' + uploadedZipFile.path + ': ' + !err);
        });
    }

    var readStream = fs.createReadStream(uploadedZipFile.path).pipe(unzip.Parse());

    readStream.on('entry', function (entry) {
        var fileName        = entry.path;
        var extention       = pathLib.extname(fileName).toLowerCase();
        var baseFileName    = pathLib.basename(fileName, extention);
        var type            = entry.type; // 'Directory' or 'File'
        var outputPath      = pathLib.join(data.output.zip.path, fileName);

        if (!validPrefix(fileName) || !validPrefix(baseFileName)){
            return entry.autodrain();
        }

        if (type === 'File' && validExtention(extention)) {
            mkdirp(pathLib.dirname(outputPath), function(err){
                if (err){
                    var msg = 'Failed creating folder: '+outputPath;
                    log.error(msg);
                    data.error = {
                        'message': msg
                    };
                    this.emit('error', {message: msg});
                } else {
                    if (baseFileName === 'index' && (extention === '.html' || extention === '.htm') ){
                        data.output.zip.indexFilePath = outputPath;
                    }
                    entry.pipe(fs.createWriteStream(outputPath));
                }
            });

        } else {
            entry.autodrain();
        }
    });

    readStream.on('close', function () {
        data.output.zip.unzipSuccess = true;

        cleanup();

        if (!data.output.zip.indexFilePath){
            var msg = 'Failed locating index.html file';
            log.error(msg);
            data.error = {
                'message': msg
            };
            return done();
        }

        fs.readFile(data.output.zip.indexFilePath, function (err, fileBuffer) {
            if (err) {
                data.error = {
                    'message': 'Failed reading index.html file.',
                    'err': err
                };
                return done();
            }
            var base = 'http://' + config.get('host') + '/zip/' + data.id + pathLib.dirname(data.output.zip.indexFilePath).replace(data.output.zip.path, '') + '/';

            console.log('base', base);

            // resolve relative paths
            data.output.html = html.fix(base, fileBuffer.toString('utf8')).full;
            done();

        });
    });

    readStream.on('error', function (err) {
        data.error = {
            'message': 'An error occured with unzipping file. '+err.message
        };
        cleanup();
        done();
    });
}
