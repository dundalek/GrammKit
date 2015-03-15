var rd = require('railroad-diagrams');

var extra = {
  Start: function() {
    return rd.Diagram().items[0];
  },
  End: function() {
    return rd.Diagram().items[1];
  }
};

function compile(expr) {
  var args = expr.arguments ? expr.arguments.map(compile) : [];
  if (expr.type) {
    var method = extra[expr.type] || rd[expr.type];
    return method.apply(null, args);
  }
  return expr;
}

module.exports = function(expr) {
  return compile(expr).toString();
};
