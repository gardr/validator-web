module.exports = [{
    'name': 'Schibsted 2015',
    'logo': 'http://www.schibsted.com/Global/LogoTypes/Logos%202014/SMG_Small_2014_RGB.png',
    'meta': ['mobile', 'tablet', 'desktop'],
    'sites': [{
        'name': 'FINN.no',
        'logo': 'finn.png'
    }, {
        'name': 'VG',
        'logo': 'vg.png'
    }, {
        'name': 'Storby',
        'logo': 'storby.png'
    }],
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
        'description': 'Inline 150',
        'viewport': {
            width: 980,
            height: 150
        },
        'width': '100%',
        'height': 150
    },{
        'description': 'Inline 250',
        'viewport': {
            width: 980,
            height: 250
        },
        'width': '100%',
        'height': 250
    },{
        'description': 'Inline 500',
        'viewport': {
            width: 980,
            height: 500
        },
        'width': '100%',
        'height': 500,
        'excludeSite': ['finn']
    }, {
        'description': 'Toppbanner Hestesko',
        'viewport': {
            width: 1010,
            height: 150
        },
        'width': 1010,
        'height': 150
    }, {
        'description': 'Skyskraper Hestesko',
        'viewport': {
            width: 180,
            height: 1000
        },
        'width': 180,
        'height': 1000
    }, {
        'description': 'Toppbanner ROS',
        'viewport': {
            width: 980,
            height: 150
        },
        'width': 980,
        'height': 150
    }, {
        'description': 'Skyskraper ROS',
        'viewport': {
            width: 180,
            height: 500
        },
        'width': 180,
        'height': 500
    }]
}];



