function insertBanner(){
    var div = document.createElement('div');
    var cont = document.getElementById('gardr');
    cont.appendChild(div);
    div.setAttribute('style', 'text-align:center;width:100%;height:225px;background:green;color:white;line-height: 225px;');
    div.innerHTML = '<h1>fixtures/script1.js test</h1>';
    return div;
}

window.onload = function () {
    var bannerEl = insertBanner();

    var el = document.createElement('script');
    document.body.appendChild(el);
    el.onload = function runOnload() {
        setTimeout(function delayAnimation(){
            jQuery('body').slideToggle(1000, function runJQuerySlideToggle(){
                $(this).slideToggle(150);
            });
        }, 500);

        jQuery(bannerEl).click(function clickEventHandler(){
            console.log('fixtures/script1.js - > jquery clickhandler');
        }).mouseover(function mouseroverEventHandler(){
            console.log('fixtures/script1.js - > jquery clickhandler');
        });
    };
    //el.src = 'http://localhost:8000/components/jquery/jquery.js';
    el.src = 'http://code.jquery.com/jquery-1.10.1.js';
    //el.src = ''
};

var counter = 25;
setTimeout(interval1, 1);
function interval1() { setTimeout(interval2, 10);}
function interval2() { setTimeout(interval3, 100);}
function interval3() {
    if (counter-- >= 0){
        setTimeout(interval3, 10);
    }
}
