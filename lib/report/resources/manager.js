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

    var manager = window.__manager = window.getManager({
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

    console.log('manager.js queue:', options.scriptUrl);

    manager.queue('phantom', {
        url: options.scriptUrl,
        container: 'ADS',
        height: 225,
        width: 980
    });

    manager.renderAll(function (err, result) {
        if (err){
            console.log('Manager Error: '+JSON.stringify(err));
        } else {
            try{
                // debug ish
                result = JSON.stringify({
                    name: 'phantom',
                    state: manager.items.phantom.state,
                    // todo: temp
                    content: manager.items.phantom.iframe.iframe.contentWindow.document.body.innerHTML
                });
            }catch(e){
                result = e;
            }

            //console.log('render all done: '+JSON.stringify(result, null, 4));
        }

    });
};
