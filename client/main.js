var ace = require('brace');
require('brace/mode/javascript');
require('brace/mode/css');
require('brace/mode/html');
require('brace/theme/solarized_dark');

var events = require('dom-events');
var domready = require('domready');

domready(function () {

    initRender();
    replayBanner();

    preview();

    initEditor('css', 'css-editor', 'ace/mode/css');
    initEditor('html', 'html-editor', 'ace/mode/html');
    initEditor('js', 'javascript-editor', 'ace/mode/javascript');
});

function initEditor(textareaId, editorId, mode) {
    var textarea = document.getElementById(textareaId);

    if (!textarea) {
        return;
    }

    var editor = ace.edit(editorId);

    editor.getSession().setMode(mode);
    editor.setTheme('ace/theme/solarized_dark');
    editor.setValue(textarea.value);
    textarea.style.display = 'none';
    editor.clearSelection();

    editor.on('blur', function (e) {
        textarea.value = editor.getValue();
    });

    return editor;
}

function preview() {

    var url = window.previewUrl;
    var name = 'preview';
    if (!url) return;

    var m = global.getManager({
        iframeUrl: './preview/html/pasties/mobile.htm'
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
        iframeUrl: './preview/html/pasties/mobile.htm'
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

function replayBanner() {
    var next = document.getElementById('screenshot-next');
    var prev = document.getElementById('screenshot-prev');
    var play = document.getElementById('screenshot-play');

    if (!next || !prev || !play){
        return;
    }

    var screenshots = Array.prototype.slice.call(document.getElementsByClassName('screenshot'));

    var nextHandler = handler(function (index, len) {
        return index + 1;
    });
    var prevHandler = handler(function (index, len) {
        return index - 1;
    });

    events.on(next, 'click', nextHandler);
    events.on(prev, 'click', prevHandler);
    events.on(play, 'click', start);

    var interval;

    function start() {
        if (interval) {
            interval = clearInterval(interval);
            return;
        }
        interval = setInterval(nextHandler, 1000);
    }

    function handler(fn) {
        return function () {
            screenshots.some(go(fn));
        };
    }

    function go(indexFn) {
        return function shiftActive(elem, index, list) {
            if (elem.className.indexOf('active') > -1) {
                elem.className = elem.className.replace('active', '');
                var newElem = list[indexFn(index, list.length)];
                if (!newElem) {
                    newElem = list[0];
                }
                newElem.className = newElem.className += ' active';
                return true;
            }
        };
    }
}
