var staticCache = {
    mode: 'client',
    expiresIn: 1000 * 60 * 60 * 24 * 7,
    privacy: 'public'
};

module.exports.routes = [{
        method: 'GET',
        path: '/client/{path*}',
        handler: {
            directory: {
                path: './client',
                listing: false,
                index: true
            }
        },
        config: {
            cache: staticCache
        }
    },
    {
        method: 'GET',
        path: '/fixtures/{path*}',
        handler: {
            directory: {
                path: './test/unit/fixtures',
                listing: false,
                index: true
            }
        }
    },
    {
        method: 'GET',
        path: '/preview/{path*}',
        handler: {
            directory: {
                path: './node_modules/pasties-js/target/pasties-js',
                listing: false,
                index: true
            }
        },
        config: {
            cache: staticCache
        }

    },
    {
        method: 'GET',
        path: '/components/{path*}',
        handler: {
            directory: {
                path: './bower_components',
                listing: false,
                index: true
            }
        },
        config: {
            cache: staticCache
        }
}];