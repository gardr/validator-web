var expect = require('expect.js');

var os = require('os');

var proxyquire = require('proxyquire');

var mockedRunner = proxyquire('../../lib/report/index.js', {
    'gardr-validator': function (options, callback) {
        // test just want the options for verifying the actual option-object
        callback(null, options);
    }
});

describe('getReport', function () {

    it('calling runner without scriptUrl should return an error', function (done) {
        mockedRunner(null, function (err, result) {
            expect(err).to.be.an('object');
            done();
        });
    });

    it('calling runner should work, and return options as expected', function (done) {
        var id = 'id_' + Math.round(Math.random() * 100012391023);
        var input = {
            'output': {
                'url': id
            },
            'runnerConfig': {
                'viewport': {
                    height: 123
                }
            },

            id: id
        };

        mockedRunner(input, function (err, options) {
            expect(err).to.equal(null);
            expect(options).to.be.an('object');
            expect(options.scriptUrl).to.be.a('string');
            expect(options.scriptUrl).to.equal(input.output.url);
            expect(options.viewport.height).to.equal(123);
            done();
        });
    });

    var runner = require('../../lib/report/index.js');

    it('should work to run', function(done){
        this.timeout = 3000;
        var options = {
            output: {
                url: 'about:blank'
            },
            'runnerConfig': {
                pageRunTime: 100,
                outputDirectory: os.tmpDir()
            },
            id: 'random'+Math.random(),
        };
        runner(options, function(err, result){
            // expect(err).to.equal(null);
            expect(result.log).to.be.a('object');
            expect(result.har).to.be.a('object');
            done();
        });
    });
});
