var log = require('./logger.js');
var cssParser = require('css-parse');
var htmlparser = require('htmlparser2');
var soupselect = require('soupselect');
var select = soupselect.select;
var toHtml = require('htmlparser-to-html');

function _escape(v) {
    return v.replace(/(\r\n|\n|\r)/gm, '\\n').replace(/'/gmi, "\\'");
}

function getUrl(value) {
    // trim away url('')
    return value.split('url(').map(function (url) {
        url = url.replace(/\"|\'/gm, '');
        return url.substring(0, url.indexOf(')'));
    }).filter(Boolean);
}

function filterUrl(value) {
    return !!value && value.indexOf('url(') > -1;
}

var REG_EXP_ABS_URL = /^(\/\/|http)/i;
function fixHtml(base, html) {
    return rewriteHtml(html, function (url) {
        if (REG_EXP_ABS_URL.test(url) !== true) {
            url = base + url;
        }
        // resolve protocol relative
        if (url.indexOf('//') === 0) {
            url = 'http:' + url;
        }
        return url;
    });
}

function rewriteHtml(str, resourceUrlHandler) {
    var output = {
        content: '',
        style: '',
        script: '',
        full: ''
    };
    var handler = new htmlparser.DomHandler(function (err, dom) {
        if (err) {
            log.error('Failed parsing html input', err);
            return;
        }

        var alreadyProcessed = [];
        function processUnique(cb){
            return function(elem){
                if (alreadyProcessed.indexOf(elem) === -1){
                    cb(elem);
                    alreadyProcessed.push(elem);
                }
            };
        }

        var scriptUniqueHandler = processUnique(function (scriptTag) {
            if (scriptTag.attribs && scriptTag.attribs.src) {
                if (resourceUrlHandler) {
                    scriptTag.attribs.src = resourceUrlHandler(scriptTag.attribs.src);
                }
                output.content += toHtml(scriptTag);
            } else {
                output.script += toHtml(scriptTag.children);
            }
            alreadyProcessed.push(scriptTag);
        });

        var head = select(dom, 'head')[0];
        if (head) {
            select(head, 'link').forEach(processUnique(function (linkTag) {
                if (resourceUrlHandler) {
                    linkTag.attribs.href = resourceUrlHandler(linkTag.attribs.href);
                }
                output.content += toHtml(linkTag);
            }));

            select(head, 'style').forEach(processUnique(function (styleTag) {
                output.style += toHtml(styleTag.children);
            }));

            select(head, 'script').forEach(scriptUniqueHandler);
        }

        select(dom, 'img').forEach(function (imgTag) {
            if (resourceUrlHandler) {
                imgTag.attribs.src = resourceUrlHandler(imgTag.attribs.src);
            }
        });

        select(dom, 'script').forEach(scriptUniqueHandler);

        select(dom, '[style]').forEach(function (tag) {
            var style = tag.attribs.style;

            function replaceHandler(url) {
                var newUrl = resourceUrlHandler(url);
                if (url !== newUrl) {
                    tag.attribs.style = tag.attribs.style.replace(url, newUrl);
                }
            }

            if (resourceUrlHandler && style) {
                // url()
                var result;
                try {
                    result = cssParser('#DUMMY{' + style + '}');
                    result.stylesheet.rules[0].declarations.map(function (v) {
                        return v.value;
                    }).filter(filterUrl).map(getUrl).forEach(function (url) {
                        if (Array.isArray(url)) {
                            url.forEach(replaceHandler);
                        } else {
                            replaceHandler(url);
                        }
                    });
                } catch (e) {
                    //log.info('Failed parsing CSS:', e);
                }
            }
        });

        var body = select(dom, 'body')[0];
        if (body) {
            output.content += toHtml(body.children);
        } else {
            output.content += toHtml(dom);
        }

        // output document with rewritten urls
        output.full = toHtml(dom);
    });

    new htmlparser.Parser(handler).parseComplete(str);

    return {
        'content': output.content && _escape(output.content),
        'style': output.style,
        'script': output.script,
        'full': output.full
    };
}

module.exports = {
    fix: fixHtml,
    rewriteHtml: rewriteHtml
};
