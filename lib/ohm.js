var fs = require('fs');
var ohm = require('ohm-js');

var input;
// input = fs.readFileSync('src/ohm-grammar.ohm', 'utf-8');
input = `Arithmetic {
  Exp
    = AddExp

  AddExp
    = AddExp "+" PriExp  -- plus
    | AddExp "-" PriExp  -- minus
    | PriExp

  PriExp
    = "(" Exp ")"  -- paren
    | number

  number
    = digit+
}`

// Laugh {
//   laugh = lol | "lmao"
//   lol = "l" "o"+ "l"
// }
// `;


var ast = ohm.extras.toAST(ohm.ohmGrammar.match(input));

fs.writeFileSync('ast.json', JSON.stringify(ast, null, 2));
