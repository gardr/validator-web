module.exports = {
    'onBeforeExit': function (api) {
        var result = api.getResultObject();

        function getStyles() {
            var filterOut = [
                '* { padding: 0; margin: 0; border: 0; }'
            ];

            function filterOutPasties(v) {
                return !!v && filterOut.indexOf(v.trim()) === -1 && v.indexOf('PASTIES') === -1;
            }

            function mapContent(tag) {
                return tag.innerHTML;
            }

            var styleTags = Array.prototype.slice.call(document.querySelectorAll('style'));

            return styleTags.map(mapContent).filter(filterOutPasties);
        }

        api.switchToIframe();
        var frameStyles = api.evaluate(getStyles);

        result.frameStyles = frameStyles;
    }
};
