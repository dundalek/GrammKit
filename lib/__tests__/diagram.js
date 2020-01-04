var grammkit = require('grammkit');
var pegRd = require('../peg-rd');
var parse = require('pegjs/lib/parser').parse;

describe('Diagram', function() {

  it('creates a diagram', function() {
    var grammar = parse('start = left ("+" / "-") right');
    expect(grammkit.diagram(grammar.rules[0])).toEqual(
`<svg class="railroad-diagram" width="301" height="92" viewBox="0 0 301 92">
<g transform="translate(.5 .5)">
<path d="M 20 21 v 20 m 10 -20 v 20 m -10 -10 h 20.5"></path>
<g>
<path d="M40 31h0"></path>
<path d="M260 31h0"></path>
<path d="M40 31h10"></path>
<g>
<path d="M50 31h0"></path>
<path d="M102 31h0"></path>
<rect x="50" y="20" width="52" height="22"></rect>
<text x="76" y="35">left</text>
</g>
<path d="M102 31h10"></path>
<g>
<path d="M112 31h0"></path>
<path d="M180 31h0"></path>
<path d="M112 31h20"></path>
<g>
<path d="M132 31h0"></path>
<path d="M160 31h0"></path>
<rect x="132" y="20" width="28" height="22" rx="10" ry="10"></rect>
<text x="146" y="35">+</text>
</g>
<path d="M160 31h20"></path>
<path d="M112 31a10 10 0 0 1 10 10v10a10 10 0 0 0 10 10"></path>
<g>
<path d="M132 61h0"></path>
<path d="M160 61h0"></path>
<rect x="132" y="50" width="28" height="22" rx="10" ry="10"></rect>
<text x="146" y="65">-</text>
</g>
<path d="M160 61a10 10 0 0 0 10 -10v-10a10 10 0 0 1 10 -10"></path>
</g>
<path d="M180 31h10"></path>
<g>
<path d="M190 31h0"></path>
<path d="M250 31h0"></path>
<rect x="190" y="20" width="60" height="22"></rect>
<text x="220" y="35">right</text>
</g>
<path d="M250 31h10"></path>
</g>
<path d="M 260 31 h 20 m -10 -10 v 20 m 10 -20 v 20"></path>
</g>
</svg>
`
    );
  });

  it('handles character class', function() {
    var grammar = parse("Atom = [^\\t\\n\\r ()]+");
    expect(pegRd(grammar.rules[0])).toEqual({
      "type": "Diagram",
      "arguments": [
        {
          "type": "OneOrMore",
          "arguments": [
            {
              "type": "Terminal",
              "arguments": [
                "[^\\t\\n\\r ()]"
              ]
            }
          ]
        }
      ]
    });
  });


});
