window.onload = function () {
    var el = document.createElement('script');
    document.body.appendChild(el);
    el.onload = function () {
        setTimeout(function(){
            jQuery('body').animate({margin: 10});
        }, 100);
    };
    //el.src = 'http://localhost:8000/components/jquery/jquery.js';
    el.src = 'http://code.jquery.com/jquery-1.10.1.min.js';
    //el.src = ''
};

setTimeout(function interval1() {
    //console.log('done timeouts 1 ');
    window.setTimeout(function interval2() {
        //console.log('done timeouts 2 ');
        setTimeout(function interval3() {
            //console.log('script1.js done timeouts 3');
        }, 100);
    }, 10);
}, 1);
