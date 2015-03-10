var rd = require('railroad-diagrams');

module.exports = function diagram(expr) {
  switch (expr.type) {
    case 'rule':
      return rd.Diagram(diagram(expr.expression));

    case 'text':
    case 'labeled':
    case 'named':
    case 'action':
      return diagram(expr.expression);

    case 'sequence':
      return rd.Sequence.apply(null, expr.elements.map(diagram));

    case 'choice':
      return rd.Choice.apply(null, [0].concat(expr.alternatives.map(diagram)));

    case 'optional':
      return rd.Optional(diagram(expr.expression));

    case 'zero_or_more':
      return rd.ZeroOrMore(diagram(expr.expression));

    case 'one_or_more':
      return rd.OneOrMore(diagram(expr.expression));

    case 'rule_ref':
      return rd.NonTerminal(expr.name);

    case 'literal':

      return rd.Terminal(expr.value);

    case 'class':
      return rd.Terminal(expr.rawText);
  }
  var msg = 'Unknown expression:' + expr.type;
  console.log(msg, expr);
  return rd.Terminal(msg);
};
