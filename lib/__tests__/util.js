const { transform } = require('../util');

describe('Transform', function() {

  it('parses pegjs', function() {
    const result = transform('Start = (A / B)+\nA = "a"\nB = "b"\n', "pegjs");
    expect(result.procesedGrammars[0].rules.map(x => x.name)).toEqual(["Start", "A", "B"]);
    expect(result.procesedGrammars[0].references.Start.references).toEqual(["A", "B"]);
  });

  it('parses ebnf', function() {
    const result = transform("Start ::= (A | B)+\nA ::= 'a'\nB ::= 'b'", "ebnf");
    expect(result.procesedGrammars[0].rules.map(x => x.name)).toEqual(["Start", "A", "B"]);
    expect(result.procesedGrammars[0].references.Start.references).toEqual(["A", "B"]);
  });

  it('parses ohm', function() {
    const result = transform('Test {\nStart = (A | B)+\nA = "a"\nB = "b"\n}', "ohm");
    expect(result.procesedGrammars[0].rules.map(x => x.name)).toEqual(["Start", "A", "B"]);
    expect(result.procesedGrammars[0].references.Start.references).toEqual(["A", "B"]);
  });

});
