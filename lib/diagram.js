var pegRd = require('./peg-rd');
var rdOptimizeLoops = require('./rd-optimize-loops');
var rdToString = require('./rd-string');

function diagramRd(expr) {
  expr = rdOptimizeLoops(expr);
  expr = rdToString(expr);
  return expr;
}

module.exports = function(expr) {
  expr = pegRd(expr);
  return diagramRd(expr);
}

module.exports.diagramRd = diagramRd;
