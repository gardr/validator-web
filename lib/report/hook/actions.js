function performUserInteraction() {

    function action(element, type) {
        if (element === null) {
            return;
        }
        var event = document.createEvent("MouseEvent");
        event.initMouseEvent(
            type,
            true /* bubble */ ,
            true /* cancelable */ ,
            window,
            null,
            0, 0, 0, 0, /* coordinates screenX, screenY, clientX, clientY */
            false, false, false, false, /* modifier keys */
            0 /*button:left*/ , null
        );
        element.dispatchEvent(event);
    }

    var element = document.body.firstChild;
    var banner = element.querySelector('div[data-responsive],div[onclick],a,div');

    if (!banner) {
        banner = element.firstChild;
    }
    action(banner, 'mouseover');
    setTimeout(function(){
        action(banner, 'click');
    }, 100);
}

function wrapWindowOpen() {
    function getWindowOpenSource() {
        var error;
        try {
            throw new Error('windowOpenTracer');
        } catch (e) {
            error = e;
        }
        if (error && error.stackArray) {
            return error.stackArray[error.stackArray.length - 1];
        }
    }

    window.__windowOpenCallers = [];
    window.open = function (url, target) {
        window.__windowOpenCallers.push({
            url: url,
            target: target,
            time: Date.now(),
            trace: getWindowOpenSource()
        });
    };
}

function collectWindowOpen() {
    return window.__windowOpenCallers;
}

module.exports = {
    'onHalfTime': function (api) {
        api.set('actionTime', +new Date());
        api.switchToIframe();
        api.evaluate(wrapWindowOpen);
        setTimeout(function () {
            api.switchToIframe();
            api.evaluate(performUserInteraction);
        }, 50);

    },
    'onBeforeExit': function (api) {
        api.switchToIframe();
        api.set('windowOpened', api.evaluate(collectWindowOpen));

    }
};
