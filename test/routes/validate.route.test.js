var Lab         = require('lab');
var expect      = Lab.expect;
var before      = Lab.before;
var after       = Lab.after;
var describe    = Lab.experiment;
var it          = Lab.test;
var proxyquire  = require('proxyquire');

var memStorage = {};
var storage = proxyquire('../../lib/storage.js', {
    'levelup': function(){

        return {
            get: function(key, callback){
                if (callback) {
                    callback(null, memStorage[key]);
                }
            },
            put: function(key, data, callback){
                memStorage[key] = data;
                if (callback) {
                    callback(null, memStorage[key]);
                }
            }
        };
    }
});

var validate = proxyquire('../../lib/routes/validate.js', {
    '../storage.js': storage,
    'request': {
        get: function(url, options, handler){
            handler(null, {statusCode: 200, headers: {'content-type': 'html'}}, '<html>DUMMY</html>');
        }
    },
    '../report': function (data, callback) {
        // lets skip phantom
        callback(null, data);
    }
});
var server = proxyquire('../../server.js', {
    './lib/routes/validate.js': validate
});

var NEWLINE = '\r\n';
var BOUNDARY = 'AaB03x';
var SEP = '--'+BOUNDARY+NEWLINE;
function multipart(obj){
    return SEP + Object.keys(obj).map(function(key){
        return 'Content-Disposition: form-data; name="' + key + '"' + NEWLINE +
                NEWLINE +
                obj[key] + NEWLINE;
    }).join(SEP)  + '--' + BOUNDARY + '--' + NEWLINE;
}

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

    it('should redirect when parameteres is valid', function(done){

        var payload = multipart({
            "url":"http://www.finn.no",
            "formatId": "FINN responsive",
            "formatSubId": "default",
            "formatIndex": 0
        });

        var options = {
            method: 'POST',
            headers: { 'Content-Type': 'multipart/form-data; Boundary='+BOUNDARY },
            url: '/validate',
            payload: payload
        };

        var beforeLen = Object.keys(memStorage).length;

        server.inject(options, function(res){
            expect(res.statusCode).to.equal(302);
            expect(res.headers['set-cookie'][0]).to.contain('session=');


            var location = res.headers.location;
            expect(location).to.contain('id=');
            expect(Object.keys(memStorage).length).to.equal(beforeLen+1);

            server.inject(location, function(resultPage){
                //require('fs').writeFileSync('test_index.html', resultPage.result);

                expect(resultPage.statusCode).to.equal(200);
                done();
            });
        });

    });

});
