var logo = 'http://1.vgc.no/vgnett-prod/img/vgLogoMobile.png';

module.exports = [{
    'name': 'VG Mobil',
    'title': 'VG Mobil',
    'logo': logo,
    'meta': ['mobile'],
    'config': {
        'sizes': {
            thresholdBytes: 150000,
            maxRequests: {
                style: 1
            }
        },
        'gardr': {
            enforceSpec: false
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
    'title': 'VG Tablet',
    'logo': logo,
    'meta': ['tablet'],
    'config': {
        'sizes': {
            thresholdBytes: 150000,
            maxRequests: {
                style: 1
            }
        },
        'gardr': {
            enforceSpec: false
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
