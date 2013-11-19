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

        result.pasties_manager_data = api.evaluate(function(){
            if (!window.__manager) return;
            var pos = window.__manager.items.phantom;
            return {
                frameInput: pos.getData(),
                frameOutput: pos.input
            };
        });

        api.switchToIframe();
        result.pasties_position_css = api.evaluate(function(){
            var KEYS = ['height', 'width', 'position', 'left', 'right', 'top', 'bottom', 'z-index', 'display', 'visability'];
            // wrapper element
            var element = document.getElementById('PASTIES');
            var computedStyle = window.getComputedStyle(element);

            var wrapperElement = {css: {}};
            KEYS.forEach(function(key){
                wrapperElement.css[key] = computedStyle.getPropertyValue(key);
            });

            var firstChild = {css: {}};
            element = element.querySelector('div');
            if (element){
                firstChild.name = element.tagName;
                computedStyle = window.getComputedStyle(element);
                KEYS.forEach(function(key){
                    firstChild.css[key] = computedStyle.getPropertyValue(key);
                });
            }

            return {
                wrapperElement: wrapperElement,
                firstChild: firstChild
            };
        });
    }
};
