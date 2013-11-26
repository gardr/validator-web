var parseCSS = require('css-parse');

function validateRules(harvested, report, next){

    next();
}


/*
    max 100kb gzipped
*/

module.exports = {
    validate: function (harvested, report, next) {
        if (harvested && harvested.har){
            validateRules(harvested, report, next);
        } else {
            next();
        }
    }
};
