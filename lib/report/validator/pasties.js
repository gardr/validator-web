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

function findWindowOpenError(list){
    return list.filter(function(entry){return entry.target !== 'new_window';});
}

function windowOpenErrors(list, report){
    var errors = findWindowOpenError(list);
    if (errors && errors.length > 0) {
        var message = 'Window open called with wrong target, check url' + errors[0].url + ' and target ' + errors[0].target;
        report.error(message, {
            trace: errors.map(function (entry) {
                return entry.trace;
            })
        });
    }
    return errors.length === 0;
}


var RE_WINDOW_OPEN = /.*(window\.open\()+(.*)(new_window)+/gmi;
function validateBannerDom(banner, data, windowOpened, report){
    if (banner.found === false) {
        return;
    }

    if (banner.html && banner.html.indexOf('<iframe')>-1){
        report.warn('Please do not use iframes inside iframe, pasties iframe is your sandbox.');
    }



    if (windowOpened && windowOpened.length > 0){
        var noErrorsFound = windowOpenErrors(windowOpened, report);
        if (noErrorsFound){
            // if window open was registered and no errors found, we do not need to check for clickhandler.
            return;
        }
    }

    if (!banner.clickHandler || banner.clickHandler === ''){
        report.error('Missing clickhandler on banner html element/tag ' + banner.name + '.');
    } else if (banner.clickHandler){
        var matches = banner.clickHandler.match(RE_WINDOW_OPEN);
        if (!matches){
            report.error('Missing onclick handler on banner wrapper element, and no click registered in simulation.');
        }
    }
}

function valdiateTags(illegal, report){
    if (illegal && illegal.length > 0){
        report.warn('Found illegal tags/usages', {list: illegal.map(function(v){return v.html.join(',\n');})});
    }
}

function validateRules(harvested, report, next) {

    var domData = harvested.pastiesDom;
    if (domData) {
        validateWrapper(domData.wrapper, report);
        validateBannerCSS(domData.banner, harvested.pastiesData, report);
        validateBannerDom(domData.banner, harvested.pastiesData, harvested.windowOpened, report);
        valdiateTags(domData.illegal, report);
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
