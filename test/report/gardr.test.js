var referee = require('referee');
var assert = referee.assert;
var refute = referee.refute;
var help = require('../lib/validateHelpers.js');

var hook = require('../../lib/report/hook/gardr.js');

describe('Gardr hooks', function () {

    it('should store probes', function () {

        var options = {
            'key': Math.random() * 1000 * Date.now()
        };
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
        assert.equals(arg, JSON.stringify(options));
    });

});

var validator = require('../../lib/report/validator/gardr.js');

var defaultOptions = {
    width: 980,
    height: 225,
    options: {
        format: {
            height: 225
        }
    }
};

describe('Gardr validator', function () {

    it('should evaluate and return errors', function (done) {
        var harvest = {
            'gardr': {
                'dom': {
                    banner: {
                        name: 'DIV',
                        clickHandler: '',
                        found: true,
                        css: {
                            position: 'absolute',
                            height: '222px',
                            display: 'block',
                            width: '980px'
                        }
                    },
                    wrapper: {
                        css: {
                            position: 'relative',
                            visability: ''
                        }
                    }
                }
            },
            'actions': {}
        };

        var reporter = help.createReporter.call(this);

        validator.validate(harvest, reporter, function () {
            var result = reporter.getResult();

            assert.equals(result.error.length, 4);
            done();
        }, defaultOptions);

    });

    function getValid(clickHandler) {
        return {
            'gardr': {
                'dom': {
                    banner: {
                        name: 'DIV',
                        clickHandler: clickHandler,
                        found: true,
                        css: {
                            position: 'static',
                            height: '225px',
                            display: 'block',
                            width: '980px'
                        }
                    },
                    wrapper: {
                        css: {
                            position: 'static',
                            display: 'block',
                            visability: ''
                        }
                    }
                }
            },
            actions: {}
        };
    }

    it('should validate size based on options', function (done) {

        var harvest = getValid('function(){window.open(url, "new_window");}');
        var reporter = help.createReporter.call(this);
        var options = {
            width: 980,
            height: 225,
            options: {
                format: {
                    height: 400
                }
            }
        };

        validator.validate(harvest, reporter, function () {
            var result = reporter.getResult();
            assert.equals(result.error.length, 1, '400 is height format, other heights should throw error');
            done();
        }, options);

    });

    it('should error on missing clickhandler', function (done) {

        var harvest = getValid();

        var reporter = help.createReporter.call(this);

        validator.validate(harvest, reporter, function () {
            var result = reporter.getResult();

            assert.equals(result.error.length, 1);
            done();
        }, defaultOptions);

    });

    it('should pass on valid clickhandler', function (done) {

        var harvest = getValid('function(){window.open(url, "new_window");}');

        var reporter = help.createReporter.call(this);

        validator.validate(harvest, reporter, function () {
            var result = reporter.getResult();

            assert.equals(result.error.length, 0);
        }, defaultOptions);

        harvest = getValid('window.open(url, "new_window")');

        validator.validate(harvest, reporter, function () {
            var result = reporter.getResult();

            assert.equals(result.error.length, 0);
            done();
        }, defaultOptions);

    });

    it('should error on invalid ref', function (done) {

        var harvest = getValid('function(){open(url, "_blank");}');

        var reporter = help.createReporter.call(this);

        validator.validate(harvest, reporter, function () {
            var result = reporter.getResult();

            assert.equals(result.error.length, 1);
            done();
        }, defaultOptions);

    });

    it('should error on invalid window target', function (done) {

        var harvest = getValid('window.open(url, "_blank")');

        var reporter = help.createReporter.call(this);

        validator.validate(harvest, reporter, function () {
            var result = reporter.getResult();

            assert.equals(result.error.length, 1);
            done();
        }, defaultOptions);
    });

    it('should call next if missing data', function (done) {
        validator.validate(null, null, done, defaultOptions);
    });

});
