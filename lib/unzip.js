var DecompressZip = require('decompress-zip');
var pathLib = require('path');
var request = require('request');
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

internals.validateHTML = function(html, done){
    var options = {
        uri: 'http://validator.w3.org/nu/',
        headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'User-Agent' : 'gardr-validator-web'
        },
        qs: {
            'out': 'json'
        },
        method: 'POST',
        body: html
    };

    request(options, function(error, response, result){

        if (error){
          return done(error);
        }

        var data;
        try{
            data = typeof result === 'string' ? JSON.parse(result) : result;
        } catch(e){
            error = e;
        }


        done(error, data);
    });
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

    unzipper.on('extract', function (ziplog) {
        if (config.get('env') === 'development'){
            require('colors');
            console.log('FINISHED EXTRACTING:\n'.yellow,
                uploadedZipFile.path, '\n',
                (JSON.stringify(ziplog, null, 4)+'').blue.bold,
                '\n->',
                data.output.zip.path
            );
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

            var html = fileBuffer.toString('utf8');

            // validate against w3c
            internals.validateIndex(data, html, function(){

                // resolve relative paths
                var indexDir = pathLib.dirname(data.output.zip.indexFilePath);
                var host = data.runnerConfig && data.runnerConfig.resourceDomainBase ?  data.runnerConfig.resourceDomainBase : data.host;
                var base = host + '/zip/' + data.id + indexDir.replace(data.output.zip.path, '') + '/';
                //
                data.output.html = parseAndResolve(base, html);

                done();
            });



        });
    });

    unzipper.extract({
        path: data.output.zip.path,
        filter: internals.filterFn.bind(null, data)
    });
};


var allowedErrors =[
     'Bad value “X-UA-Compatible” for attribute “http-equiv” on element “meta”.',
     'Element “head” is missing a required instance of child element “title”.',
     'Almost standards mode doctype. Expected e.g. “<!DOCTYPE html>”.',
     'Bad value “” for attribute “src” on element “img”: Must be non-empty.',
     '“&” did not start a character reference. (“&” probably should have been escaped as “&amp;”.)',
     'An “img” element must have an “alt” attribute, except under certain conditions. For details, consult guidance on providing text alternatives for images.'
];

function filterErrors(a){
    return a.type === 'error' && a.message && allowedErrors.indexOf(a.message) === -1;
}

internals.validateIndex = function(data, html, done){
    internals.validateHTML(html, function(error, validationResult){
        if (error){
            console.error('w3c validation failed, reason: ', error);
            return done();
        }

        if (!validationResult || !validationResult.messages || validationResult.messages.length <= 0){
            return done();
        }

        var errors = validationResult.messages.filter(filterErrors);

        if (errors.length === 0){
            return done();
        }

        data.error = {
            'message': 'Failed validating index.html file via w3c',
            'errors': errors
        };
        done();
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


var getTmpDir = require('./tmpDir.js');

module.exports = function (uploadedZipFile, data, done) {
    if (!data.output.zip || !data.output.zip.path){
        data.output.zip = {
            'path': pathLib.join(getTmpDir(data.id), 'zip')
        };
    }

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

module.exports._validateIndex = internals.validateIndex;
