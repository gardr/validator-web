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

    base = 'http://localhost:'+conf.get('port');
    return {
        parentUrl: base+'/preview/parent.html?ts='+Date.now()+'&g='+version,
        iframeUrl: base+'/preview/built/iframe.html?ts='+Date.now()+'&g='+version,
        resourceDomainBase: base
    };

}
