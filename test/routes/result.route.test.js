var expect = require('expect.js');

var proxyquire = require('proxyquire');

var EXPIRED_TEXT = 'ID has expired';
var STORED_ID = '12345678-1234-1234-abcd-123456781234-000000-000000';
var MINIMUM_VIABLE_RESULT_OBJECT = {state: {}, report: {}};
var result = proxyquire('../../lib/routes/result.js', {
    '../storage.js': {
        get: function(key, callback){
            if (key === STORED_ID){
                callback(null, MINIMUM_VIABLE_RESULT_OBJECT);
            } else {
                callback(new Error('Mocked error'));
            }
        }
    }
});
var server = proxyquire('../../server.js', {
    './lib/routes/result.js': result
});

describe('Result route', function(){


    it('should return error if missing id', function(done){

        server.inject('/result', function(res){
            expect(res.statusCode).to.equal(400);
            done();
        });

    });

    it('should serve result if valid formatted id', function(done){
        var validId = '12345678-1234-1234-abcd-123456781234-000000-000001';

        server.inject('/result?id='+validId, function(res){
            expect(res.statusCode).to.equal(200);
            expect(res.result).to.contain(EXPIRED_TEXT);
            done();
        });
    });

    it('should serve stored result', function(done){

        server.inject('/result?id='+STORED_ID, function(res){
            expect(res.statusCode).to.equal(200);
            expect(res.result).to.not.contain(EXPIRED_TEXT);
            done();
        });

    });

});
