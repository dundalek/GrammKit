var jsesc = require('jsesc');

function escape(arg) {
  return jsesc(arg, {
    quotes: 'single',
    wrap: 'true'
  });
}

function wrap(str) {
  if (str[str.length - 1] === '}') {
    return '(' + str + ')';
  }
  return str;
}

module.exports = function convert(expr) {
  switch (expr.type) {
    case 'grammar':
      var out = [];
      if (expr.initializer) {
        out.push('{' + expr.initializer.code + '}\n\n');;
      }
      out.push(expr.rules.map(convert).join('\n\n'));
      return out.join('');
    
    case 'rule':
      // rules = expression
      var named = '';
      var rExpr = expr.expression;
      if (rExpr.type === 'named') {
        named = ' ' + escape(rExpr.name);
        rExpr = rExpr.expression;
      }
      if (rExpr.type === 'choice') {
        return expr.name + named + '\n  = ' + rExpr.alternatives.map(convert).join('\n  / ');
      }
      return expr.name + named + ' = ' + convert(rExpr);
    
    case 'text':
      // $expression
      return '$' + convert(expr.expression);
    case 'labeled':
      // label : expression
      return expr.label + ':' + wrap(convert(expr.expression));

    // case 'named':
    //   // rule "name" = expression
    case 'action':
      // expression {action}
      return convert(expr.expression) + ' {' + expr.code + '}';
    
    case 'sequence':
      // expression1 expression2 ...
      return '(' + expr.elements.map(convert).join(' ') + ')';
    
    case 'choice':
      // expression1 / expression2 / ...
      return '(' + expr.alternatives.map(convert).join(' / ') + ')';
    
    case 'optional':
      // expression ?
      return wrap(convert(expr.expression)) + '?';
    
    case 'zero_or_more':
      // expression *
      return wrap(convert(expr.expression)) + '*';
    
    case 'one_or_more':
      // expression +
      return wrap(convert(expr.expression)) + '+';
    
    case 'rule_ref':
      // rule
      return expr.name;
    
    case 'literal':
      // 'literal'
      return escape(expr.value) + (expr.ignoreCase ? 'i' : '');
    
    case 'class':
      // [characters]
      return expr.rawText;
    
    case 'any':
      // wildcard
      // .
      return '.';
    
    case 'simple_and':
      // lookahead
      // & expression
      return '&' + convert(expr.expression);
    
    case 'simple_not':
      // negative lookahead
      // ! expression
      return '!' + convert(expr.expression);
    
    case 'semantic_and':
      // predicate lookahead
      // & { predicate }
      return '&{' + expr.code + '}';
      
    case 'semantic_not':
      // negative predicate lookahead
      // ! { predicate }
      return '!{' + expr.code + '}';
  }
  var msg = 'Unknown expression:' + expr.type;
  console.log(msg, expr);
  return JSON.stringify(expr, null, 2);
};
