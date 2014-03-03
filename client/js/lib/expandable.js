var domready = require('domready');
var events = require('dom-events');
var klasses = require('./classes.js');
var addClass = klasses.addClass;
var removeClass = klasses.removeClass;

function toList(list){
    return Array.prototype.slice.call(list);
}

function findParentTag(item, name, cb){
    if (!item || !item.parentNode){
        return null;
    }
    if (item.parentNode.tagName.toUpperCase() === name.toUpperCase()){
        if (cb) {
            cb(item.parentNode);
        }
        return item.parentNode;
    }
    return findParentTag(item.parentNode, name, cb);
}

module.exports = function(clickElems){

    toList(clickElems).forEach(function(elem){
        events.on(elem, 'click', clickHandler);
    });

    function clickHandler(event){
        var elem = this;
        var tagName = elem.getAttribute('data-tag-name')||'li';
        findParentTag(elem, tagName, function(list){
            var added = klasses.toggleClass(list, 'expanded-state');
            klasses.addClass(elem, 'expanded-state-button', added);
        });
    }
};

