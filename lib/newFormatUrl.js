var urlLib = require('url');

var typicalConfigObj = {
    'name': '(company_name)',
    'title': '(company_name or description)',
    'logo': 'http://...',
    'meta': ['mobile', 'tablet', 'desktop'],
    'config': {

    },
    'formats': [{
        'viewport': {
            width: 980,
            height: 225
        },
        'width': {
            min: 980,
            max: 980
        },
        'height': {
            min: 225,
            max: 225
        }
    }]
};
var newFormatUrl = urlLib.parse('https://github.com/gardr/validator-web/issues/new');
newFormatUrl.query = {
    labels: 'formats',
    title: 'New Format',
    body: [
        'We want a new format for (company_name).','',
        '```json',
        JSON.stringify(typicalConfigObj, null, 4),
        '```',
        '',
        '---------------------------',
        'Current Formats configurated here: https://github.com/gardr/validator-web/blob/master/config/formats.js',
        '',
        'Possible config {} options here: https://github.com/gardr/validator/blob/master/config/validatorConfig.js'
    ].join('\n\r')
};

module.exports = urlLib.format(newFormatUrl, true);
