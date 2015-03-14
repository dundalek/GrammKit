var _ = require('lodash');

module.exports = function traverse(node) {
  if (node.type === 'Sequence') {
    var args = node.arguments.map(traverse);
    for (var i = 0; i < args.length; i += 1) {
      var n = args[i];
      if (n.type === 'ZeroOrMore' && n.arguments.length === 1 && n.arguments[0].type === 'Sequence') {
        var innerSeq = n.arguments[0].arguments.slice();
        var outerSeq = args.slice(0, i);
        var common = [];
        while (innerSeq.length && outerSeq.length) {
          var el;
          if (_.isEqual(innerSeq[innerSeq.length-1], outerSeq[outerSeq.length-1])) {
            common.unshift(innerSeq.pop());
            outerSeq.pop();
          } else {
            break;
          }
        }
        if (common.length) {
          args = outerSeq.concat([{
            type: 'OneOrMore',
            arguments: [{
              type: 'Sequence',
              arguments: common
            }, {
              type: 'Sequence',
              arguments: innerSeq.reverse()
            }]
          }], args.slice(i+1));
        }
      }
    }
    
    return {
      type: node.type,
      arguments: args
    };
  }
  
  if (node.arguments && node.arguments.length) {
    return {
      type: node.type,
      arguments: node.arguments.map(traverse)
    }
  }
  return node;
}
