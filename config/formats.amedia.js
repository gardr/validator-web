module.exports = [{
    'name': 'Amedia',
    'title': 'Amedia',
    'logo': 'http://www.amedia.no/IteraResize/Static/html/assets/img/amedia-logo.png/width_1460.png',
    'meta': ['mobile', 'tablet', 'desktop'],
    'config': {
        'sizes': {
            thresholdBytes: 150000,
            maxRequests: {
                style: 1
            }
        },
        'gardr': {
            // apparently, enforceSpec only turns off the check for window.open for links, so we turn that one off
            enforceSpec: false
        }
    },
    'formats': [{
        'description': 'Mobilbanner',
        'width': 300,
        'height': 300,
    }, {
        'description': 'Mobilbanner',
        'width': 300,
        'height': 150
    }, {
        'description': 'Toppbanner',
        'width': 980,
        'height': 150
    }, {
        'description': 'Toppbanner',
        'width': 980,
        'height': 300
    }, {
        'description': 'Skyskraper',
        'viewport': {
            width: 280,
            height: 500
        },
        'width': {
            min: 180,
            max: 280
        },
        'height': 500
    }, {
        'description': 'Netboard',
        'width': 980,
        'height': 150
    }, {
        'description': 'Netboard',
        'width': 980,
        'height': 300
    }, {
        'description': 'Artikkelboard',
        'width': 480,
        'height': 400
    }, {
        'description': 'Produktstripe',
        'width': 980,
        'height': 150
    }, {
        'description': 'Banner',
        'width': 480,
        'height': 150
    }]
}];
