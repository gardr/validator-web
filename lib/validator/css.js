function validateRules(harvested, report, next){

    if (harvested['pasties_position_css']){
        var wrapCSS = harvested['pasties_position_css'].wrapperElement;
        var bannerCSS = harvested['pasties_position_css'].firstChild;

        if (wrapCSS.css.position !== 'static' || wrapCSS.css.visability !== ''){
            report.error('Do not style outside bannercontainer');
        }

        var pastiesReport = harvested.pasties_manager_data ? ('Pasties reported size width '+harvested.pasties_manager_data.frameOutput.width + ' x height ' + harvested.pasties_manager_data.frameOutput.height) : '';
        if (bannerCSS.found === false){
            report.warn('Bannercontainer not found/identified. '+pastiesReport);
        } else if (bannerCSS.found === true && bannerCSS.name) {
            report.info('Bannercontainer found/identified, size width ' + bannerCSS.css.width + ' x height ' + bannerCSS.css.height +'. '+pastiesReport);
        }

        if (bannerCSS.found && bannerCSS.css.position !== 'static'){
            report.error('Bannercontainer should have position: "static", but instead it has position: "'+bannerCSS.css.position+'". Please use a inner container if position "relative" or "absolute" is needed.', {});
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
