var ace = require('brace');
require('brace/mode/javascript');
require('brace/mode/css');
require('brace/mode/html');
require('brace/theme/solarized_dark');

var events = require('dom-events');
var domready = require('domready');

domready(function () {

    initRender();


    preview();

    initEditor('css', 'css-editor', 'ace/mode/css');
    initEditor('html', 'html-editor', 'ace/mode/html');
    initEditor('js', 'javascript-editor', 'ace/mode/javascript');
});

function initEditor(textareaId, editorId, mode){
    var textarea = document.getElementById(textareaId);

    if (!textarea){
        return;
    }

    var editor = ace.edit(editorId);

    editor.getSession().setMode(mode);
    editor.setTheme('ace/theme/solarized_dark');
    editor.setValue(textarea.value);
    textarea.style.display = 'none';
    editor.clearSelection();

    editor.on('blur', function(e){
       textarea.value = editor.getValue();
    });

    return editor;
}

function preview() {

    var url = window.previewUrl;
    var name = 'preview';
    if (!url) return;

    var m = global.getManager({
        iframeUrl: '/preview/html/pasties/mobile.htm'
    });
    m.queue({
        name: name,
        url: url,
        container: 'preview-container'
    });
    m.render(name, function (err, res) {
        console.log('done', name, err, res);
    });
}

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
