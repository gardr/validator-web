function collectAlerts () {
	return ['alertThingy'];
}


module.exports = {
	'onAlert': function(msg, api) {
		api.set('alertPresent', api.evaluate(collectAlerts));
	}
};