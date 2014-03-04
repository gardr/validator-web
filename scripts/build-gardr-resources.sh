#!/bin/bash
mkdir -p ./lib/report/resources/built &&
./node_modules/.bin/browserify  ./lib/report/resources/gardr-iframe.js > ./lib/report/resources/built/gardr-iframe.js &&
./node_modules/.bin/browserify  ./lib/report/resources/gardr-manager.js > ./lib/report/resources/built/gardr-manager.js
