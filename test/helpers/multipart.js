var BOUNDARY = 'AaB03x';
module.exports = function (obj){
    var NEWLINE = '\r\n';
    var SEP = '--'+BOUNDARY+NEWLINE;
    return SEP + Object.keys(obj).map(function(key){
        return 'Content-Disposition: form-data; name="' + key + '"' + NEWLINE +
                NEWLINE +
                obj[key] + NEWLINE;
    }).join(SEP)  + '--' + BOUNDARY + '--' + NEWLINE;
};
module.exports.BOUNDARY = BOUNDARY;
