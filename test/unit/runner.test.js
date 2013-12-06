var buster = require('buster-assertions');
var assert = buster.assert;
var refute = buster.refute;

var proxyquire = require('proxyquire');

// phantom smoke test

var runner = proxyquire('../../lib/report/index.js', {
    'gardr-validator': function (options, callback) {
        // test just want the options for verifying the actual option-object
        callback(null, options);
    }
});

describe('getReport', function () {

    it('calling runner without scriptUrl should return an error', function(done){
        runner(null, function(err, result){
            assert(err);
            done();
        });
    });

    it('calling runner should work, and return options as expected', function(done){
        var scriptUrl = 'id_'+Math.round(Math.random()*100012391023);

        runner({url: scriptUrl, id: 'asd'}, function(err, options){
            refute(err);
            assert.isObject(options);
            assert.isString(options.scriptUrl);
            assert.equals(options.scriptUrl, scriptUrl);
            assert(options.parentUrl.indexOf(process.cwd()) !== -1, 'smoketest file path resolving');
            done();
        });
    });
});
