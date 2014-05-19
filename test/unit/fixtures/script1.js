function insertBanner(){
    var div = document.createElement('div');
    var cont = document.getElementById('gardr');
    cont.appendChild(div);
    div.setAttribute('style', 'text-align:center;width:100%;height:225px;background:green;color:white;line-height: 225px;');
    div.innerHTML = '<h1>script.js test</h1>';
}

window.onload = function () {
    insertBanner();

    var el = document.createElement('script');
    document.body.appendChild(el);
    el.onload = function () {
        setTimeout(function(){
            jQuery('body').slideToggle(1000, function(){
                $(this).slideToggle(150);
            });

        }, 500);
    };
    //el.src = 'http://localhost:8000/components/jquery/jquery.js';
    el.src = 'http://code.jquery.com/jquery-1.10.1.js';
    //el.src = ''
};

setTimeout(interval1, 1);
function interval1() { setTimeout(interval2, 10);}
function interval2() { setTimeout(interval3, 100);}
function interval3() {
    //throw new Error('Huzzlas');
}
