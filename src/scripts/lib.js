export function eachMatrix(matrix, fn, context) {
  let y = 0;
  const lenY = matrix.length;
  for (; y < lenY; y++) {
    let x = 0;
    const lenX = matrix[y].length;
    for (; x < lenX; x++) {
      fn.call(context || this, matrix[y], y, matrix[y][x], x);
    }
  }
}

export function DeepCopy(oldObj) {
  let newObj = oldObj;
  if (oldObj && typeof oldObj === "object") {
    newObj =
      Object.prototype.toString.call(oldObj) === "[object Array]" ? [] : {};
    for (let i in oldObj) {
      if (oldObj.hasOwnProperty(i)) {
        newObj[i] = DeepCopy(oldObj[i]);
      }
    }
  }
  return newObj;
}

//+ Jonas Raoni Soares Silva
//@ http://jsfromhell.com/array/shuffle [v1.0]
export function shuffle(o) {
  //v1.0
  let j,
    x,
    i = o.length;
  for (
    ;
    i;
    j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x
  ) {}
  return o;
}

Number.prototype.formatMoney = function (x, y, z) {
  let n = this;
  const c = isNaN((x = Math.abs(x))) ? 2 : x,
    d = y === undefined ? "." : y,
    t = z === undefined ? "," : z,
    s = n < 0 ? "-" : "",
    i = parseInt((n = Math.abs(+n || 0).toFixed(c))) + "";
  let j = i.length;
  j = j > 3 ? j % 3 : 0;
  return (
    s +
    (j ? i.substr(0, j) + t : "") +
    i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) +
    (c
      ? d +
        Math.abs(n - i)
          .toFixed(c)
          .slice(2)
      : "")
  );
};

export function formatNumber(num) {
  const thinsp = " "; // thin space
  return (+num).formatMoney(0, "", thinsp);
}
