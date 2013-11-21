function validateRules(harvested, report, next){

    if (harvested['pasties_position_css']){
        var wrapCSS = harvested['pasties_position_css'].wrapperElement;
        var bannerCSS = harvested['pasties_position_css'].firstChild;

        if (wrapCSS.css.position !== 'static' || wrapCSS.css.visability !== ''){
            report.error('Do not style outside bannercontainer');
        }
        if (bannerCSS.found === false){
            report.warn('Bannercontainer not found/identified');
        } else if (bannerCSS.found === true && bannerCSS.name) {
            report.info('Bannercontainer found/identified');
        }
        if (bannerCSS.found && bannerCSS.css.position !== 'static'){
            report.error('Bannercontainer should have position: "static", but instead it has position: "'+bannerCSS.css.position+'". Please use a inner container if position relative or absolute is needed.', {});
        }
    }

    next();
}


/*
    225px høyde
*/

module.exports = {
    validate: function (harvested, report, next) {
        if (harvested && harvested.har_input){
            validateRules(harvested, report, next);
        } else {
            next();
        }
    }
};
