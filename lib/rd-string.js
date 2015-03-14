var rd = require('railroad-diagrams');

function compile(expr) {
  var args = expr.arguments ? expr.arguments.map(compile) : [];
  if (expr.type) {
    return rd[expr.type].apply(null, args);
  }
  return expr;
}

module.exports = function(expr) {
  return compile(expr).toString();
};
