module.exports = [{
    'name': 'inma',
    'title': 'Industry standard - HTML Responsive ads',
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
}];

['schibsted'/*, 'finn', 'vg', 'storby'*/].forEach(function(key){
    module.exports.push.apply(module.exports, require('./formats.' + key + '.js'))
});
