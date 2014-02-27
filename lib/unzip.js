var pathLib = require('path');
var mkdirp = require('mkdirp');
var fs = require('fs');
var unzip = require('unzip');

var log = require('./logger.js');
var config = require('./config.js');

module.exports = function (uploadedZipFile, data, done) {
    data.output.zip = {
        'path': pathLib.join(config.get('tmpDir'), data.id, 'zip')
    };

    function cleanup(){
        fs.unlink(uploadedZipFile.path, function(err) {
            log.info('Deleted file ' + uploadedZipFile.path + ': ' + !err);
        });
    }

    mkdirp(data.output.zip.path, function (err) {
        console.log('mkdirp', data.output.zip.path);
        if (err) {
            var msg = 'Failed creating tmp zip output directory: ' + data.output.zip.path;
            log.error(msg);
            data.error = {
                'message': msg
            };
            return done();
        }

        var stream = fs.createReadStream(uploadedZipFile.path).pipe(unzip.Extract(data.output.zip));

        stream.on('close', function () {
            data.output.zip.unzipSuccess = true;
            console.log('data.output.zip.unzipSuccess = true;');
            cleanup();
            // read index.html file
            fs.readFile(pathLib.join(data.output.zip.path, 'index.html'), function (err, fileBuffer) {
                if (err) {
                    data.error = {
                        'message': 'Failed reading index.html file.',
                        'err': err
                    };
                    return done();
                }
                data.output.html = fileBuffer.toString('utf8');
                done();

            });
        });

        stream.on('error', function (err) {
            data.error = {
                'message': 'An error occured with unzipping file'
            };
            cleanup();
            done();
        });
    });


};

