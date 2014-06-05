var expect = require('expect.js');
var proxyquire = require('proxyquire');
var unzip = require('../../lib/unzip.js');

var zipFiles = [];

var data = {
    output: {
        zip: {
            'path': __dirname + '/fixtures/zip2/'
        }
    },
    input: {
        'zip': {
            'filename': 'zipfile.zip',
            'path': __dirname + '/fixtures/zipfile.zip',
            'headers': {
                'content-disposition': 'form-data; name=\"zipfile\"; filename=\"zipfile.zip\"',
                'content-type': 'application/zip'
            },
            'bytes': 75710
        }
    }
};

describe('Unzip', function () {
    it('should take a uploaded zip object from hapijs', function (done) {
        var fs = require('fs');
        var mockFs = require('mock-fs');

        mockFs();

        unzip(data.input.zip, data, function(err){
            expect(err).to.be.an('undefined');
            //console.log(mockFs.directory());
            // todo: should assert what directory and files written to mock filesystem
            mockFs.restore();
            done();
        });

    });

    describe('_validateIndex', function(){
        it('should not error out if wellformed html', function(done){
            var mockedUnzip = proxyquire('../../lib/unzip.js', {
                'request': function(options, callback){
                    callback(null, null, JSON.stringify({messages: []}));
                }
            });

            var output = {};
            mockedUnzip._validateIndex(output, '<!DOCTYPE html><html><body><div></div></body></html>', function(){
                expect(output.error).to.be.an('undefined');
                done();
            });


        });

        it('should error out if not wellformed html', function(done){
            var mockedUnzip = proxyquire('../../lib/unzip.js', {
                'request': function(options, callback){
                    callback(null, null, JSON.stringify({'messages': [{
                        type: 'error',
                        message: '...',
                    }]}));
                }
            });

            var output = {};
            mockedUnzip._validateIndex(output, '_', function(){
                expect(output.error).to.be.a('object');
                expect(output.error.errors.length).to.be(1);
                done();
            });
        });
    });


    // it('only include valid filetypes', function () {

    // });

    // it('should remove zip after unzipping file', function () {

    // });

});
