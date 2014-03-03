var referee = require('referee');
var assert = referee.assert;
var refute = referee.refute;

var hook = require('../../lib/report/hook/actions.js');
var help = require('../lib/validateHelpers.js');

describe('Actions', function () {

    it('should trigger a click', function(done){

        global.document = {
            createEvent: function(){
                return {
                    initMouseEvent: function(){}
                };
            },
            body: {
                firstChild: {
                    querySelector: function(){
                        return {
                            dispatchEvent: function(){}
                        };
                    }
                }
            }
        };

        var calledRealImpl = 0;
        global.window = {
            open: function(){
                calledRealImpl++;
            }
        };

        var result = {actions: {}};

        var api = {
            switchToIframe: function () {},
            evaluate: function (fn) {
                return fn();
            },
            set: function(key, value){
                result.actions[key] = value;
            }
        };

        hook.onHalfTime(api);

        window.open('some url', 'some_target');

        hook.onBeforeExit(api);

        setTimeout(function(){
            assert.equals(calledRealImpl, 0);
            assert(result.actions.windowOpened);
            assert.equals(result.actions.windowOpened.length, 1);
            global.window = null;
            global.document = null;
            done();
        }, 170);
    });

    it.skip('should not collect har/network files after userinteraction');
});
