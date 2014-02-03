module.exports = {
    method: 'GET',
    path: '/status',
    config: {
        handler: function (request, reply) {
            reply('ok');
        }
    }
};
