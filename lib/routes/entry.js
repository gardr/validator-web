module.exports = {
    method: 'GET',
    path: '/user-entry.js',
    config: {
        handler: require('./userInput.js').config.handler
    }
};
