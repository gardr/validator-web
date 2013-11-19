var events = require('dom-events');
var domready = require('domready');

domready(function () {
    
    initValidate();

    initRender();
});

function initValidate(){
    var button = document.getElementById('start-validation');
    var input = document.getElementById('urlInput');

    function handler(){
        //console.log('start validation');
        window.location = '/validate?url='+window.encodeURIComponent(input.value);
    }

    events.on(button, 'click', handler);
}

function initRender() {
    var button = document.getElementById('render');
    var input = document.getElementById('urlInput');
    var manager = global.getManager({
        iframeUrl: '/preview/html/pasties/mobile.htm'
    });

    var counter = 0;

    function handler(event) {
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
    }

    events.on(button, 'click', handler);
}