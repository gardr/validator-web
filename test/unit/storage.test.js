var expect = require('expect.js');

var proxyquire = require('proxyquire');

var storage = proxyquire('../../lib/storage.js', {
    '../package.json': {version: 'results-db-TEST-RUN-'+Date.now()}
});

describe('Storage', function(){


    it('should set and get to database', function(done){
        var key = 'TESTKEY-'+Date.now();
        var val = 'TESTVALUE-'+Date.now();
        storage.set(key, {someValue: val}, function(err){
            expect(err).to.be.a('undefined');
            storage.get(key, function(err, value){
                expect(err).to.equal(null);
                expect(value.someValue).to.equal(val);
                done();
            });
        });

    });

    it('should  return empty result with prefix', function(done){

        storage.startsWith('asdf'+Date.now(), function(err, list){
            expect(err).to.equal(null);
            expect(list.length).to.equal(0);
            done();
        });

    });


    it('should  return result with prefix', function(done){

        var prefix = 'key'+Date.now();

        storage.set(prefix+'key1', 'value1', runTest);
        storage.set(prefix+'key2', 'value2', runTest);

        var count = 2;
        function runTest(){
            count--;
            if (count) return;

            storage.startsWith(prefix, function(err, list){
                expect(err).to.equal(null);
                expect(list.length).to.equal(2);
                done();
            });
        }
    });

    after(function(done){
        storage._destroyDatabase(done);
    });

});
