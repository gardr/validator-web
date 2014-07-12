var expect = require('expect.js');
var proxyquire  = require('proxyquire').noPreserveCache();
var multipart = require('../helpers/multipart.js');


var validate = proxyquire('../../lib/routes/validate.js', {
    'request': {
        get: function(url, options, handler){
            handler(null, {statusCode: 200, headers: {'content-type': 'html'}}, '<html>DUMMY</html>');
        }
    },
    '../report/index.js': function (data, callback) {
        // lets skip phantom
        callback(null, null, null);
    }
});

var server = proxyquire('../../server.js', {
    './lib/routes/validate.js': validate,
});

describe('Validate route', function(){

    it('should 400 bad request on missing payload', function(done){

        var options = {
            method: 'POST',
            url: '/validate',
        };

        server.inject(options, function(res){
            expect(res.statusCode).to.equal(400);
            done();
        });

    });

    it('should redirect when parameteres are valid', function(done){
        var payload = multipart({
            "url":"http://www.finn.no",
            "formatId": "inma",
            "formatSubId": "default",
            "formatIndex": 0
        });

        var options = {
            method: 'POST',
            headers: { 'Content-Type': 'multipart/form-data; Boundary='+multipart.BOUNDARY },
            url: '/validate',
            payload: payload
        };

        server.inject(options, function(res){
            expect(res.statusCode).to.equal(302);
            expect(res.headers['set-cookie'][0]).to.contain('session=');
            expect(res.headers.location).to.contain('id=');


            server.inject(res.headers.location, function(resultPage){
                //require('fs').writeFileSync('test_index.html', resultPage.result);
                expect(resultPage.statusCode).to.equal(200);
                done();
            });
        });

    });

});


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

var resultServer = proxyquire('../../server.js', {
    './lib/routes/result.js': result
});

describe('Result route', function(){


    it('should return error if missing id', function(done){
        resultServer.inject('/result', function(res){
            expect(res.statusCode).to.equal(400);
            done();
        });
    });

    it('should serve result if valid formatted id', function(done){
        var validId = '12345678-1234-1234-abcd-123456781234-000000-000001';

        resultServer.inject('/result?id='+validId, function(res){
            expect(res.statusCode).to.equal(200);
            expect(res.result).to.contain(EXPIRED_TEXT);
            done();
        });
    });

    it('should serve stored result', function(done){

        resultServer.inject('/result?id='+STORED_ID, function(res){
            expect(res.statusCode).to.equal(200);
            expect(res.result).to.not.contain(EXPIRED_TEXT);
            done();
        });

    });

});
