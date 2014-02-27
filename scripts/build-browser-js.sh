#!/bin/bash
mkdir -p ./client/built &&
./node_modules/.bin/browserify -r domready -r dom-events -o client/built/common.js &&
./node_modules/.bin/uglifyjs client/built/common.js -mc --lint=false > client/built/common.min.js &
./node_modules/.bin/browserify client/js/main.js -x domready -x dom-events  -o client/built/main.js &&
./node_modules/.bin/uglifyjs client/built/main.js -mc --lint=false > client/built/main.min.js &
./node_modules/.bin/browserify client/js/editor.js -x domready -x dom-events -o client/built/editor.js &&
./node_modules/.bin/uglifyjs client/built/editor.js -mc --lint=false > client/built/editor.min.js
