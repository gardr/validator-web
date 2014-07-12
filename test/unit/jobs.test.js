var proxyquire = require('proxyquire').noPreserveCache();
var storage = require('../../lib/storage.js');
var createJobs = require('../../lib/jobs.js');

describe('Jobs', function(){
    it('should run', function(done){
        var counter = 0;
        var pushed = 0;
        var target = 5;
        var prefix = Date.now();
        var queue = createJobs(worker, 2, 100);

        function worker(data, next){
            counter++;
            if (counter === target){
                done();
            }
            next();
        }
                            // workerFn, maxConcurrent, timeout

        var i;
        for(i = 0; i < target; i++){
            createTest(i+1);
        }


        function createTest(nr){
            var id = prefix +'_'+ nr;
            var data = {n: nr, id: id};
            storage.set(id, data, function(err){
                if (err){
                    console.log('test jobs.js failed:', err);
                }
                queue.push(id, function(err){
                    if (!err) {
                        pushed++;
                        if (pushed === target){

                        }
                    }
                });
            });

        }

    });

    // it.skip('should handle timeouts', function(){
    //
    // });


    // it.skip('should handle concurrency with 1,2,3,4 etc', function(){
    //
    // });

});
