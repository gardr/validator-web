// MouseEvents

module.exports = {
    'onHalfTime': function (api) {

        api.switchToIframe();
        api.evaluate(function () {

            function getWindowOpenSource() {
                var error;
                try {
                    throw new Error('windowOpenTracer');
                } catch (e) {
                    error = e;
                }
                if (error) {
                    return error.stackArray[error.stackArray.length -1];
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
        });

        setTimeout(function () {

            api.switchToIframe();
            api.evaluate(function () {

                function click(element) {
                    if (element === null){
                        return;
                    }
                    var event = document.createEvent("MouseEvent");
                    event.initMouseEvent(
                        "click",
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

                if (!banner){
                    banner = element.firstChild;
                }
                click(banner);

            });
        }, 100);

    },
    'onBeforeExit': function (api) {
        api.switchToIframe();
        api.getResultObject().windowOpened = api.evaluate(function () {
            return window.__windowOpenCallers;
        });

    }
};