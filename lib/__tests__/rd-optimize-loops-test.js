jest.autoMockOff();

var rdOptimizeLoops = require('../rd-optimize-loops');

var cases = [
  { rule: 'rule1 = a (b a)*',
    ast: 
     { type: 'Sequence',
       arguments: 
        [ { type: 'NonTerminal', arguments: [ 'a' ] },
          { type: 'ZeroOrMore',
            arguments: 
             [ { type: 'Sequence',
                 arguments: 
                  [ { type: 'NonTerminal', arguments: [ 'b' ] },
                    { type: 'NonTerminal', arguments: [ 'a' ] } ] } ] } ] },
    result: 
     { type: 'Sequence',
       arguments: 
        [ { type: 'OneOrMore',
            arguments: 
             [ { type: 'Sequence',
                 arguments: [ { type: 'NonTerminal', arguments: [ 'a' ] } ] },
               { type: 'Sequence',
                 arguments: [ { type: 'NonTerminal', arguments: [ 'b' ] } ] } ] } ] } },
  { rule: 'rule2 = a b (c b)*',
    ast: 
     { type: 'Sequence',
       arguments: 
        [ { type: 'NonTerminal', arguments: [ 'a' ] },
          { type: 'NonTerminal', arguments: [ 'b' ] },
          { type: 'ZeroOrMore',
            arguments: 
             [ { type: 'Sequence',
                 arguments: 
                  [ { type: 'NonTerminal', arguments: [ 'c' ] },
                    { type: 'NonTerminal', arguments: [ 'b' ] } ] } ] } ] },
    result: 
     { type: 'Sequence',
       arguments: 
        [ { type: 'NonTerminal', arguments: [ 'a' ] },
          { type: 'OneOrMore',
            arguments: 
             [ { type: 'Sequence',
                 arguments: [ { type: 'NonTerminal', arguments: [ 'b' ] } ] },
               { type: 'Sequence',
                 arguments: [ { type: 'NonTerminal', arguments: [ 'c' ] } ] } ] } ] } },
  { rule: 'rule3 = a b (a b)*',
    ast: 
     { type: 'Sequence',
       arguments: 
        [ { type: 'NonTerminal', arguments: [ 'a' ] },
          { type: 'NonTerminal', arguments: [ 'b' ] },
          { type: 'ZeroOrMore',
            arguments: 
             [ { type: 'Sequence',
                 arguments: 
                  [ { type: 'NonTerminal', arguments: [ 'a' ] },
                    { type: 'NonTerminal', arguments: [ 'b' ] } ] } ] } ] },
    result: 
     { type: 'Sequence',
       arguments: 
        [ { type: 'OneOrMore',
            arguments: 
             [ { type: 'Sequence',
                 arguments: 
                  [ { type: 'NonTerminal', arguments: [ 'a' ] },
                    { type: 'NonTerminal', arguments: [ 'b' ] } ] },
               { type: 'Sequence', arguments: [] } ] } ] } },
  { rule: 'rule4 = a b (b c)*',
    ast: 
     { type: 'Sequence',
       arguments: 
        [ { type: 'NonTerminal', arguments: [ 'a' ] },
          { type: 'NonTerminal', arguments: [ 'b' ] },
          { type: 'ZeroOrMore',
            arguments: 
             [ { type: 'Sequence',
                 arguments: 
                  [ { type: 'NonTerminal', arguments: [ 'b' ] },
                    { type: 'NonTerminal', arguments: [ 'c' ] } ] } ] } ] },
    result: 
     { type: 'Sequence',
       arguments: 
        [ { type: 'NonTerminal', arguments: [ 'a' ] },
          { type: 'NonTerminal', arguments: [ 'b' ] },
          { type: 'ZeroOrMore',
            arguments: 
             [ { type: 'Sequence',
                 arguments: 
                  [ { type: 'NonTerminal', arguments: [ 'b' ] },
                    { type: 'NonTerminal', arguments: [ 'c' ] } ] } ] } ] } } ]

describe('Optimize loops', function() {

  cases.forEach(function(c) {
    it('optimizes loop displaying: ' + c.rule, function() {
      expect(rdOptimizeLoops(c.ast)).toEqual(c.result);
    });
  });

});

// var parse = require('pegjs').parser.parse;
// var pegRd = require('../peg-rd');
// 
// cases = cases.map(function(c) {
//   var rule = parse(str).rules[0].arguments[0];
//   var ast = pegRd(rule);
//   var result = rdOptimizeLoops(ast);
//   return {
//     rule: c.rule,
//     ast: ast,
//     result: result
//   };
// });
// 
// var util = require('util');
// console.log(util.inspect(cases, {depth: null})); 
