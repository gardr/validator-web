function validate(harvested, report, next, options){

    var hasJquery = !!harvested.jquery && harvested.jquery.version;

    /*options:
    {
      hooks: [ ],
      validators: { },
      pageRunTime: 10000,
      parentUrl: '/Users/sverosak/Code/git/gardr-validator-web/lib/report/resources/parent.html',
      managerScriptPath: '/Users/sverosak/Code/git/gardr-validator-web/node_modules/gardr-js/target/gardr-js/js/gardr/mobile.js',
      iframeUrl: '/Users/sverosak/Code/git/gardr-validator-web/node_modules/gardr-js/target/gardr-js/html/gardr/mobile.htm',
      managerInitPath: '/Users/sverosak/Code/git/gardr-validator-web/lib/report/resources/manager.js',
      id: 'f57bb9ba-8212-4f96-93c1-1c8ab53f0782',
      scriptUrl: 'http://localhost:8000/fixtures/script1.js',
      target: 'mobile',
      outputDirectory: '/var/folders/5g/qy5_sfqn31dcrgsmfff8qb_mnyzrnb/T/f57bb9ba-8212-4f96-93c1-1c8ab53f0782',
      validatorBase: '/Users/sverosak/Code/git/gardr-validator',
      validatorFiles: [ ]
    }
    */

    // full jquery 1.10.1 e.g.
    // - 99449 / 99502
    // min: 37 / 90
    // full: 97,5 / 268

    var thresholdBytes = (options.target === 'tablet' ? 100000 : 50000);
    //sizeThresholdBytes is actual threshold
    var sizeThresholdBytes = thresholdBytes;

    // give threshold more bytes if jquery is present
    var JQUERY_GZIP_MINIFIED = 37500;
    if (hasJquery){
        sizeThresholdBytes += JQUERY_GZIP_MINIFIED;
    }

    function getTraceOfTypes(obj){
        return {trace: Object.keys(obj).map(function(str){return {'sourceURL': str};})};
    }


    var summary = harvested.har.rawFileDataSummary;
    if (summary){

        if (summary.total.size === 0 || summary.total.size < 100){
            report.error('Total payload size ('+summary.total.size+') is zero or close to zero to be able to serve a valid banner/displayad.');
        } else if (summary.total.size > sizeThresholdBytes){
            report.error('Total payload size '+summary.total.size+' bytes is to high, '+thresholdBytes+' bytes is the maximum for '+options.target);
        } else {
            report.info('Total payload size '+summary.total.size+' is verified and within the limit of '+thresholdBytes+'.');
        }

        if (summary.typed && summary.typed.types && summary.typed.types.script){
            var scripts = getTraceOfTypes(summary.typed.types.script);
            if (scripts.trace.length > 2){
                report.warn('Please do not use ('+scripts.trace.length+') more than maximum 2 external javascript files', scripts);
            }
        }

        if (summary.typed && summary.typed.types && summary.typed.types.style){
            var styles = getTraceOfTypes(summary.typed.types.style);
            if (styles.trace.length > 0){
                report.error('Please do not use ('+styles.trace.length+') more than maximum 0 external CSS files', styles);
            }
        }

        if (summary.total.requestErrors > 0){
            report.error('There are '+ summary.total.requestErrors +' request error'+(summary.total.requestErrors>1 ? 's' : ''), getTraceOfTypes(summary.typed.types.errors));
        }

    } else {
        report.info('Missing file data summary');
    }

    next();
}

module.exports = {
    dependencies: ['har', 'jquery'],
    validate: function (harvested, report, next, options) {
        if (harvested) {
            validate.apply(this, Array.prototype.slice.call(arguments));
        } else {
            next();
        }
    }
};
