var RE_QUERY = /(\?.*)/;
var RE_JQ = /jquery(.*)?\.js$/;
function isJquery(url){
    return RE_JQ.test( url.replace(RE_QUERY) );
}

var resolvers = [];
function wrapAnimate(api){
    resolvers.push( api.wrap('jQuery.fn.animate') );
}

var alreadyWrapped = false;

module.exports = {
    'onResourceReceived': function(response, api){
        if (alreadyWrapped !== true && response.stage === 'end' && isJquery(response.url)){
            wrapAnimate(api);
            alreadyWrapped = true;
            //api.getResultObject().jquery_animate_init = new Date();
        }
    },
    'onBeforeExit': function(api){
        var result = api.getResultObject();
        var probes = resolvers.map(function(fn){
            return fn();
        });
        if (probes && probes.length > 0){
            result.jquery = probes;
        }

        api.switchToIframe();
        result.jquery_version = api.evaluate(function(){return window.jQuery && window.jQuery.fn && window.jQuery.fn.jquery;});
    }
};
