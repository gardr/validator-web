var referee = require('referee');
var assert = referee.assert;
var refute = referee.refute;

var validator = require('../../lib/report/validator/codeUsage.js');
var help = require('../lib/validateHelpers.js');


describe('Static code inspection / code usages', function(){


    it('should report on geolocation usage', function(done){


        var harvested = {
            frameScriptTags: ['var nav = navigator; nav.geolocation'],
            frameScriptAttributes: [
                {'matches': [{key: 'onclick', value: 'window.open("url", "new_window")'}], tag: 'dummy'},
                {'matches': [{key: 'onchange', value: 'navigator.geolocation;'}], tag: 'dummy'}
            ],
            rawFileData: {
                "http://localhost:8000/fixtures/script1.js?": {
                    "url": "http://localhost:8000/fixtures/script1.js?",
                    "redirects": [],
                    "contentType": "application/javascript",
                    "bodyLength": 493,
                    "compressed": true,
                    "base64Content": new Buffer("var nav=navigator; nav.geolocation; nav['geolocation']").toString('base64'),
                    "unzippedSize": 991,
                    "aproxCompressionPossible": 498,
                    "aproxCompressedSize": 493
                },
                "http://code.jquery.com/jquery-1.10.1.js": {
                    "url": "http://code.jquery.com/jquery-1.10.1.js",
                    "requestError": true,
                    "error": {
                        "code": "ENOTFOUND",
                        "errno": "ENOTFOUND",
                        "syscall": "getaddrinfo"
                    }
                }
            }
        };
        var reporter = help.createReporter.call(this);

        validator.validate(harvested, reporter, handler, {});

        function handler(){

            var result = reporter.getResult();

            assert.equals(result.error.length, 4, 'should report on geolocation usage');

            done();
        }
    });
});
