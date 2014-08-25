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

    $ npm install

Run tests

    $ npm test

#### Starting the application

Run server:

    $ PORT=8000 npm start

Local development:

( if editing gardr-validator, run ´npm link´ in gardr-validator folder, and then link gardr-validator inside gardr-validator-web with ´npm link gardr-validator´)

    $ npm run start-dev

    If you need to debug output from phantomjs, add env variable TMP_DIR=/TMP_DIR.
    Screenshots and json output from phantom will be outputted in a folder with id as name.


##### Additional startup configuration

You can configure port, logfile location, etc using the [config module](lib/config.js) or by specifying environment variables when starting.

	$ HTTP_PORT=1337 LOG_FILE_NAME=~/mylogs/pvw npm start

#### Where to get help

Create a github issue.


#### Contributing

YES, pull requests with tests. Be sure to create a issue and let us know you are working on it - maybe we can help out with insights etc.

##### Alternatives

(please let us know of alternatives to this project)

------------------------------------------------------------------------------

## Current Deployment / validator.gardr.org production

! Prerequisite: Get your ssh-key added to our server at admin@git.gardr.org.

As the setup is Ubuntu with Dokku, you can SSH into git.gardr.org and use the dokku CLI, ref https://github.com/progrium/dokku. Added a couple of Dokku-plugins for rebuild and supervisord, but they are not needed.


 * Add dokku as remote to validator-web git-repo on your computer:

        git remote add dokku@git.gardr.org:validator


 * Push to dokku:

        git push dokku master


### Direct SSH-access:

Redeploy via dokku / (throw away logs, files and database):

        dokku rebuild:all


Run command via dokku, e.g:

        dokku run validator ls -lha


### Debugging / Accessing docker instance directly

To access the docker instance via ssh, first access gardr.org, then:

        docker ps

Get containerId and insert in next command where "my_container_id":

        PID=$(docker inspect --format '{{.State.Pid}}' my_container_id)

`nsenter` will give you direct shell access to the running docker container:

        nsenter --target $PID --mount --uts --ipc --net --pid

------------------------------------------------------------------------------

* Application code will then be located in `/app` folder.
* Application specific logs in `/app/logs`.
* Leveldb are in same folder prefixed with `result-db-$(version)-$(enviroment)`.
    * If database needs to be deleted, just remove this folder or bump the application version in package.json.
* PhantomJS files wil output in tempoary directory, names if local in app directory `phantom_output_files_$(version)_$(enviroment)`.
    * Phantom output directory might contain `debug-input-$(timestamp).json`, and `output-$(timestamp).json` as well as screenshots named `$(width)x$(height)_$(timestamp).png`.

------------------------------------------------------------------------------

