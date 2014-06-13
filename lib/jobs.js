var storage = require('./storage.js');
var Jobs = require('level-jobs');
var log = require('./logger.js');

module.exports = function(worker, maxConcurrent, timeout){

    timeout = (typeof timeout !== 'number' ? 60 : timeout) * 1000;

    var options = {
      maxConcurrency: maxConcurrent||5,
      maxRetries:     5,
      backoff: {
        'randomisationFactor': 0,
        'initialDelay': 10,
        'maxDelay': 300
      }
    };

    var queue   = Jobs(storage.getSublevel('jobs'), worker, options);

    function setError(id, msg, errObj){
        console.log('jobs.js setError():', msg, errObj.message);
        log.error(msg, errObj);
        return storage.set(id, {
            error: {
                error: true,
                err: errObj,
                message: msg
            }
        });
    }

    function push(id, callback){
        storage.get(id, function(storageError, data){
            if (storageError){
                // console.log('jobs.js', storageError.message/*, storageError.stack*/);
                //"Key not found in database"...
                return setError(id, 'Something went wrong. Storage error - Code 001:', storageError);
            }

            if (data.state && data.state.queued){
                return (
                    !data.error ?
                        setError(id, 'queueId: '+ data.queueId+' already registered/started') :
                        null
                );
            }

            if (typeof data === 'object' && typeof data.state === 'undefined'){
                data.state = {};
            }
            data.state.queued = Date.now();

            storage.set(id, data, function(err, _data){

                if (err){
                    return setError(id, 'Something went wrong. Storage error - Code 001:', err);
                }

                var timer;

                queue.push(data, function(err){
                    clearTimeout(timer);
                    if (err){
                        console.log('jobs.js Queue.push error: ', err);
                    }
                    if (callback){
                        callback(err);
                    }
                    //console.log('jobs.js queue.push CALLBACK / done...');
                });

                // todo add timeout
                // timer = setTimeout(function(){
                //     // timed out: if not complete, kill it
                //     console.log('jobs.js TIMER DONE');
                // }, timeout);

            });



        });

    }

    return {
        push: push
    };
};
