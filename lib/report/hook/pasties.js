module.exports = {
    'onPageOpen': function onPageOpen(api) {

        var options     = api.getOptions();

        api.injectLocalJs(options.managerScriptPath);
        api.injectLocalJs(options.managerInitPath);

        var strOptions = JSON.stringify(options);

        api.evaluate(function (options) {
            //console.log('hook/pasties::page.evaluate(): Pasties initManager(options) : ' + !! window.initManager);
            window.initManager(options);
        }, strOptions);

    },
    'onBeforeExit': function(api){
        //
        api.switchToMainFrame();
        var result = api.getResultObject();

        result.pastiesData = api.evaluate(function(){
            if (!window.__manager) return;
            var pos = window.__manager.items.phantom;
            return {
                frameInput: pos.getData(),
                frameOutput: pos.input
            };
        });

        api.switchToIframe();
        result.pastiesDom = api.evaluate(function collectCSS(){
            var KEYS = ['height', 'width', 'position', 'left', 'right', 'top', 'bottom', 'z-index', 'display', 'visability'];
            // wrapper element
            var element = document.getElementById('PASTIES');
            var computedStyle = window.getComputedStyle(element);

            var wrapper = {'css': {}, clickHandler: element.onclick && element.onclick.toString()};
            KEYS.forEach(function(key){
                wrapper.css[key] = computedStyle.getPropertyValue(key);
            });

            var banner = {'css': {}};
            var firstChildElement = element.querySelector('div[data-responsive],div[onclick],a[href]');
            if (firstChildElement === null) {
                firstChildElement = element.querySelector('div');
            }

            if (firstChildElement !== null){
                banner.found = true;
                banner.clickHandler = firstChildElement.onclick && firstChildElement.onclick.toString();
                banner.name = firstChildElement.tagName;
                banner.html = firstChildElement.innerHTML;
                computedStyle = window.getComputedStyle(firstChildElement);
                KEYS.forEach(function(key){
                    banner.css[key] = computedStyle.getPropertyValue(key);
                });
            } else {
                banner.found = false;
                banner.html = element.innerHTML;
            }

            return {
                wrapper: wrapper,
                banner: banner
            };
        });
    }
};
