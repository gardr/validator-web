var buster = require('buster-assertions');
var assert = buster.assert;
var refute = buster.refute;

var help    = require('../lib/validateHelpers.js');

var HOOKS   = require('pasties-validator/lib/phantom/createHooks.js').HOOKS;
var hooks   = require('../../lib/report/hook/timers.js');
var timers  = require('../../lib/report/validator/timers.js');


describe('timers hooks', function(){

    it('should return an object', function(){
        assert.isObject(hooks);
    });

    it('should only use hooks that exist', function(){
        Object.keys(hooks).forEach(function(hookKey){
            assert(HOOKS.indexOf(hookKey) !== -1, hookKey + ' is not Valid');
        });
    });

});

describe('timers validator', function () {

    it('should not return error when one event fired', function (done) {
        var harvested = {
            'timers': {
                setTimeout: [
                    [help.getTraceObject(1)]
                ]
            }
        };

        var reporter = help.createReporter.call(this);

        timers.validate(harvested, reporter, function () {
            assert(reporter.getResult().error.length === 0);
            done();
        });

    });

    it('should generate an error', function (done) {
        var harvested = {
            'timers': {
                setTimeout: [
                    [help.getTraceObject(1), help.getTraceObject(2), help.getTraceObject(3), help.getTraceObject(4)]
                ]
            }
        };

        var reporter = help.createReporter.call(this);

        timers.validate(harvested, reporter, function () {
            var result = reporter.getResult();
            assert(result.error.length === 1);
            var errorObject = result.error[0];
            assert.isString(errorObject.message);
            done();
        });

    });

    it('should generate multiple errors', function (done) {
        var harvested = {
            'timers': {
                setTimeout: [
                    [help.getTraceObject(1), help.getTraceObject(2), help.getTraceObject(3), help.getTraceObject(4)]
                ],
                setInterval: [
                    [help.getTraceObject(5), help.getTraceObject(6), help.getTraceObject(7), help.getTraceObject(8)]
                ]
            }
        };

        var reporter = help.createReporter.call(this);

        timers.validate(harvested, reporter, function () {
            assert(reporter.getResult().error.length === 2);
            done();
        });

    });
});
