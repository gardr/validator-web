var storage = require('./storage.js');
var Jobs = require('level-jobs');
var log = require('./logger.js');

module.exports = function(worker, maxConcurrent, timeout){

    timeout = (typeof timeout !== 'number' ? 60 : timeout) * 1000;

    var options = {
        maxConcurrency: maxConcurrent || 5,
        maxRetries: 5,
        backoff: {
            'randomisationFactor': 0,
            'initialDelay': 10,
            'maxDelay': 300
        }
    };

    var queue   = Jobs(storage.getSublevel('jobs'), worker, options);

    // setTimeout(function(){
    //     var stream = queue.readStream();
    //     stream.on('data', function(d) {
    //       var jobId = d.key;
    //       var work = JSON.parse(d.value);
    //       console.log('pending job id: %s, work: %j', jobId, work.id);
    //     });
    // }, 1000);

    function setError(id, msg, err){
        log.error(msg, {id: id, err: err});
        return storage.set(id, {
            error: {
                error: true,
                err: err,
                message: msg + (err ? ':' + err.message : '')
            }
        });
    }

    function push(id, callback){
        storage.get(id, function(storageError, data){
            if (storageError){
                // console.log('jobs.js', storageError.message/*, storageError.stack*/);
                //"Key not found in database"...?
                return setError(id, 'Something went wrong getting job. Storage error - Code 001:', storageError);
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
            data.state.queued = new Date();

            storage.set(id, data, function(err, _data){

                if (err){
                    return setError(id, 'Something went wrong. Storage error - Code 001', err);
                }

                var jobId = queue.push(data, function(err){
                    if (err){
                        console.log('jobs.js Queue.push error: ', err);
                    }
                    if (callback){
                        callback(err);
                    }
                });
            });
        });

    }

    return {
        push: push
    };
};
