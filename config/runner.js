var pack = require('../package.json');

module.exports = function(conf) {

    var base;

    var version = 'w'+pack.version + '_' + 'v'+pack.dependencies['gardr-validator'] + 'h'+pack.dependencies['gardr-host'];


    if (conf.get('env') === 'production'){

        base = 'http://ads-gardr.gardr.org';


        return {
            parentUrl: base+'/preview/parent.html?g='+version,
            iframeUrl: base+'/preview/built/iframe.html?g='+version,
            resourceDomainBase: base,
        };
    }

    if (process.env.HOST_BASE) {
        var port = conf.get('port');
        base = process.env.HOST_BASE + (port !== 80 ? ':' + port : '');
    } else {
        base = 'http://127.0.0.1:'+conf.get('port');
    }


    return {
        parentUrl: base+'/preview/parent.html?ts='+Date.now()+'&g='+version,
        iframeUrl: base+'/preview/built/iframe.html?ts='+Date.now()+'&g='+version,
        resourceDomainBase: base
    };

}
