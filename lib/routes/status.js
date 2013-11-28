module.exports = {
    method: 'GET',
    path: '/status',
    config: {
        handler: function () {
            this.reply('ok');
        }
    }
};