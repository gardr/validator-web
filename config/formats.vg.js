var logo = 'http://1.vgc.no/vgnett-prod/img/vgLogoMobile.png';

module.exports = [{
    'name': 'VG Tablet',
    'title': 'VG Tablet',
    'logo': logo,
    'meta': ['tablet'],
    'config': {
        adops: {
            flatZIP: true
        },
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
