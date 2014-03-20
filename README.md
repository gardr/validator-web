garðr-validator-web
=============

[![Build Status](https://travis-ci.org/gardr/validator-web.png)](https://travis-ci.org/gardr/validator-web)
[![Build Status](https://drone.io/github.com/gardr/validator-web/status.png)](https://drone.io/github.com/gardr/validator-web/latest)
[![Coverage Status](https://coveralls.io/repos/gardr/validator-web/badge.png)](https://coveralls.io/r/gardr/validator-web)
[![NPM version](https://badge.fury.io/js/gardr-validator-web.png)](http://badge.fury.io/js/gardr-validator-web)
[![Dependency Status](https://david-dm.org/gardr/validator-web.png)](https://david-dm.org/gardr/validator-web)
[![devDependency Status](https://david-dm.org/gardr/validator-web/dev-status.png)](https://david-dm.org/gardr/validator-web#info=devDependencies)

**Description: This is the web interface for the [garðr validator project](http://gardr.github.io/).**

The main purpose is to find possible errors or regressions in display ads. Its intended to grow over time to a set of rules based on best practices for performance ( although displayads not necessarily can avoid document.write atm ).

The validator takes _input_ as a _scripturl_ or _zipfile_, _html,css and javascript_, and produces in 3 steps harvested data and a report.

#### How does the validator work?

It uses phantomJS as a browser, loads in a shim on top of the PhantomJS api, runs for a 10 seconds after all hooks have been innjected and data colelcted.
After phantomjs run, the preoprocessors and validators/rules runs in a series to generate a report(info, warn, debug, error...).


#### Installation instructions

Install depedencies and package validator with package gardr(abit funky)

    $ npm install && npm run build

Run tests

    $ npm test

#### Starting the application

Run server:

    $ HOST=localhost PORT=8000 npm start

Local development:

( if editing gardr-validator, run ´npm link´ in gardr-validator folder, and then link gardr-validator inside gardr-validator-web with ´npm link gardr-validator´)

    $ npm run start-dev


##### Additional startup configuration

You can configure port, logfile location, etc using the [config module](lib/config.js) or by specifying environment variables when starting.

	$ HTTP_PORT=1337 LOG_FILE_NAME=~/mylogs/pvw npm start

#### Where to get help

Create a github issue.


#### Contributing

YES, pull requests with tests. Be sure to create a issue and let us know you are working on it - maybe we can help out with insights etc.

##### Alternatives

(please let us know of alternatives to this project)
