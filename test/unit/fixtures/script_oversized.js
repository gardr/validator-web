function insertBanner(){
    var div = document.createElement('div');
    var cont = document.getElementById('gardr');
    cont.appendChild(div);

    div.setAttribute('style', 'text-align:center;width:100%;height:225px;background:green;color:white;line-height: 225px;');
    div.innerHTML = '<h1>fixtures/script_oversized.js <small>testcase with scriptinjecting</small></h1>';

    div.addEventListener('click', function(){
        console.log('fixtures/script_oversized.js - clicked banner element');
        window.injectScript('http://ajax.googleapis.com/ajax/libs/ext-core/3.1.0/ext-core.js');
        window.injectScript('http://ajax.googleapis.com/ajax/libs/jqueryui/1.11.0/jquery-ui.min.js');
    }, false);

    div.addEventListener('mouseover', function(){
        console.log('fixtures/script_oversized.js - mouseover banner element');
        window.injectScript('http://ajax.googleapis.com/ajax/libs/mootools/1.5.0/mootools-yui-compressed.js');
        window.injectScript('http://ajax.googleapis.com/ajax/libs/webfont/1.5.3/webfont.js');
        window.injectScript('http://ajax.googleapis.com/ajax/libs/swfobject/2.2/swfobject.js');
    }, false);
}

window.injectScript = function(url){
    console.log('fixtures/script_oversized.js - inject'+url);
    var el = document.createElement('script');
    document.body.appendChild(el);
    el.src = url;
};

window.onload = function () {
    console.log('fixtures/script_oversized.js - onload');
    insertBanner();
    window.injectScript('http://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js');
    window.injectScript('http://ajax.googleapis.com/ajax/libs/dojo/1.10.0/dojo/dojo.js');
};
