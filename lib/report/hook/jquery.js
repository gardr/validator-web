var RE_QUERY = /(\?.*)/;
var RE_JQ = /jquery(.*)?\.js$/i;
function isJquery(url){
    return RE_JQ.test( url.replace(RE_QUERY) );
}

var resolvers = [];
function wrapAnimate(api){
    resolvers.push( api.wrap('jQuery.fn.animate') );
}

var alreadyWrapped = false;

function collectJqueryDomVersion(){
    return window.jQuery && window.jQuery.fn && window.jQuery.fn.jquery;
}

module.exports = {
    'onResourceReceived': function(response, api){
        if (alreadyWrapped !== true && response.stage === 'end' && isJquery(response.url)){
            wrapAnimate(api);
            alreadyWrapped = true;
        }
    },
    'onBeforeExit': function(api){
        var probes = resolvers.map(function(fn){
            return typeof fn === 'function' ? fn() : fn;
        });
        if (probes && probes.length > 0){
            api.set('animate', probes);
        }

        api.switchToIframe();
        api.set('version', api.evaluate(collectJqueryDomVersion));
    }
};
