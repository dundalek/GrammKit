var pegRd = require('./peg-rd');
var rdOptimizeLoops = require('./rd-optimize-loops');
var rdToString = require('./rd-string');

module.exports = function(expr) {
  expr = pegRd(expr);
  expr = rdOptimizeLoops(expr);
  expr = rdToString(expr);
  return expr;
}
