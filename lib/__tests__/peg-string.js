jest.autoMockOff();

var fs = require('fs');
var parse = require('pegjs').parser.parse;
var pegToString = require('../peg-string');

var dir = 'node_modules/pegjs/examples/';
var pegs = fs.readdirSync(dir);

describe('Translate PEG AST to text', function() {
  pegs.forEach(function(f) {
    it('correctly translates ' + f, function() {
      var src = fs.readFileSync(dir + f, 'utf-8');
      var ast = parse(src);
      
      expect(parse(pegToString(ast))).toEqual(ast);
    });
  });
});
