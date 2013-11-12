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

    }
};
