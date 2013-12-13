var referee = require('referee');
var assert = referee.assert;
var refute = referee.refute;


var cssHOOK = require('../../lib/report/hook/css.js');

describe('CSS hook', function () {

    it('it should collect styles and filter', function(){

        var result = {};
        var api = {
            'getResultObject' : function(){
                return result;
            },
            'evaluate' : function(fn){
                return fn();
            },
            'switchToIframe' : function(){

            }
        };


        function dom(content){
            return {
                innerHTML: content
            };
        }

        global.document = {
            querySelectorAll: function () {
                return [dom('* { padding: 0; margin: 0; border: 0; }'), dom('ignore GARDR {background:red;}'), dom('me #GARDR{background:blue;}'), dom('validate {background:yellow;}')];
            }
        };

        cssHOOK.onBeforeExit(api);

        global.document = null;

        assert.isArray(result.frameStyles);
        assert.equals(result.frameStyles.length, 1);


    });

});

var cssValidator = require('../../lib/report/validator/css.js');
var help = require('../lib/validateHelpers.js');

describe('CSS validator', function(){

    it('should fail on tag styling', function(done){
        var harvest = {
            frameStyles: ['body {background:red;}', 'p{background: red;}html{background:blue;}', 'should filter out {margin: 0}', '.classname {background: orange;}'],
            HARFile: {}
        };

        var reporter = help.createReporter.call(this);

        cssValidator.validate(harvest, reporter, function(){

            var result = reporter.getResult();

            assert.equals(result.error.length, 3, 'should filter tags with usages except margin/padding');

            done();
        });
    });

});
