validator-web
=============
[![Build Status](https://travis-ci.org/pasties/validator-web.png)](https://travis-ci.org/pasties/validator-web)

**Description: Web validator interface for the [pasties project](http://pasties.github.io/).**

The main purpose is to find possible errors or regressions in display ads. Its intended to grow over time to a set of rules based on best practices for performance ( although displayads not necessarily can avoid document.write atm ).

The validator takes _input_ as a _scripturl_ or _html,css and javascript_, and produces in 2 steps harvested data and a report.

Hooks / Harvesters (runs inside phantomJS context):
* images
* jquery
* pasties
* timers

Validators / Rules (runs in node.js context):
* images
* jquery
* css
* timers


# How does the validator work?

It uses phantomJS as a browser, loads in a shim on top of the phanomjs api, runs for a 10 seconds after all hooks/harvesters has been injected.
After phantomjs run, the validators/rules runs in a series to generate a report(info, warn, debug, error).


# Installation instructions

Install depedencies and package pasties-js(abit funky)
$ npm install && npm run build

Run server, logs go to ./logs
$ npm start

Run tests
$ npm test


# Where to get help

Create a github issue, or contact sveinung.rosaker@finn.no.


# Contributing

YES, pull requests with tests. Be sure to create a issue and let us know you are working on it - maybe we can help out with insights etc.

# Alternatives

(please let us know of alternatives to this project)
