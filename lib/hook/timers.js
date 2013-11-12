var t1 = [];
var t2 = [];
var t3 = [];

function wrapTimeouts(api) {
    t1.push(api.wrap('setTimeout'));
    t2.push(api.wrap('setInterval'));
    t3.push(api.wrap('requestAnimationFrame'));
}

var count = 1;

module.exports = {
    'onResourceReceived': function (response, api) {
        if (response.stage === 'end' && response.url.indexOf('mobile.htm') > -1) {
            api.getResultObject().wrapped = (count++);
            wrapTimeouts(api);
        }
    },
    'onBeforeExit': function (api) {
        api.switchToIframe();

        function resolve(fn) {
            return fn();
        }

        api.getResultObject().timers = {
            'setTimeout': t1.map(resolve),
            'setInterval': t2.map(resolve),
            'requestAnimationFrame': t3.map(resolve)
        };

    }
};
