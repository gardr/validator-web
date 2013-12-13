var pathLib = require('path');
var mkdirp = require('mkdirp');
var fs = require('fs');
var unzip = require('unzip');

var log = require('./logger.js');
var config = require('./config.js');

module.exports = function (zipfile, data, done) {
    // path + zip
    data.zip = {
        path: pathLib.join(config.get('tmpDir'), data.id, 'zip')
    };

    mkdirp(data.zip.path, function (err) {
        if (err) {
            var msg = 'Failed creating tmp zip output directory: ' + data.zip.path;
            log.error(msg);
            data.error = {
                message: msg
            };
            return done();
        }

        var stream = fs.createReadStream(zipfile.path).pipe(unzip.Extract(data.zip));

        stream.on('close', function () {
            data.zip.unzipSuccess = true;
            fs.unlink(zipfile.path, unlinkHandler);
            fs.readFile(pathLib.join(data.zip.path, 'index.html'), function (err, fileBuffer) {
                if (err) {
                    data.error = {
                        message: 'Failed reading index.html file.',
                        err: err
                    };
                    return done();
                }

                data.html = fileBuffer.toString('utf8');

                done();

            });
        });

        stream.on('error', function (err) {
            data.error = {
                message: 'An error occured with unzipping file'
            };
            fs.unlink(zipfile.path, unlinkHandler);
            done();
        });
    });

    function unlinkHandler(err) {
        log.info('Deleted file ' + zipfile.path + ': ' + !err);
    }
};

