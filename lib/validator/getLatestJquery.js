var request = require('request');

var RE_VERSIONS = /(\d{1,2})\.(\d{1,2})\.?(\d{1,2})?/;

function createVersionObj(versionStr) {
    var items = versionStr.match(RE_VERSIONS);
    var res = {
        major: parseInt(items[1], 10) || 0,
        minor: parseInt(items[2], 10) || 0,
        patch: parseInt(items[3], 10) || 0
    };

    res.sortKey = [format(res.major), format(res.minor), format(res.patch)].join('') * 1;
    return res;
}

function unique(v, i, arr) {
    return arr.lastIndexOf(v) === i;
}

function format(num) {
    return num > 9 ? '' + num : '0' + num;
}


function reverseBySortKey(a, b){return a.sortKey < b.sortKey ? 1 : -1;}
function orderBySortKey(a, b) { return a.sortKey > b.sortKey ? 1 : -1;}

var RE_LETTER = /[a-z]+/gim;
function filterTags(tags) {
    tags = tags.map(function (o) {
        return o.name;
    })
    .filter(function (name) {
        return !name.match(RE_LETTER); // ignore beta releases etc
    })
    .map(createVersionObj).sort(orderBySortKey);

    // get majors, e.g. [1, 2]
    var major = tags.map(function (v) { return v.major;}).filter(unique);

    // get latest 2 versions from majors
    var correctTags = major.map(function (version) {
        var match;
        tags.sort(reverseBySortKey).some(function (o) {
            if (!match && o.major === version) {
                match = o;
                return true;
            }
        });
        return match;
    });

    return correctTags;
}

function getLatest(cb) {
    request('https://api.github.com/repos/jquery/jquery/tags', function (err, res, body) {
        var data;
        try {
            data = JSON.parse(body);
            data = filterTags(data);
        } catch (e) {
            // abit dirty
            console.log('Failed parsning github jquery tags', e);
            throw e;
        }
        //console.log('data:', data);
        cb(data);
    });
}

module.exports = {
    getLatest: getLatest,
    createVersionObj: createVersionObj
};

// function toArr(o) {
//     return [o.major, o.minor, o.patch];
// };

// function diff(xo, yo) {
//     var x = toArr(xo),
//         y = toArr(yo);
//     for (var i = 0; i < 3; i++) {
//         if (x[i] > y[i]) {
//             return 1;
//         }
//         if (y[i] > x[i]) {
//             return -1;
//         }
//     }
//     return 0;
// }