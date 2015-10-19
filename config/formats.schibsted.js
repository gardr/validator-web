module.exports = [{
    'name': 'schibsted-2015',
    'title': 'Schibsted 2015',
    'logo': 'http://www.schibsted.com/Global/LogoTypes/Logos%202014/SMG_Small_2014_RGB.png',
    'meta': ['mobile', 'tablet', 'desktop'],
    'sites': [{
        'name': 'FINN.no',
        'svg': '<svg width="106" height="34" viewBox="0 0 527.411 169.398" style="display:inline;vertical-align: middle;max-width: 100%;"><title>FINN</title><path fill="#fff" d="M468.507 0h-256.187c-21.707 0-40.695 11.812-50.912 29.337-10.216-17.525-29.204-29.337-50.911-29.337h-51.595c-32.479 0-58.902 26.425-58.902 58.905v51.587c0 32.481 26.423 58.906 58.902 58.906h409.605c32.479 0 58.903-26.425 58.903-58.906v-51.587c.001-32.48-26.423-58.905-58.903-58.905z"></path><path fill="#09f" d="M468.507 153.383c23.687 0 42.888-19.199 42.888-42.89v-51.588c0-23.691-19.201-42.89-42.888-42.89h-256.187c-23.686 0-42.887 19.198-42.887 42.89v94.478h299.074z"></path><path fill="#006" d="M153.384 153.383v-94.478c0-23.691-19.201-42.89-42.887-42.89h-51.595c-23.686 0-42.887 19.198-42.887 42.89v51.587c0 23.691 19.201 42.89 42.887 42.89h94.482z"></path><rect x="320.156" y="75.275" fill="#fff" width="19.621" height="53.211"></rect><path fill="#fff" d="M262.912 86.281c0-5.529 3.813-11.006 13.069-11.006h28.421v15.613h-18.612c-2.498 0-3.255.992-3.255 2.664v7.472h21.867v15.61h-21.867v11.852h-19.623v-42.205zM375.165 91.099h10.399c2.409 0 3.246.832 3.246 3.235l-.008 34.152h19.632v-41.996c0-5.527-3.815-11.004-13.069-11.004h-39.824l-.01 53h19.634v-37.387zM442.719 91.099h10.4c2.408 0 3.245.832 3.245 3.235l-.009 34.152h19.634v-41.996c0-5.527-3.815-11.004-13.07-11.004h-39.823l-.01 53h19.633v-37.387z"></path></svg>'
    }, {
        'name': 'VG',
        'logo': 'http://1.vgc.no/vgnett-prod/img/vgLogoMobile.png'
    }, {
        'name': 'Storby',
        'logo': 'http://www.storbyinfo.no/wp-content/uploads/2013/11/logo.png'
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
    'config': {
        adops: {
            flatZIP: true
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
