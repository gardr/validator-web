function validateRules(harvested){

}

module.exports = {
    validate: function (harvested, report, next) {
        if (harvested && harvested.har_input){
            validateRules();
            next();
        } else {
            next();
        }
    }
};
