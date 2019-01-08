var whitescape = require('whitescape');
var rd = require('./rd');
var escape = function(char){
switch(char){
    case '\b': return '\\b';
    case '\f': return '\\f';
    case '\n': return '\\n';
    case '\r': return '\\r';
    case '\t': return '\\t';
    case '\v': return '\\v';
    default: return char;
  }
};

module.exports = function diagram(expr) {
  var inverted, ignoreCase, rawText;
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
      inverted = expr.inverted ? '^' : '';
      ignoreCase = expr.ignoreCase ? 'i' : '';
      rawText = '['+inverted+expr.parts.map(escape).join("")+']'+ignoreCase;
      return rd.Terminal(rawText);

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
