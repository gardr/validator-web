var events = require('dom-events');
var domready = require('domready');

domready(function () {

    initRender();
});

function initRender() {
    var button = document.getElementById('render');
    var input = document.getElementById('urlInput');

    if (!button || !input) {
        return;
    }

    var manager = global.getManager({
        iframeUrl: '/preview/html/pasties/mobile.htm'
    });

    var counter = 0;

    function handler(event) {
        event.preventDefault();
        var name = 'example_' + (counter++);
        //console.log(name);
        manager.queue({
            name: name,
            url: input.value,
            container: 'container'
        });
        manager.render(name, function (err, res) {
            console.log('done', name, err, res);
        });
        return false;
    }

    events.on(button, 'click', handler);
}
