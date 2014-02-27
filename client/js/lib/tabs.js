var domready = require('domready');
var events = require('dom-events');
var klasses = require('./classes.js');
var addClass = klasses.addClass;
var removeClass = klasses.removeClass;
var EventEmitter = require('events').EventEmitter;

module.exports = function(buttonList, containerList){
    buttonList      = Array.prototype.slice.call(buttonList);
    containerList   = Array.prototype.slice.call(containerList);

    var eventEmitter = new EventEmitter();

    buttonList.forEach(function(elem){
        events.on(elem, 'click', buttonClickHandler);
    });

    function buttonClickHandler(e){
        switchTo(this, this.getAttribute('data-tab'));
        if (!e) {return false;}
        else if (e.preventDefault) { e.preventDefault(); }
        else {e.returnValue = false;}
    }

    function switchTo(linkElem, tabName){
        klasses.siblingsAddClass(buttonList, linkElem, 'btn-primary');
        containerList.forEach(function(containerElem){
            if (tabName === containerElem.getAttribute('data-tab')) {
                eventEmitter.emit('newTab', containerElem);
            }
        });
    }

    function setHeight(elem){
        var computed = getComputedStyle(elem);
        elem.parentNode.style.height = computed.height;
    }

    eventEmitter.on('newTab', function(elem){
        eventEmitter.emit(elem.getAttribute('data-tab'), elem);
        klasses.siblingsAddClass(containerList, elem, 'tab-active', function(elem, done){
            klasses.addClass(elem, 'tab-outgoing');
            setTimeout(function(){
                klasses.removeClass(elem, 'tab-outgoing');
            }, 500);
            done();
        });
        setHeight(elem);
    });


    domready(function(){
        containerList.forEach(function(containerElem){
            if (klasses.hasClass(containerElem, 'tab-active')) {
                eventEmitter.emit('newTab', containerElem);
            }
        });
    });

    return eventEmitter;
};
