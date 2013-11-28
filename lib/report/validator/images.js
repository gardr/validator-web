var fs = require('fs');
var pathLib = require('path');
var async = require('async');
var moment = require('moment');
var log = require('../../logger.js');


function getImages(tmp, harvested, next, options) {
    fs.readdir(tmp, function (err, folder) {
        if (err) {
            log.error('Failed fetching images from ' + tmp);
            return next();
        }

        var pathList = folder.map(function (filename) {
            return tmp + '/' + filename;
        });

        async.map(pathList, fs.readFile, function (err, results) {
            // results is now an array of stats for each file
            var images = folder.map(function (filename, index, list) {
                var match = filename.match(/^(\d+)x(\d+)_(\d+)/);
                return {
                    active: index === 0,
                    path: tmp + '/' + filename,
                    filename: filename,
                    index: index +1,
                    id: options.id,
                    total: list.length,
                    width: match && match[1]*1,
                    height: match && match[2]*1,
                    time: match && (match[3]*1),
                    formattedTime: match && moment(match[3]*1).format('HH:mm:ss.SS')
                };
            });

            //add timing
            var start = images[0].time;
            images = images.map(function(img){
                img.timing = img.time - start;
                return img;
            });


            harvested.images = images;
            harvested.firstImage = images[0];
            harvested.hasScreenshots = images && images.length > 0;
            next();

        });

    });
}

module.exports = {
    validate: function (harvested, report, next, options) {
        if (harvested && harvested.imageOutputDir) {
            getImages(harvested.imageOutputDir, harvested, next, options);
        } else {
            next();
        }
    }
};
