module.exports = {
    'onBeforeExit': function (api) {
        var result = api.getResultObject();

        function getStyles(){
            var styleTags = Array.prototype.slice.call(document.querySelectorAll('style'));
            // dirty get style tag nr 3 and upwards 
            return styleTags.map(function(tag){return tag.innerHTML;}).slice(2).filter(function(v){return !!v;});
        }

        api.switchToIframe();
        var frameStyles = api.evaluate(getStyles);

        result.frameStyles = frameStyles;
    }
};