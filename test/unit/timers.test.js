var buster = require('buster-assertions');
var assert = buster.assert;
var refute = buster.refute;

var hooks  = require('../../lib/hook/timers.js');
var timers = require('../../lib/validator/timers.js');
var validate = require('../../../validator/lib/validate.js');
var HOOKS = require('../../../validator/lib/phantom/createHooks.js').HOOKS;

function getTraceObject(name) {
    return {
        name: name+'',
        time: Date.now(),
        trace: {
            sourceURL: 'http://dummyfile.js',
            line: '123'
        }
    };
}

function createReporter(){
    return validate.createReportHelper({})(this.test.title);
}

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
                    [getTraceObject(1)]
                ]
            }
        };

        var reporter = createReporter.call(this);

        timers.validate(harvested, reporter, function () {
            assert(reporter.getResult().error.length === 0);
            done();
        });

    });

    it('should generate an error', function (done) {
        var harvested = {
            'timers': {
                setTimeout: [
                    [getTraceObject(1), getTraceObject(2), getTraceObject(3), getTraceObject(4)]
                ]
            }
        };

        var reporter = createReporter.call(this);

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
                    [getTraceObject(1), getTraceObject(2), getTraceObject(3), getTraceObject(4)]
                ],
                setInterval: [
                    [getTraceObject(5), getTraceObject(6), getTraceObject(7), getTraceObject(8)]
                ]
            }
        };

        var reporter = createReporter.call(this);

        timers.validate(harvested, reporter, function () {
            assert(reporter.getResult().error.length === 2);
            done();
        });

    });
});
