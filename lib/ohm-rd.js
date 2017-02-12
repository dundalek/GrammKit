var ohm = require('ohm-js');
var whitescape = require('whitescape');
var rd = require('./rd');

function diagram(expr) {
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

var actionDict = {
  Grammars: function(grammars) {
    return grammars.rd();
  },
  Grammar: function(a, b, c, d, e) {
    return {
      type: 'Grammar',
      arguments: d.rd()
    };
  },
  Rule_define: function(a, b, c, d, e) {
    return {
      name: a.rd(),
      diagram: rd.Diagram(e.rd())
    }
  },
  RuleBody: function(a, b) {
    return rd.Choice.apply(null, [0].concat(b.rd()));
  },
  Alt: function(a) {
    return rd.Choice.apply(null, [0].concat(a.rd()));
  },
  Seq: function(a) {
    return rd.Sequence.apply(null, a.rd());
  },
  NonemptyListOf: function(a, b, c) {
    // return [];
    return [a.rd()].concat(c.rd()||[]);
  },
  Base_application: function(a, b) {
    return rd.NonTerminal(a.rd());
  },
  Base_range: function(a, b, c) {
    return rd.Terminal(a.rd() + ' .. ' + c.rd())
  },
  Base_terminal: function(a) {
    return rd.Terminal(a.rd());
  },
  Base_paren: function(a, b, c) {
    return b.rd();
  },
  // Base: function(a) {
  //   // return a._node
  //   return a.rd();
  // },
  TopLevelTerm_inline: function(a, b) {
    return a.rd();
  },
  TopLevelTerm: function(a) {
    return a.rd();
  },
  Iter_star: function(a, b) {
    return rd.ZeroOrMore(a.rd());
  },
  Iter_plus: function(a, b) {
    return rd.OneOrMore(a.rd());
  },
  Iter_opt: function(a, b) {
    return rd.Optional(a.rd());
  },
  // Iter: function(a) {
  //   return {Iter: a.rd()};
  // },
  Pred_not: function(a, b) {
    return rd.Optional(rd.Sequence(rd.End(), b.rd()), 'skip');
  },
  Pred_lookahead: function(a, b) {
    return b.rd();
  },
  // Pred: function(a) {
  //   // return Object.keys(a);
  //   return {'Pred': a.rd()}
  // },
  // Lex: function(a) {
  //   // return a._node;
  //   return {Lex: a.rd()};
  //   // return {Lex: 'abc'};
  // },
  // Lex_lex: function(a, b) {
  //   return {Lex_lex: b.rd()};
  // },
  terminal: function(a, b, c) {
    return whitescape(this.sourceString.slice(1, -1));
  },
  name: function(a, b) {
    return this.sourceString;
  },
  _terminal: function() {
    return this.sourceString;
  }
};

var grammar = ohm.ohmGrammar;
var semantics = grammar.createSemantics().addOperation('rd', actionDict);

module.exports = function diagram(source) {
  var m = grammar.match(source);
  if (m.succeeded()) {
    return semantics(m).rd();
  } else {
    throw m.message;
  }
}
