var utils = require("pegjs/lib/utils");

module.exports = function(ast) {
  function nop() {}

  function checkExpression(node) { check(node.expression); }

  function checkSubnodes(propertyName) {
    return function(node) { utils.each(node[propertyName], check); };
  }

  var check = utils.buildNodeVisitor({
    grammar:      checkSubnodes("rules"),
    rule:         checkExpression,
    named:        checkExpression,
    choice:       checkSubnodes("alternatives"),
    action:       checkExpression,
    sequence:     checkSubnodes("elements"),
    labeled:      checkExpression,
    text:         checkExpression,
    simple_and:   checkExpression,
    simple_not:   checkExpression,
    semantic_and: nop,
    semantic_not: nop,
    optional:     checkExpression,
    zero_or_more: checkExpression,
    one_or_more:  checkExpression,

    rule_ref:
      function(node) {
        var refRule = rules[ruleName] = rules[ruleName] || {references: {}, usedBy: {}};
        refRule.references[node.name] = true;
        var usedRule = rules[node.name] = rules[node.name] || {references: {}, usedBy: {}};
        usedRule.usedBy[ruleName] = true;
      },

    literal:      nop,
    "class":      nop,
    any:          nop
  });

  var rules = {};
  var ruleName;
  if (ast.rules) {
    ast.rules.forEach(function(rule) {
      ruleName = rule.name;
      check(rule);
    });
    for (var name in rules) {
      rules[name] = {
        references: Object.keys(rules[name].references),
        usedBy: Object.keys(rules[name].usedBy)
      };
    }
  }
  return rules;
};
