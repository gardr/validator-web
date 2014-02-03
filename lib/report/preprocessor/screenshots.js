var fs = require('fs');
var pathLib = require('path');
var async = require('async');
var moment = require('moment');
var log = require('../../logger.js');

var REG_EXP_FILENAME = /^(\d+)x(\d+)_(\d+)/;

function getImages(harvested, output, next, options) {
    fs.readdir(options.outputDirectory, function (err, folder) {
        if (err) {
            log.error('Failed fetching images from ' + tmp);
            return next();
        }

        var pathList = folder.map(function (filename) {
            return options.outputDirectory + '/' + filename;
        });

        async.map(pathList, fs.stat, function (err, results) {
            if (err){
                return next(err);
            }

            // results is now an array of stats for each file
            folder = folder.filter(function(file, i){
                return results[i].isFile();
            });
            var last = folder.length - 1;
            var images = folder.map(function (filename, index, list) {
                var match = filename.match(REG_EXP_FILENAME);
                return {
                    'active': index === last,
                    'path': options.outputDirectory + '/' + filename,
                    'filename': filename,
                    'index': index +1,
                    'id': options.id,
                    'total': list.length,
                    'width': match && match[1]*1,
                    'height': match && match[2]*1,
                    'time': match && (match[3]*1),
                    'formattedTime': match && moment(match[3]*1).format('HH:mm:ss.SS')
                };
            });

            //add timing
            var start = images[0].time;
            images = images.map(function(img){
                img.timing = img.time - start;
                return img;
            });

            output('images', images);
            output('firstImage', images[0]);
            output('hasScreenshots', images && images.length > 0);
            next();
        });

    });
}

module.exports = {
    dependencies: ['screenshots'],
    preprocess: function (harvested, output, next, options) {
        if (harvested && harvested.screenshots && options.outputDirectory) {
            getImages.apply(this, Array.prototype.slice.call(arguments));
        } else {
            next();
        }
    }
};
