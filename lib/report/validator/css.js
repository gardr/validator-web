var parseCSS = require('css-parse');

function formatCssStyle(v) {
    return '  ' + v.property + ': ' + v.value + '; \n';
}

function getCode(rule) {
    return rule.selectors.join(', ') + ' {\n' + rule.declarations.map(formatCssStyle).join('') + '}\n';
}

function hasSelectorViolation(rule) {
    return rule && rule.selectors && !rule.selectors[0].match(RE_VALID_FIRST_SELECTOR);
}

var RE_VALID_FIRST_SELECTOR = /^[#|\.]{1}/;

function reportErrorOnStyleContent(report) {
    return function (styleContent) {

        var parsed;

        try{
            parsed = parseCSS(styleContent);
        } catch(e){
            console.log('CSS parse error', e, styleContent);
        }

        if (!parsed || !parsed.stylesheet || !parsed.stylesheet.rules) {
            return;
        }
        parsed.stylesheet.rules.filter(function (rule) {
            if (hasSelectorViolation(rule)) {
                report.error('Styling from style-tag without class or ID prefix found: \"' + rule.selectors.join(', ') + '\"', {
                    'code': getCode(rule)
                });
            }
        });
    };
}

function validateRules(harvested, report, next) {
    //console.log('validateRules CSS', harvested.frameStyles);

    var handler = reportErrorOnStyleContent(report);

    if (Array.isArray(harvested.frameStyles)) {
        harvested.frameStyles.forEach(handler);
    }

    // harvested.HARFile
    // todo inspect remote files from har

    next();
}

/*
    max 100kb gzipped
*/

module.exports = {
    validate: function (harvested, report, next) {

        if (harvested) {
            validateRules(harvested, report, next);
        } else {
            next();
        }
    }
};
