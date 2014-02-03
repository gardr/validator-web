function collectCSS() {
    var KEYS = ['height', 'width', 'position', 'left', 'right', 'top', 'bottom', 'z-index', 'display', 'visability'];
    // wrapper element
    var element = document.getElementById('GARDR');
    var computedStyle = window.getComputedStyle(element);

    var wrapper = {
        'css': {},
        clickHandler: element.onclick && element.onclick.toString()
    };
    KEYS.forEach(function (key) {
        wrapper.css[key] = computedStyle.getPropertyValue(key);
    });

    var banner = {
        'css': {}
    };
    var firstChildElement = element.querySelector('div[data-responsive],div[onclick],a[href]');
    if (firstChildElement === null) {
        firstChildElement = element.querySelector('div');
    }

    if (firstChildElement !== null) {
        banner.found = true;
        banner.clickHandler = firstChildElement.onclick && firstChildElement.onclick.toString();
        banner.name = firstChildElement.tagName;
        banner.html = firstChildElement.innerHTML;
        computedStyle = window.getComputedStyle(firstChildElement);
        KEYS.forEach(function (key) {
            banner.css[key] = computedStyle.getPropertyValue(key);
        });
    } else {
        banner.found = false;
        banner.html = element.innerHTML;
    }

    // look for illegal tags
    function filterFound(selector) {
        var found = document.querySelectorAll(selector);
        return found && found.length > 0;
    }

    function report(selector) {
        var html = [];
        var list = Array.prototype.slice.call(document.querySelectorAll(selector));

        list.forEach(function (el) {
            var wrap = document.createElement('div');
            wrap.appendChild(el.cloneNode(true));
            html.push(wrap.innerHTML);
        });

        return {
            html: html,
            selector: selector
        };
    }

    var illegal = ['meta[name="viewport"]'].filter(filterFound).map(report);

    return {
        illegal: illegal,
        wrapper: wrapper,
        banner: banner
    };
}

module.exports = {
    'onPageOpen': function onPageOpen(api) {

        var options = api.getOptions();

        var strOptions = JSON.stringify(options);

        api.evaluate(function (options) {
            window.initManager(options);
        }, strOptions);

    },
    'onBeforeExit': function (api) {
        //
        api.switchToMainFrame();

        function gardrData() {
            if (!window.__manager) return;
            var pos = window.__manager._getById('phantom1');
            return {
                frameInput: pos.getData(),
                frameOutput: pos.input
            };
        }

        api.set('data', api.evaluate(gardrData));
        api.switchToIframe();
        api.set('dom', api.evaluate(collectCSS));
    }
};
