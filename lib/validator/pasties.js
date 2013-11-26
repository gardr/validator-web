function validateWrapper(wrapper, report) {
    if (wrapper.css.position !== 'static' || wrapper.css.visability !== '') {
        report.error('Do not style outside bannercontainer, wrapper element has received som styling');
    }
}

function validateBannerCSS(banner, data, report) {
    var pastieSize = data ? ('Pasties reported size width ' + data.frameOutput.width + ' x height ' + data.frameOutput.height) : '';

    if (banner.found === false) {
        report.warn('Bannercontainer not found/identified. ' + pastieSize);
        return;
    }

    if (banner.name) {
        var css = banner.css;

        report.info('Bannercontainer found/identified, size width ' + css.width + ' x height ' + css.height + '. ' + pastieSize);

        if (css.height !== "225px") {
            report.error('Bannercontainer needs to be 225 high. Currently it is ' + css.height);
        }

        // should be viewport width
        if (css.width !== '980px'){
            report.error('Bannercontainer should use 100% width. Currently it is ' + css.width);
        }

        if (css.display !== 'block'){
            report.error('Bannercontainer should use display:block. Currently it is ' + css.display);
        }

        if (css.position !== 'static') {
            report.error('Bannercontainer should have position: "static", but instead it has position: "' + css.position + '". Please use a inner container if position "relative" or "absolute" is needed.');
        }
    }
}


var RE_WINDOW_OPEN = /.*(window\.open\()+(.*)(new_window)+/gmi;
function validateBannerDom(banner, data, report){
    if (banner.found === false) {
        return;
    }

    if (!banner.clickHandler || banner.clickHandler === ''){
        report.error('Missing clickhandler on banner html element ' + banner.name);
    } else if (banner.clickHandler){
        var matches = banner.clickHandler.match(RE_WINDOW_OPEN);
        if (!matches){
            report.error('Missing onclick handler on banner wrapper element');
        }
    }
}

function validateRules(harvested, report, next) {

    var domData = harvested.pastiesDom;
    if (domData) {
        validateWrapper(domData.wrapper, report);
        validateBannerCSS(domData.banner, harvested.pastiesData, report);
        validateBannerDom(domData.banner, harvested.pastiesData, report);
    }

    next();
}

module.exports = {
    validate: function (harvested, report, next) {
        if (harvested) {
            validateRules(harvested, report, next);
        } else {
            next();
        }
    }
};
