var buster = require('buster-assertions');
var assert = buster.assert;
var refute = buster.refute;

var proxyquire = require('proxyquire');

var help = require('../lib/validateHelpers.js');
var hook = require('../../lib/hook/jquery.js');

describe('jQuery hook', function () {

    it('should call wrap', function () {

        var calls = 0;
        var api = {
            wrap: function () {
                calls++;
            }
        };

        hook.onResourceReceived({
            url: 'someUrl',
            stage: 'end'
        }, api);

        assert.equals(calls, 0);

        hook.onResourceReceived({
            url: 'jquery.js',
            stage: 'start'
        }, api);

        assert.equals(calls, 0);

        hook.onResourceReceived({
            url: 'jquery.js',
            stage: 'end'
        }, api);

        assert.equals(calls, 1);

        hook.onResourceReceived({
            url: 'jquery.js',
            stage: 'end'
        }, api);

        assert.equals(calls, 1, 'should only wrap once');
    });

    it('should collect wrapped and jquery version', function () {

        var calls = 0;
        var result = {};
        var key = '12345'+Math.random()+Date.now();
        var apiShim = {
            switchToIframe: function () {
                calls++;
            },
            getResultObject: function () {
                return result;
            },
            evaluate: function (fn) {
                global.window = {jQuery: {fn: {jquery: key}}};
                calls++;
                var result = fn();
                global.window = undefined;
                return result;
            }
        };

        hook.onBeforeExit(apiShim);

        assert.equals(calls, 2);
        assert.equals(result.jquery_version, key);

    });

});

describe('jQuery validator', function () {

    it('should report error if animate called', function (done) {
        var validator = require('../../lib/validator/jquery.js');

        var harvested = {
            jquery_animate: [
                [help.getTraceObject(1), help.getTraceObject(2), help.getTraceObject(3)],
                [help.getTraceObject(4), help.getTraceObject(5), help.getTraceObject(6)]
            ]
        };

        var report = help.createReporter.call(this);

        validator.validate(harvested, report, function () {
            var result = report.getResult();
            assert.equals(result.error.length, 2);
            done();
        });

    });

    function shimLatest(cb) {
        cb([{ major: 1, minor: 10, patch: 2, sortKey: 11002},
            { major: 2, minor: 0,  patch: 3, sortKey: 20003}
           ]);
    }

    it('should report error when version doesnt match latest', function (done) {
        var harvested = {
            jquery_version: "1.10.1"
        };

        var report = help.createReporter.call(this);

        var validator = proxyquire('../../lib/validator/jquery.js', {
            './getLatestJquery.js': {
                'getLatest': shimLatest
            }
        });

        // TODO this is doing actual request, neeed to unit test instead
        validator.validate(harvested, report, function () {
            var result = report.getResult();
            assert.equals(result.error.length, 1);
            done();
        });

    });

});
