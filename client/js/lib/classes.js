function addClass(elem, name, add){
    var output = elem.className.toString().replace(/^\s+|\s+$/g, '').replace(/\s+/g, ' ').split(' ');
    if (add === false){
        output = output.filter(function(v){return v !== name;});
    } else {
        output.push(name);
    }
    elem.className = output.join(' ');
    return add === false ? false : true;
}

function removeClass(elem, name){
    return addClass(elem, name, false);
}

function siblingsAddClass(elems, addToElem, name, outgoingElemCallback){
    return Array.prototype.slice.call(elems).forEach(function(elem){
        if (outgoingElemCallback && elem !== addToElem && hasClass(elem, name)){
            return outgoingElemCallback(elem, function(){
                return addClass(elem, name, false);
            });
        }
        return addClass(elem, name, elem === addToElem);
    });
}

function hasClass(elem, name){
    return !!(elem.className && elem.className.indexOf(name) > -1);
}

function toggleClass(elem, name){
    return addClass(elem, name, !hasClass(elem, name));
}

module.exports = {
    addClass: addClass,
    removeClass: removeClass,
    hasClass: hasClass,
    toggleClass: toggleClass,
    siblingsAddClass: siblingsAddClass
};
