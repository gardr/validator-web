// var log = require('../logger.js');
// var GIFEncoder = require('gifencoder');
// var concat = require('concat-stream');
// var Canvas = require('canvas');

// function createImage(screenshots, done) {
//     var first = screenshots[0];
//     var width = first.width;
//     var height = first.height;
//     var startTime = first.time;

//     var encoder = new GIFEncoder(width, height);

//     var canvas = new Canvas(width, height);
//     var ctx = canvas.getContext('2d');
//     ctx.font = '22px Helvetica';

//     encoder.createReadStream().pipe(concat(function (data) {
//         done(data);
//     }));

//     encoder.start();
//     encoder.setRepeat(0);
//     encoder.setQuality(10);
//     encoder.setDelay(1000);

//     ctx.beginPath();
//     ctx.rect(0, 0, width, height);
//     ctx.fillStyle = '#fff';
//     ctx.fill();

//     screenshots.forEach(function (screenshot, index, list) {
//         ctx.beginPath();
//         ctx.rect(0, 0, width, height);
//         ctx.fillStyle = '#fff';
//         ctx.fill();
//         var timing = screenshot.time - startTime;
//         var image = new Canvas.Image();
//         image.src = screenshot.src;
//         ctx.drawImage(image, 0, 0, width, height);
//         var text = ['Image ', (index + 1), '/', list.length, ' (', timing, 'ms) ', moment(screenshot.time).format('HH:mm:ss.SS')].join('');

//         ctx.fillStyle = 'white';
//         ctx.fillText(text, 25, 25);
//         ctx.strokeStyle = 'black';
//         ctx.strokeText(text, 25, 25);

//         // output
//         encoder.addFrame(ctx);
//     });

//     encoder.setDelay(1000);
//     encoder.addFrame(ctx);

//     encoder.finish();
// }

var fs = require('fs');
var pathLib = require('path');
var async = require('async');
var moment = require('moment');


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

            // createImage(images, function (result) {
            //     harvested.animatedGif = result.toString('base64');
            //     next();
            // });
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
