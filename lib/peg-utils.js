exports.stringifyClass = function stringifyClass(expr, escapeFn) {
  var rawText;
  if (expr.rawText) {
    rawText = expr.rawText;
  } else {
    var inverted = expr.inverted ? '^' : '';
    var ignoreCase = expr.ignoreCase ? 'i' : '';
    var body = expr.parts
      .map(x => typeof x === "string" ? x : x.join("-"))
      .map(escapeFn)
      .map(s => s.replace(/\[|\]/g, x => "\\" + x))
      .join("");
    rawText = '['+inverted+body+']'+ignoreCase;
  }
  return rawText;
}
