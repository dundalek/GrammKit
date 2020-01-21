/* eslint-disable no-unused-vars */
var ohm = require('ohm-js');

function handleRule(name, formals, desc, op, body) {
  return {
    name: name.sourceString,
    references: Object.keys(mergeObjects(body.ref()))
  };
}

function handlePostfixOp(e, op) {
  return e.ref();
}

function handlePrefixOp(op, e) {
  return e.ref();
}

function mergeObjects(arr) {
  return Object.assign.apply(null, [{}].concat(arr));
}

var actionDict = {
  Grammars(grammars) {
    return grammars.ref();
  },
  Grammar(name, superGrammar, open, rules, close) {
    rules = rules.ref().reduce((ret, {name, references}) => {
      ret[name] = {
        references: references,
        usedBy: {}
      }
      return ret;
    }, {});

    for (name in rules) {
      rules[name].references.forEach(used => {
        if (used in rules) {
          rules[used].usedBy[name] = true;
        }
      });
    }
    for (name in rules) {
      rules[name].usedBy = Object.keys(rules[name].usedBy);
    }

    return rules;
  },
  RuleBody(_, termList) {
    return termList.asIteration().ref();
  },
  Rule_define: handleRule,
  Rule_override(name, formals, op, body) {
    return handleRule(name, formals, null, op, body);
  },
  Rule_extend(name, formals, op, body) {
    return handleRule(name, formals, null, op, body);
  },
  TopLevelTerm_inline(seq, _) {
    return seq.ref();
  },
  Alt(list) {
    return mergeObjects(list.asIteration().ref());
  },
  Seq(iter) {
    return mergeObjects(iter.ref());
  },
  NonemptyListOf(a, b, c) {
    return [a.ref()].concat(c.ref()||[]);
  },
  Base_range(a, b, c) {
    return {};
  },
  Base_application(a, b) {
    var obj = {};
    obj[a.sourceString] = true;
    return obj;
  },
  Base_terminal(_) {
    return {};
  },
  Base_paren(open, alt, close) {
    return alt.ref();
  },
  Iter_star: handlePostfixOp,
  Iter_plus: handlePostfixOp,
  Iter_opt: handlePostfixOp,

  Pred_not: handlePrefixOp,
  Pred_lookahead: handlePrefixOp,
  Lex_lex: handlePrefixOp,
};

var grammar = ohm.ohmGrammar;
var semantics = grammar.createSemantics().addOperation('ref', actionDict);

module.exports = function references(source) {
  var m = grammar.match(source);
  if (m.succeeded()) {
    return semantics(m).ref();
  } else {
    throw m.message;
  }
}
