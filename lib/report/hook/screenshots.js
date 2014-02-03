var images = [];

module.exports = {
    'onPageOpen': function (api) {
        var options = api.getOptions();

        var base = options.outputDirectory + '/' + options.width + 'x' + options.height + '_';

        function handler() {
            var image = api.getPNG();
            if (image !== images[images.length - 1]) {
                api.renderToFile(base + Date.now() + '.png');
                images.push(image);
            }
            // loop
            window.setTimeout(handler, 25);
        }

        window.setTimeout(handler, 25);
    }
};
