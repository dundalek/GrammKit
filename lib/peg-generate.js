var utils = require("pegjs/lib/utils");

module.exports = function(ast, startRule) {
  if (!ast.rules.length) return '';
  startRule = startRule || ast.rules[0].name;
  function nop() {}

  function generateExpression(node) { return generate(node.expression); }

  function checkSubnodes(propertyName) {
    return function(node) { utils.each(node[propertyName], check); };
  }

  function generateChoice(node) {
    return generate(pickRandom(node.alternatives));
  }
  
  function generateSequence(node) {
    return node.elements.map(generate).join('');
  }

  function generateRepeating(expression, num) {
    var out = [];
    for (var i = 0; i < num; i += 1) {
      out.push(generate(expression));
    }
    return out.join('');
  }

  function pickRandom(array) {
    var idx = Math.floor(array.length * Math.random());
    return array[idx];
  }
  
  function randomRange(a, b) {
    return a + Math.floor(Math.random() * b);
  }

  var generate = utils.buildNodeVisitor({
    //grammar:      checkSubnodes("rules"),
    rule:         generateExpression,
    named:        generateExpression,
    choice:       generateChoice,
    action:       generateExpression,
    sequence:     generateSequence,
    labeled:      generateExpression,
    text:         generateExpression,
    simple_and:   nop, //generateExpression,
    simple_not:   nop, //generateExpression,
    semantic_and: nop,
    semantic_not: nop,
    optional:     function(node) {
      return Math.random() < 0.5 ? generate(node.expression) : '';
    },
    zero_or_more: function(node) {
      return generateRepeating(node.expression, Math.floor(Math.random() * 5));
    },
    one_or_more:  function(node) {
      return generateRepeating(node.expression, Math.floor(Math.random() * 5) + 1);
    },

    rule_ref: function(node) {
      return generate(utils.findRuleByName(ast, node.name));
    },

    literal:      function(node) {
      // todo ignorecase
      return node.value;
    },
    "class":      function(node) {
      // todo node.inverted
      // todo node.ignoreCase
      // todo compute correct range distribution
      var part = pickRandom(node.parts);
      if (part instanceof Array) {
        return String.fromCharCode(randomRange(part[0].charCodeAt(0), part[1].charCodeAt(0)+1));
      }
      return part;
    },
    any:          function() {
      // todo return any character
      return String.fromCharCode(randomRange(32, 127));
    }
  });

  return generate(utils.findRuleByName(ast, startRule));
};
