#!/bin/bash
mkdir -p ./client/built &&
./node_modules/.bin/browserify  client/js/main.js | ./node_modules/.bin/uglifyjs -mc  --lint=false  > client/built/bundle.js &&
./node_modules/.bin/browserify  client/js/editor.js | ./node_modules/.bin/uglifyjs -mc  --lint=false  > client/built/editor.js
