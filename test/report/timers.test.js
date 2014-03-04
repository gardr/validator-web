var referee = require('referee');
var assert = referee.assert;
var refute = referee.refute;

var help    = require('../lib/validateHelpers.js');

var HOOKS   = require('gardr-validator/lib/phantom/createHooks.js').HOOKS;
var hooks   = require('../../lib/report/hook/timers.js');
var timers  = require('../../lib/report/validator/timers.js');

function getTraceList(targetNum, i){
    var res = [];
    if (typeof i === 'undefined'){
        i = 0;
    } else {
        targetNum = i + targetNum;
    }

    for(;i<=targetNum; i++){
        res.push(help.getTraceObject(i+1));
    }

    return res;
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
                    [help.getTraceObject(1)]
                ]
            }
        };

        var reporter = help.createReporter.call(this);

        timers.validate(harvested, reporter, function () {
            assert.equals(reporter.getResult().error.length, 0);
            done();
        });

    });

    it('should generate an error', function (done) {
        var harvested = {
            'timers': {
                setTimeout: [
                    getTraceList(21)
                ]
            }
        };

        var reporter = help.createReporter.call(this);

        timers.validate(harvested, reporter, function () {
            var result = reporter.getResult();
            assert.equals(result.error.length, 1);
            var errorObject = result.error[0];
            assert.isString(errorObject.message);
            done();
        });

    });

    it('should generate multiple errors', function (done) {
        var harvested = {
            'timers': {
                setTimeout: [
                    getTraceList(21)
                ],
                setInterval: [
                    getTraceList(5, 21)
                ]
            }
        };

        var reporter = help.createReporter.call(this);

        timers.validate(harvested, reporter, function () {
            assert.equals(reporter.getResult().error.length, 2);
            done();
        });

    });
});
