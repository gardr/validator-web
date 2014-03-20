var referee = require('referee');
var assert = referee.assert;
var refute = referee.refute;

var proxyquire = require('proxyquire');

// phantom smoke test

var mockedRunner = proxyquire('../../lib/report/index.js', {
    'gardr-validator': function (options, callback) {
        // test just want the options for verifying the actual option-object
        callback(null, options);
    }
});

describe('getReport', function () {

    it('calling runner without scriptUrl should return an error', function (done) {
        mockedRunner(null, function (err, result) {
            assert(err);
            done();
        });
    });

    it('calling runner should work, and return options as expected', function (done) {

        var input = {
            'output': {
                'url': 'id_' + Math.round(Math.random() * 100012391023)
            },
            'options': {
                'target': 'mobile',
                'viewport': {
                    height: 123
                }
            },
            id: 'asd'
        };

        mockedRunner(input, function (err, options) {
            refute(err, 'should not return error');
            assert.isObject(options);
            assert.isString(options.scriptUrl);
            assert.equals(options.scriptUrl, input.output.url);
            assert.equals(options.height, 123);
            done();
        });
    });

    var runner = require('../../lib/report/index.js');

    it('should work to run', function(done){
        this.timeout(3000);
        var options = {
            output: {
                url: 'about:blank'
            },
            options: {

            },
            id: 'random'+Math.random(),
            pageRunTime: 100
        };
        runner(options, function(err, result){
            refute(err);
            assert(result.log);
            assert(result.har);
            done();
        });
    });
});
