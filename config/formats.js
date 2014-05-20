module.exports = [{
    'name': 'inma',
    'title': 'Industry standard – HTML Responsive ads',
    'logo': 'http://www.brandsoftheworld.com/sites/default/files/styles/logo-thumbnail/public/092011/inma_green.gif',
    'meta': ['mobile'],
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
}, {
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
    },
    {
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
    },
    {
        'description': 'Skyskraper',
        'width': 240,
        'height': 600
    }]
}, {
    'name': 'VG Mobil',
    'logo': 'http://www.vg.no/img/logo277x64.png',
    'meta': ['mobile'],
    'config': {
        'sizes': {
            thresholdBytes: 150000
        }
    },
    'formats': [{
        'height': 300,
        'width': 468,
    }, {
        'height': 400,
        'width': 468
    }]
}, {
    'name': 'VG Tablet',
    'logo': 'http://www.vg.no/img/logo277x64.png',
    'meta': ['tablet'],
    'config': {
        'sizes': {
            thresholdBytes: 150000
        }
    },
    'formats': [{
        'height': 300,
        'width': 990,
    }, {
        'height': 150,
        'width': 990
    }, {
        'height': 500,
        'width': 580
    }, {
        'height': 660,
        'width': 300
    }]
}];
