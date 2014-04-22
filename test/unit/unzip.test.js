var referee = require('referee');
var assert = referee.assert;
var refute = referee.refute;

var unzip = require('../../lib/unzip.js');

var zipFiles = [];

var data = {
    output: {
        'zip': {
            'filename': 'banner.zip',
            'path': __dirname + '/fixtures/zip/zipfile.zip',
            'headers': {
                'content-disposition': 'form-data; name=\"zipfile\"; filename=\"ut-banner-uke-7.zip\"',
                'content-type': 'application/zip'
            },
            'bytes': 75710
        }
    }
};

describe('Unzip', function () {

    it('should take a uploaded zip object from hapijs', function () {
        //var zipfile =
        /*
         */
    });

    it('only include valid filetypes', function () {

    });

    it('should remove zip after unzipping file', function () {

    });

});
