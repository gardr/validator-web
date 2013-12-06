var validate = require('gardr-validator/lib/validate.js');

function getTraceObject(name) {
    return {
        name: name + '',
        time: Date.now(),
        trace: {
            sourceURL: 'http://dummyfile.js',
            line: '123'
        }
    };
}

function createReporter() {
    return validate.createReportHelper({})(this.test.title);
}

module.exports = {
    getTraceObject: getTraceObject,
    createReporter: createReporter
};