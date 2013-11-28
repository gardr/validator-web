var htmlparser = require('htmlparser2');
var soupselect = require('soupselect');
var select = soupselect.select;
var toHtml = require('htmlparser-to-html');

function _escape(v){
    return v.replace(/(\r\n|\n|\r)/gm, '\\n').replace(/'/gmi, "\\'");
}


module.exports = function (str) {
    var output = {
        content: '',
        style: '',
        script: ''
    };
    var handler = new htmlparser.DomHandler(function(err, dom) {
        if (err){
            log.error('Failed parsing html input', err);
            return;
        }
        var body = select(dom, 'body')[0];
        if (body){
            output.content = toHtml(body.children);
        } else {
            output.content = toHtml(dom);
        }


        var head = select(dom, 'head')[0];
        if (head){

            select(head, 'link').forEach(function(styleTag){
                output.style += toHtml(styleTag.children);
            });

            select(head, 'style').forEach(function(styleTag){
                output.style += toHtml(styleTag.children);
            });

            select(head, 'script').forEach(function(scriptTag){
                if (scriptTag.src){
                    output.content += toHtml(scriptTag);
                } else {
                    output.script += toHtml(scriptTag.children);
                }
            });
        }
    });

    new htmlparser.Parser(handler).parseComplete(str);

    return {
        'content': output.content && _escape(output.content),// && _escape(output.body),
        'style': output.style,
        'script': output.script
    };
};