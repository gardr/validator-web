var DecompressZip = require('decompress-zip');
var pathLib = require('path');
var mkdirp = require('mkdirp');
var fs = require('fs');
var log = require('./logger.js');
var config = require('./config.js');
var parseAndResolve = require('document-write-html').parseAndResolve;

var internals = {};

var RE_PREFIX = /^\.|^__/;
internals.validPrefix =  function (name) {
    return !(RE_PREFIX.test(name));
};

var VALID_EXTENTIONS = ['js', 'html', 'htm', 'css', 'json', 'jpeg', 'jpg', 'png', 'gif'];
internals.validExtention =  function (ext) {
    return VALID_EXTENTIONS.indexOf(ext.substring(1)) > -1;
};

internals.runUnzip =  function (uploadedZipFile, data, done) {

    function cleanup() {
        fs.unlink(uploadedZipFile.path, function (err) {
            log.info('Deleted file ' + uploadedZipFile.path + ': ' + !err);
        });
    }

    var unzipper = new DecompressZip(uploadedZipFile.path);

    unzipper.on('error', function (err) {
        // console.log('Caught an error', err);
        data.error = {
            'message': 'An error occured with unzipping file.  Code 040. ' + err.message,
            'stack': err.stack + ''
        };
        cleanup();
        done();
    });

    unzipper.on('extract', function (log) {
        if (config.get('env') === 'development'){
            require('colors');
            console.log('FINISHED EXTRACTING:\n'.yellow, uploadedZipFile.path, '\n', (JSON.stringify(log, null, 4)+'').blue.bold, '\n->', data.output.zip.path);
        }

        data.output.zip.unzipSuccess = true;
        cleanup();

        if (!data.output.zip.indexFilePath) {
            var msg = 'Failed locating index.html file. Code 041';
            log.error(msg);
            data.error = {
                'message': msg
            };
            return done();
        }

        fs.readFile(data.output.zip.indexFilePath, function (err, fileBuffer) {
            if (err) {
                data.error = {
                    'message': 'Failed reading / locating index.html file. Code 042',
                    'err': err
                };
                return done();
            }
            var indexDir = pathLib.dirname(data.output.zip.indexFilePath);
            var base = data.host + '/zip/' + data.id + indexDir.replace(data.output.zip.path, '') + '/';

            // resolve relative paths
            data.output.html = parseAndResolve(base, fileBuffer.toString('utf8')).full;
            done();

        });
    });

    unzipper.extract({
        path: data.output.zip.path,
        filter: internals.filterFn.bind(null, data)
    });
};

internals.filterFn = function (data, file) {
    var extention = pathLib.extname(file.filename).toLowerCase();
    var baseFileName = pathLib.basename(file.filename, extention);


    if (baseFileName === 'index' && (extention === '.html' || extention === '.htm')) {
        data.output.zip.indexFilePath = pathLib.join(data.output.zip.path, file.path);
    }

    if (file.type === "SymbolicLink"){
        return false;
    }

    var isValidFolder = file.type === 'Directory' && file.parent && (file.parent === '.' || internals.validPrefix(file.parent));
    if (isValidFolder){
        return true;
    }

    var isValidFile = file.type === 'File' && file.filename && internals.validPrefix(file.filename) && internals.validExtention(extention);
    if (isValidFile){
        return true;
    }

    return false;
};


module.exports = function (uploadedZipFile, data, done) {
    data.output.zip = {
        'path': pathLib.join(config.get('tmpDir'), data.id, 'zip')
    };

    mkdirp(data.output.zip.path, function (err) {
        if (err) {
            var msg = 'Failed creating tmp zip output directory: ' + data.output.zip.path + '.  Code 043';
            log.error(msg);
            data.error = {
                'message': msg
            };
            return done();
        }
        internals.runUnzip(uploadedZipFile, data, done);
    });

};
