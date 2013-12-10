var esprima = require('esprima');
var estraverse = require('estraverse');

// navigator.geolocation
function validate(harvested, report, next, options) {

    var illegalIdentifiers = ['geolocation'];

    function analyze(content) {
        var ast = esprima.parse(content, {loc: true});
        estraverse.traverse(ast, {
            enter: function (node, parent) {
                //console.log(node.type, node.name);
                if (node.type === 'Identifier' && parent.type === 'MemberExpression' && illegalIdentifiers.indexOf(node.name)>-1) {
                    //console.log('Identifier', node.name, parent.object.name);
                    report.error('Please do not use geolocation api');
                } else
                if (node.type === 'Literal' &&  illegalIdentifiers.indexOf(node.value)>-1){
                    //console.log('Identifier', node.name, parent.object.name, node);
                    report.error('Please do not use the geolocation api');
                }
            }
        });
    }


    if (harvested.frameScriptTags) {
        harvested.frameScriptTags.forEach(analyze);
    }

    if (harvested.frameScriptAttributes){
        harvested.frameScriptAttributes.forEach(analyze);
    }

    if (harvested.rawFileData){
        Object.keys(harvested.rawFileData).forEach(function(key){
            var v = harvested.rawFileData[key];
            if (v && !v.requestError && v.contentType && v.contentType.indexOf('javascritp') && v.base64Content ){
                analyze(new Buffer(v.base64Content, 'base64').toString('utf8'));
            }
        });
    }

    next();
}

module.exports = {
    validate: validate
};