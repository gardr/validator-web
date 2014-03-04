var logger = require('../../logger.js');
var esprima = require('esprima');
var estraverse = require('estraverse');

// navigator.geolocation
function validate(harvested, report, next, options) {

    var illegalIdentifiers = ['geolocation'];

    function analyze(content, sourceURL) {
        var ast;
        var trace = {
            'trace': {
                'sourceURL': sourceURL
            }
        };

        try {
            ast = esprima.parse(content.toString(), {
                'loc': true,
                'tolerant': true
            });
        } catch (e) {
            logger.info('Failed parsing javascript content', {
                type: typeof content,
                error: e
            });
            report.error('Possible javascript malformed / SyntaxError', {
                trace: [
                    {
                        "line": e.lineNumber,
                        "column": e.column,
                        "index": e.index,
                        "sourceURL": sourceURL
                    }
                ]
            });
            return;
        }

        estraverse.traverse(ast, {
            enter: function (node, parent) {
                if (node.type === 'Identifier' && parent.type === 'MemberExpression' && illegalIdentifiers.indexOf(node.name) > -1) {
                    report.error('Please do not use geolocation api', trace);
                } else if (node.type === 'Literal' && illegalIdentifiers.indexOf(node.value) > -1) {
                    report.error('Please do not use the geolocation api', trace);
                }
            }
        });
    }

    if (harvested.script.tags) {
        harvested.script.tags.forEach(function (tag) {
            analyze(tag, options.scriptUrl);
        });
    }

    if (harvested.script.attributes) {
        harvested.script.attributes.forEach(function (data) {
            data.matches.forEach(function (match) {
                analyze(match.value, '(' + data.tag + ') ' + match.key + '-attribute');
            });
        });
    }

    if (harvested.har.rawFileData) {
        Object.keys(harvested.har.rawFileData).forEach(function (key) {
            var v = harvested.har.rawFileData[key];
            if (v && !v.requestError && v.contentType && v.contentType.indexOf('javascript') > -1 && v.base64Content) {
                analyze(new Buffer(v.base64Content, 'base64').toString('utf8'), v.url);
            }
        });
    }

    next();
}

module.exports = {
    dependencies: ['har', 'script'],
    validate: validate
};
