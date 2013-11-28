var images = [];

module.exports = {
    'onPageOpen': function (api) {
        var options = api.getOptions();

        var base = options.outputDirectory + '/' + options.width + 'x' + options.height + '_';

        function handler() {
            var image = api.getPNG();
            if (image !== images[images.length - 1]) {
                page.render(base + Date.now() + '.png');
                images.push(image);
            }
            // loop
            setTimeout(handler, 25);
        }

        setTimeout(handler, 25);
    },
    'onBeforeExit': function (api) {
        var options = api.getOptions();
        api.getResultObject().imageOutputDir = options.outputDirectory;
    }
};
