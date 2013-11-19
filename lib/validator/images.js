var GIFEncoder = require('gifencoder');
var concat = require('concat-stream');
var Canvas = require('canvas');

function createImage(base64ImageList, metaInfoList, done) {
    var first = metaInfoList[0];
    var width = first.viewport.width;
    var height = first.viewport.height;
    var encoder = new GIFEncoder(width, height);

    var canvas = new Canvas(width, height);
    var ctx = canvas.getContext('2d');

    encoder.createReadStream().pipe(concat(function (data) {
        done(data);
    }));

    encoder.start();
    encoder.setRepeat(0);
    encoder.setQuality(10);

    var startTime = metaInfoList[0].time;

    function fillBackground(color) {
        ctx.beginPath();
        ctx.rect(0, 0, width, height);
        ctx.fillStyle = color;
        ctx.fill();
    }

    function addText(text) {
        ctx.font = '22px Helvetica';
        ctx.fillStyle = 'white';
        ctx.strokeStyle = 'black';
        ctx.strokeText(text, 25, 25);
    }

    encoder.setDelay(1000);

    base64ImageList.forEach(function (base64Image, index) {
        var img = new Canvas.Image();
        img.src = 'data:image/png;base64,' + base64Image;

        fillBackground('white');
        var timing = metaInfoList[index].time - startTime;

        //encoder.setDelay(timing);

        ctx.drawImage(img, 0, 0, img.width, img.height);
        addText(['Image ', (index + 1), '/', base64ImageList.length, ' (', timing, 'ms)'].join(''));
        // output

        encoder.addFrame(ctx);

    });

    encoder.setDelay(1000);
    encoder.addFrame(ctx);

    encoder.finish();
}

module.exports = {
    validate: function (harvested, report, next) {

        if (harvested && harvested.images && harvested.images.images.length > 0) {

            createImage(harvested.images.images, harvested.images.metaInfo, function (result) {
                harvested.animatedGif = result.toString('base64');
                next();
            });

        } else {
            next();
        }
    }
};