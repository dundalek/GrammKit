var rd = require('railroad-diagrams');
var whitescape = require('whitescape');

var rdAst = {};
var methods = Object.keys(rd).concat(['Start', 'End']);
methods.forEach(function(type) {
  rdAst[type] = function() {
    return {
      type: type,
      arguments: [].slice.call(arguments)
    };
  }
});
rd = rdAst;

module.exports = function diagram(expr) {
  switch (expr.type) {
    case 'rule':
      // rules = expression
      return rd.Diagram(diagram(expr.expression));

    case 'text':
      // $expression
    case 'labeled':
      // label : expression
    case 'named':
      // rule "name" = expression
    case 'action':
      // expression {action}
      return diagram(expr.expression);

    case 'sequence':
      // expression1 expression2 ...
      return rd.Sequence.apply(null, expr.elements.map(diagram));

    case 'choice':
      // expression1 / expression2 / ...
      return rd.Choice.apply(null, [0].concat(expr.alternatives.map(diagram)));

    case 'optional':
      // expression ?
      return rd.Optional(diagram(expr.expression));

    case 'zero_or_more':
      // expression *
      return rd.ZeroOrMore(diagram(expr.expression));

    case 'one_or_more':
      // expression +
      return rd.OneOrMore(diagram(expr.expression));

    case 'rule_ref':
      // rule
      return rd.NonTerminal(expr.name);

    case 'literal':
      // 'literal'
      return rd.Terminal(whitescape(expr.value));

    case 'class':
      // [characters]
      return rd.Terminal(expr.rawText);
    
    case 'any':
      // wildcard
      // .
      return rd.Terminal('[any character]');

    case 'simple_and':
      // lookahead
      // & expression
      return diagram(expr.expression);
    
    case 'simple_not':
      // negative lookahead
      // ! expression
      return rd.Optional(rd.Sequence(rd.End(), diagram(expr.expression)), 'skip');

    case 'semantic_and':
      // predicate lookahead
      // & { predicate }
      return rd.Terminal('[match:' + expr.code + ']');
      
    case 'semantic_not':
      // negative predicate lookahead
      // ! { predicate }
      return diagram({
        type: 'simple_not',
        expression: {type: 'class', rawText: '[match:' + expr.code + ']'}
      });
  }
  var msg = 'Unknown expression:' + expr.type;
  console.log(msg, expr);
  return rd.Terminal(msg);
};
