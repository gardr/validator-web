var ace = require('brace');
require('brace/mode/javascript');
require('brace/mode/css');
require('brace/mode/html');
require('brace/theme/solarized_dark');

var domready = require('domready');


domready(function () {
    initEditor('html', 'html-editor', 'ace/mode/html');
    initEditor('css', 'css-editor', 'ace/mode/css');
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
