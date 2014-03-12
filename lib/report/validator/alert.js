function validate (harvested, report, next, options) {

    if (harvested.script.tags) {
        harvested.script.tags.forEach(function (tag) {
            if(tag.toString().match(/palert\(/)) {
				report.error('alert present');
            } else {
				report.error(tag.toString());
            }
        });
    }

    next();
}

module.exports = {
	dependencies: ['script'],
	validate: validate
};
