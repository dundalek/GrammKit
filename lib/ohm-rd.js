/* eslint-disable no-unused-vars */
var ohm = require('ohm-js');
var whitescape = require('whitescape');
var rd = require('./rd');

var actionDict = {
  Grammars: function(grammars) {
    return grammars.rd();
  },
  Grammar: function(name, superGrammar, open, rules, close) {
    return {
      name: name.sourceString + superGrammar.rd(),
      type: 'Grammar',
      arguments: rules.rd()
    };
  },
  SuperGrammar: function(_, ident) {
    return ` (extends ${ident.sourceString})`;
  },
  Rule_define: function(a, b, c, d, e) {
    return {
      name: a.rd() + (b.sourceString ? ' ' + b.sourceString : ''),
      diagram: rd.Diagram(e.rd())
    };
  },
  Rule_override: function(a, b, d, e) {
    return {
      name: a.rd() + (b.sourceString ? ' ' + b.sourceString : ''),
      diagram: rd.Diagram(e.rd())
    };
  },
  Rule_extend: function(a, b, d, e) {
    return {
      name: a.rd() + (b.sourceString ? ' ' + b.sourceString : ''),
      diagram: rd.Diagram(rd.Choice(0, e.rd(), rd.NonTerminal(a.sourceString + ' (inherited)')))
    };
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
    return [a.rd()].concat(c.rd()||[]);
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
  Pred_not: function(a, b) {
    return rd.Optional(rd.Sequence(rd.End(), b.rd()), 'skip');
  },
  Pred_lookahead: function(a, b) {
    return b.rd();
  },
  Lex_lex: function(a, b) {
    // maybe prepend a node signyfing whitespace?
    return b.rd();
  },
  Base_application: function(a, b) {
    return rd.NonTerminal(a.rd() + b.sourceString);
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
  TopLevelTerm_inline: function(a, b) {
    return a.rd();
  },
  TopLevelTerm: function(a) {
    return a.rd();
  },
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
