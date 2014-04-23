test:
	@node node_modules/lab/bin/lab test/**/*.test.js -r console
test-cov:
	@node node_modules/lab/bin/lab test/**/*.test.js -t 80
test-cov-html:
	@node node_modules/lab/bin/lab test/**/*.test.js -r html -o coverage.html

.PHONY: test test-cov test-cov-html
