var rd = require('./rd');

module.exports = function diagram(expr) {
  if (typeof expr === 'string') {
    return rd.Terminal(expr.slice(1, -1)); // slice is for stripping quotes
  } else if (expr instanceof Array) {
    return rd.Sequence.apply(null, expr.map(diagram));
  }

  switch(expr.type) {
    case 'Rule_define':
      return rd.Diagram(diagram(expr[4]))

    case 'RuleBody':
      return rd.Choice.apply(null, [0].concat(expr[1].map(diagram)));

    case 'Base_application':
      return rd.NonTerminal(expr[0]);

    case 'TopLevelTerm_inline':
      return rd.Sequence.apply(null, expr[0].map(diagram));
  }

  var msg = 'Unknown expression: ' + expr.type;
  console.log(msg, expr);
  return rd.Terminal(msg);
}
