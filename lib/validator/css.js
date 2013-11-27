var parseCSS = require('css-parse');


var RE_VALID_FIRST_SELECTOR = /^[#|\.]{1}/;
function validateRules(harvested, report, next){
    //console.log('validateRules CSS', harvested.frameStyles);
    if (harvested.frameStyles && harvested.frameStyles.length > 0){
        harvested.frameStyles.forEach(function(styleContent, index){
            var parsed = parseCSS(styleContent);
            if (parsed && parsed.stylesheet && parsed.stylesheet.rules){
                var errors = parsed.stylesheet.rules.filter(function(rule){
                    //console.log(rule);
                    if (rule && rule.selectors && !rule.selectors[0].match(RE_VALID_FIRST_SELECTOR)){
                        report.error('Styling from style-tag without class or ID prefix found: \"'+rule.selectors.join(' ') +'\"');
                    }
                });
            }
        });
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

        if (harvested){
            validateRules(harvested, report, next);
        } else {
            next();
        }
    }
};
