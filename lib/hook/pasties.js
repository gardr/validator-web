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

            var element = document.getElementById('PASTIES');
            var computedStyle = window.getComputedStyle(element);

            var res = {};
            ['height', 'width', 'position', 'left', 'right', 'top', 'bottom', 'z-index', 'display', 'visability'].forEach(function(key){
                res[key] = computedStyle.getPropertyValue(key);
            });

            return {
                computedStyle: res
            };
        });
    }
};
