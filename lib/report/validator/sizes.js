// jquery_version


function validate(harvested, report, next, options){

    var hasJquery = !!harvested.jquery_version;

    /*options:
    {
      hooks: [ ],
      validators: { },
      pageRunTime: 10000,
      parentUrl: '/Users/sverosak/Code/git/pasties-validator-web/lib/report/resources/parent.html',
      managerScriptPath: '/Users/sverosak/Code/git/pasties-validator-web/node_modules/pasties-js/target/pasties-js/js/pasties/mobile.js',
      iframeUrl: '/Users/sverosak/Code/git/pasties-validator-web/node_modules/pasties-js/target/pasties-js/html/pasties/mobile.htm',
      managerInitPath: '/Users/sverosak/Code/git/pasties-validator-web/lib/report/resources/manager.js',
      id: 'f57bb9ba-8212-4f96-93c1-1c8ab53f0782',
      scriptUrl: 'http://localhost:8000/fixtures/script1.js',
      target: 'mobile',
      outputDirectory: '/var/folders/5g/qy5_sfqn31dcrgsmfff8qb_mnyzrnb/T/f57bb9ba-8212-4f96-93c1-1c8ab53f0782',
      validatorBase: '/Users/sverosak/Code/git/pasties-validator',
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


    var summary = harvested.rawFileDataSummary;
    if (summary){

        if (summary.total.size > sizeThresholdBytes){
            report.error('Total payload size '+summary.total.size+' bytes is to high, '+thresholdBytes+' bytes is the maximum for '+options.target);
        } else {
            report.info('Total payload size '+summary.total.size+' is verified and within the limit of '+thresholdBytes+'.');
        }

        if (summary.typed.types.script){
            var scripts = getTraceOfTypes(summary.typed.types.script);
            if (scripts.trace.length > 2){
                report.warn('Please do not use ('+scripts.trace.length+') more than maximum 2 external javascript files', scripts);
            }
        }

        if (summary.total.requestErrors > 0){
            report.warn('There are '+ summary.total.requestErrors +' request error'+(summary.total.requestErrors>1 ? 's' : ''), getTraceOfTypes(summary.typed.types.errors));
        }

    } else {
        report.info('Missing file data summary');
    }




    /*
    harvest:
    "rawFileData": {
      "http://localhost:8000/fixtures/script1.js?": {
        "url": "http://localhost:8000/fixtures/script1.js?",
        "redirects": [],
        "contentType": "application/javascript",
        "contentLength": "991",
        "bodyLength": 991,
        "compressed": false,
        "unzippedSize": 991,
        "aproxCompressionPossible": 498,
        "aproxCompressedSize": 493
      },
      "http://code.jquery.com/jquery-1.10.1.js": {
        "url": "http://code.jquery.com/jquery-1.10.1.js",
        "redirects": [],
        "contentType": "application/x-javascript; charset=utf-8",
        "bodyLength": 99449,
        "compressed": true,
        "unzippedSize": 274080,
        "aproxCompressionPossible": 192611,
        "aproxCompressedSize": 81469
      }
    },

    // Summary:
    "rawFileDataSummary": {
      "total": {
        "redirects": 0,
        "rawRequests": 2,
        "requests": 2,
        "size": 100440,
        "fullSize": 275071
      },
      "tips": {
        "possibleCompressTarget": 81962,
        "possibleCompressImprovement": 193109,
        "possibleCompressWithOnlyScriptGzip": 81962
      }
      ....
    },

    */


    next();
}


module.exports = {
    validate: function (harvested, report, next, options) {
        if (harvested) {
            validate.apply(this, Array.prototype.slice.call(arguments));
        } else {
            next();
        }
    }
};
