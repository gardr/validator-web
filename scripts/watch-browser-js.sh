#!/bin/bash
mkdir -p ./client/built &&
./node_modules/.bin/watchify client/js/main.js -o client/built/main.js -dv &
./node_modules/.bin/watchify client/js/editor.js -o client/built/editor.js -dv
