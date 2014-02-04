var getManager = require('gardr/src/mobile.js');

if (!Function.prototype.bind) {
    Function.prototype.bind = function (oThis) {
        if (typeof this !== "function") {
            // closest thing possible to the ECMAScript 5 internal IsCallable function
            throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
        }

        var aArgs = Array.prototype.slice.call(arguments, 1),
            fToBind = this,
            fNOP = function () {},
            fBound = function () {
                return fToBind.apply(this instanceof fNOP && oThis
                                     ? this
                                     : oThis,
                                   aArgs.concat(Array.prototype.slice.call(arguments)));
            };

        fNOP.prototype = this.prototype;
        fBound.prototype = new fNOP();

        return fBound;
    };
}

window.initManager = function (options) {
    options = JSON.parse(options);

    var manager = window.__manager = getManager({
        iframeUrl: options.iframeUrl
    });

    function getOrigin(loc) {
        return loc.origin || (loc.protocol + '//' + loc.hostname + (loc.port ? ':' + loc.port : ''));
    }

    var base = getOrigin(document.location) + '/';

    manager.extendInframeData({
        loglevel: 4,
        logto: 'console',
        // base to help test local version e.g. test fixtures
        base: base //,

        //scriptUrl: params.url
    });

    console.log('gardr-manager.js queue:', options.scriptUrl);

    manager.queue('phantom', {
        url: options.scriptUrl,
        container: 'ADS',
        height: options.height,
        width: options.width
    });

    manager.renderAll(function (err, result) {
        if (err){
            console.log('gardr-manager.js Error: '+JSON.stringify(err));
        } else {
            try{
                result = JSON.stringify({
                    name: 'phantom',
                    state: manager.items.phantom.state,
                    // accessing iframe via gardr ref
                    content: manager.items.phantom.iframe.iframe.contentWindow.document.body.innerHTML
                });
            }catch(e){
                result = e;
            }
        }

    });
};
