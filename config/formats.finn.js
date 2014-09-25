module.exports = [{
    'name': 'FINN',
    'logo': 'http://nyapp.finn.no/assets/logo.png',
    'meta': ['mobile', 'tablet', 'desktop'],
    'subFormats': {
        'non-strict': {
            config: {
                timers: {
                    setTimeout: 100
                }
            }
        }
    },
    'formats': [{
        'description': 'FINN responsive',
        'viewport': {
            width: 980,
            height: 225
        },
        'width': '100%',
        'height': 225
    }, {
        'description': 'Toppbanner / dominans / hestesko',
        'viewport': {
            width: 1004,
            height: 150
        },
        'width': {
            min: 980,
            max: 1004
        },
        'height': 150
    }, {
        'description': 'Skyskraper',
        'width': 240,
        'height': 600
    }]
}];
