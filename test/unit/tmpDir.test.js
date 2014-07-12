var expect = require('expect.js');
var proxyquire = require('proxyquire').noPreserveCache().noCallThru();

function listOfNumbers(n){
    return (new Array(n)).join('.').split('.').map(function(v, i){
        return (i+1);
    });
}

var tmpDir = proxyquire('../../lib/tmpDir.js', {
    'os': {
        tmpdir: function(){
            return null;
        }
    },
    './config.js': {
        get: function(){
            return null;
        }
    }
});

var fs = require('fs');
var mockFs = require('mock-fs');
var pathLib  = require('path');

describe('tmpDir', function() {

    it('should create a directory if tmpDir is same as appDir', function(done) {
        mockFs();

        listOfNumbers(10).map(String).forEach(function(num){
            var path = tmpDir(num);


            var parent = pathLib.join(path, '..', '..');
            var appDir = pathLib.join(__dirname, '..', '..');

            expect(parent).to.equal(appDir);

            fs.mkdirSync(path);
            var content = fs.readdirSync(pathLib.join(path, '..'));
            expect(content.length).to.equal(num*1);
        });
        mockFs.restore();

        done();
    });

});
