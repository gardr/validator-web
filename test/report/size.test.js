var referee = require('referee');
var assert = referee.assert;
var refute = referee.refute;
var help = require('../lib/validateHelpers.js');

var validator = require('../../lib/report/validator/sizes.js');

describe('Size validator', function () {


    it('should report on sizes', function(done){

        var harvested = {

        };
        var reporter = help.createReporter.call(this);
        var options = {};

        validator.validate(harvested, reporter, handler, options);


        function handler(){
            //todo
            done();
        }

    });

});
