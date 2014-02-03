module.exports = {
    'onBeforeExit': function (api) {
        function getStyles() {
            var filterOut = [
                '* { padding: 0; margin: 0; border: 0; }'
            ];

            function filterOutGardr(v) {
                return !!v && filterOut.indexOf(v.trim()) === -1 && v.indexOf('GARDR') === -1;
            }

            function mapContent(tag) {
                return tag.innerHTML;
            }

            var styleTags = Array.prototype.slice.call(document.querySelectorAll('style'));

            return styleTags.map(mapContent).filter(filterOutGardr);
        }

        api.switchToIframe();
        api.set('styles', api.evaluate(getStyles));
    }
};
