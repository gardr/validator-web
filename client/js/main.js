var domready = require('domready');
var events = require('dom-events');
var getManager = require('gardr/src/mobile.js');

var addClass = require('./lib/classes.js').addClass;

domready(function () {

    var options = window.validatorWebData||{};

    initTabs(options);
    initExpandables(options);

    initRender();
    // initToggleAdvanced();
    initReplayBannerControllers();
    initPreview(options);
});

var expandable = require('./lib/expandable.js');
function initExpandables(){
    var buttons = document.getElementsByClassName('expand-drilldown-list');
    if (!buttons) {
        return;
    }
    expandable(buttons);
}


var createTabs = require('./lib/tabs.js');
function initTabs(options){
    var selectInput = document.getElementById('selectInput');
    if (!selectInput) {
        return;
    }
    var buttons     = selectInput.getElementsByTagName('button');
    var tabContent  = document.getElementById('tabContent');
    var tabs        = tabContent.getElementsByClassName('tab-content');

    var tabEvent = createTabs(buttons, tabs);

    tabEvent.once('tab-code', window.injectEditor);

    tabEvent.on('tab-preview', function(){

        var name = 'result_preview';
        var m = getManager({
            'iframeUrl': options.gardrIframePath
        });

        var bannerContainer = document.getElementById('result-preview-container');

        m.queue(name, {
            'url': options.previewUrl,
            'width': options.viewport.width,
            'height':  options.viewport.height,
            'container': 'result-preview-container'
        });

        m.render(name, function (err, res) {
            if (err){
                return logError(err);
            }
            var para = document.createElement('p');
            para.innerHTML = 'Rendered <a href="'+options.previewUrl+'">'+options.previewUrl+'</a>. Viewport width '+ options.viewport.width+', height '+options.viewport.height;
            bannerContainer.appendChild(para);
            res.iframe.resize('100%', res.input.height);
        });
    });
}

function logError(err){
    if ( window.console ){
        return  window.console.error(err);
    }
    window.alert('An error occured: '+err.message+'. '+err);
}

function initPreview(options) {

    var url = options.previewUrl;
    var name = 'preview';
    if (!url || !document.getElementById('preview-container')) return;

    var m = getManager({
        'iframeUrl': options.gardrIframePath
    });

    m.queue(name, {
        'url': url,
        'width': options.viewport.width,
        'height':  options.viewport.height,
        'container': 'preview-container'
    });
    m.render(name, function (err, res) {
        if (err){
            return logError(err);
        }
        res.iframe.resize('100%', res.input.height);
    });
}

function initRender() {
    var button = document.getElementById('render');
    var input = document.getElementById('urlInput');

    if (!button || !input) {
        return;
    }

    var manager = global.__manager = getManager({
        iframeUrl: './preview/iframe.html'
    });

    var counter = 0;

    function handler(event) {
        event.preventDefault();
        var name = 'example_' + (counter++);
        manager.queue(name, {
            width: 980,
            height: 225,
            url: input.value,
            container: 'container'
        });
        manager.render(name, function (err, res) {
            //console.log('done', name, err, res);
            res.iframe.resize('100%', res.input.height);
        });
        return false;
    }

    events.on(button, 'click', handler);
}

function initReplayBannerControllers() {
    var next = document.getElementById('screenshot-next');
    var prev = document.getElementById('screenshot-prev');
    var play = document.getElementById('screenshot-play');

    if (!next || !prev || !play){
        return;
    }

    var screenshots = Array.prototype.slice.call(document.getElementsByClassName('screenshot'));

    var nextHandler = handler(function (index, len) {
        return index + 1;
    });
    var prevHandler = handler(function (index, len) {
        return index - 1;
    });

    events.on(next, 'click', nextHandler);
    events.on(prev, 'click', prevHandler);
    events.on(play, 'click', start);

    var interval;

    function start() {
        if (interval) {
            interval = clearInterval(interval);
            return;
        }
        interval = setInterval(nextHandler, 1000);
    }

    function handler(fn) {
        return function () {
            screenshots.some(go(fn));
        };
    }

    function go(indexFn) {
        return function shiftActive(elem, index, list) {
            if (elem.className.indexOf('active') > -1) {
                elem.className = elem.className.replace('active', '');
                var newElem = list[indexFn(index, list.length)];
                if (!newElem) {
                    newElem = list[0];
                }
                newElem.className = newElem.className += ' active';
                return true;
            }
        };
    }
}
