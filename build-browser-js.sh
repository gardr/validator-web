#!/bin/bash
mkdir -p ./client/built && 
./node_modules/.bin/browserify  client/main.js | ./node_modules/.bin/uglifyjs -mc  --lint=false  > client/built/bundle.js