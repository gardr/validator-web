#!/bin/bash
mkdir -p ./client/built &&
./node_modules/.bin/watchify -r domready -r dom-events -o client/built/common.js -dv &
./node_modules/.bin/watchify client/js/main.js -x domready -x dom-events  -o client/built/main.js -dv &
./node_modules/.bin/watchify client/js/editor.js -x domready -x dom-events -o client/built/editor.js
