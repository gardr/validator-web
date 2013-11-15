window.onload = function () {
    var el = document.createElement('script');
    document.body.appendChild(el);
    el.onload = function () {
        setTimeout(function(){
            jQuery('body').animate({margin: 10});
        }, 100);
    };
    //el.src = 'http://localhost:8000/components/jquery/jquery.js';
    el.src = 'http://code.jquery.com/jquery-1.10.1.js';
    //el.src = ''
};

setTimeout(interval1, 1);
function interval1() { setTimeout(interval2, 10);}
function interval2() { setTimeout(interval3, 100);}
function interval3() {
    var div = document.createElement('div');
    document.body.appendChild(div);
    div.setAttribute('style', 'width:100%;height:225px;background:red;');
}
