// function pickRandomProperty(obj) {
//     var result;
//     var count = 0;

//     for (var prop in obj) {
//         if (obj.hasOwnProperty(prop)) {
//             if (Math.random() < 1 / ++count) {
//                result = prop;
//             }
//         }
//     }

//     return result;
// }



function eachMatrix(matrix, fn, context) {
    for (var y = 0, lenY = matrix.length; y < lenY; y++) {
        for (var x = 0, lenX = matrix[y].length; x < lenX; x++) {
            fn.call(context || this, matrix[y], y, matrix[y][x], x);
        }
    }
}



Array.prototype.each = function(fn, context) {
    for (var i = 0, len = this.length; i < len; i++) {
        fn.call(context || this, this[i], i);
    }
};



function DeepCopy(oldObj) {
    var newObj = oldObj;
    if (oldObj && typeof oldObj === 'object') {
        newObj = Object.prototype.toString.call(oldObj) === "[object Array]" ? [] : {};
        for (var i in oldObj) {
            if (oldObj.hasOwnProperty(i)) {
                newObj[i] = DeepCopy(oldObj[i]);
            }
        }
    }
    return newObj;
}



Object.prototype.clone = function() {
    return DeepCopy(this);
};



Array.prototype.clone = function() {
    return DeepCopy(this);
};



//+ Jonas Raoni Soares Silva
//@ http://jsfromhell.com/array/shuffle [v1.0]
function shuffle(o){ //v1.0
    for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
}



Number.prototype.formatMoney = function(x, y, z){
    var n = this,
    c = isNaN(x = Math.abs(x)) ? 2 : x,
    d = y === undefined ? "." : y,
    t = z === undefined ? "," : z,
    s = n < 0 ? "-" : "",
    i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "",
    j = (j = i.length) > 3 ? j % 3 : 0;
    return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
};



function formatNumber(num) {
    var thinsp = " "; // thin space
    return (+num).formatMoney(0, '', thinsp);
}