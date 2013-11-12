var buster = require('buster-assertions');
var assert = buster.assert;
var refute = buster.refute;
var help = require('../lib/validateHelpers.js');

var hook = require('../../lib/hook/pasties.js');

describe('Pasties hooks', function () {

    it('should store probes', function () {

        var options = {
            'key': Math.random() * 1000 * Date.now()
        };
        var str_options = JSON.stringify(options);
        var calls = 0;
        var arg;
        var injected = [];
        var api = {
            injectLocalJs: function (str) {
                injected.push(str);
            },
            getOptions: function () {
                return options;
            },
            evaluate: function (fn, _opt) {
                arg = _opt;
                global.window = {
                    initManager: function () {
                        calls++;
                    }
                };
                calls++;
                res = fn();
                global.window = null;
                return res;
            }
        };

        hook.onPageOpen(api);

        assert.equals(calls, 2);
        assert(arg, 'should have collected initManager argument');
        assert.equals(arg, str_options);
    });

});

var validator = require('../../lib/validator/pasties.js');
describe('Pasties validator', function () {

    it('should call next', function (done) {
        validator.validate(null, null, done);
    });

});
