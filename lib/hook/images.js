    var images = [];
var metaInfo = [];

module.exports = {
    'onPageOpen': function (api) {
        function handler() {
            var image = api.getPNG();
            if (image !== images[images.length - 1]) {
                images.push(image);
                metaInfo.push({
                    'time': Date.now(),
                    'viewport': api.getViewportSize()
                });
            }
        }

        setInterval(handler, 100);
    },
    'onBeforeExit': function (api) {
        api.getResultObject().images = {
            images: images,
            metaInfo: metaInfo
        };
    }
};