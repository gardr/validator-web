module.exports = [{
    'name': 'finn-responsive',
    'logo': 'http://hjemmehos.finn.no/filestore/dev/GFX/logo_finn.png',
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
    'name': 'finn',
    'logo': 'http://nyapp.finn.no/assets/logo.png',
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
            'description': 'Toppbanner, dominant eller hestestko',
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
        },
        {
            'description': 'Test-format',
            'viewport': {
                width: 980,
                height: 225
            },
            'width': '100%',
            'height': 225
        },
        {
            'description': 'test',
            'viewport': {
                width: 500,
                height: 300
            },
            'width': {
                min: 400,
                max: 500
            },
            'height': {
                min: 250,
                max: 300
            }
    }]
}, {
    'name': 'mobil-vg',
    'logo': 'http://www.vg.no/img/logo277x64.png',
    'config': {
        'sizes': {
            thresholdBytes: 200000
        }
    },
    'subFormats': {
        'easy': {
            config: {
                sizes: {
                    thresholdBytes: 250000
                }
            }
        }
    },
    'formats': [{
        'viewport': {
            width: 468,
            height: 300
        },
        'height': {
            min: 200,
            max: 300
        },
        'width': 468,
        'config': {
            sizes: {
                thresholdBytes: 50000
            },
            gardr: {
                enforceSpec: false
            }
        }
    }, {
        'height': {
            min: 200,
            max: 200
        },
        'width': {
            min: 468,
            max: 468
        }
    }, {
        'height': {
            min: 150,
            max: 150
        },
        'width': {
            min: 468,
            max: 468
        }
    }, {
        'height': 225,
        'width': '100%'
    }]
}];
