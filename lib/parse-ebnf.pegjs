/* 
 * Parse EBNF format defined here:
 * http://www.w3.org/TR/2004/REC-xml11-20040204/#sec-notation
 * Based on:
 * https://github.com/pegjs/pegjs/blob/master/src/parser.pegjs
 */

{
  var OPS_TO_SUFFIXED_TYPES = {
    "?": "optional",
    "*": "zero_or_more",
    "+": "one_or_more"
  };

  function extractList(list, index) {
    var result = new Array(list.length), i;

    for (i = 0; i < list.length; i++) {
      result[i] = list[i][index];
    }

    return result;
  }

  function buildList(first, rest, index) {
    return [first].concat(extractList(rest, index));
  }

  function location() {return null;}
}

Grammar = rules:(Rule __)+ {
      return {
        type:        "grammar",
        rules:       extractList(rules, 0),
        location:    location()
      };
    }

Rule = __ name:IdentifierName __ "::=" __ expression:Expression     {
      return {
        type:        "rule",
        name:        name,
        expression:  expression,
        location:    location()
      };
    }

Expression
  = ChoiceExpression

ChoiceExpression
  = first:SequenceExpression rest:(__ "|" __ SequenceExpression)* {
      return rest.length > 0
        ? {
            type:         "choice",
            alternatives: buildList(first, rest, 3),
            location:     location()
          }
        : first;
    }

SequenceExpression
  = first:SubtractExpression rest:(__ SubtractExpression)* {
      return rest.length > 0
        ? {
            type:     "sequence",
            elements: buildList(first, rest, 1),
            location: location()
          }
        : first;
    }

SubtractExpression
  = first:SuffixedExpression second:(__ '-' __ SuffixedExpression)? {
      return second !== null ? {
            type:     "sequence",
            elements: [
              {
                type: 'simple_not',
                expression: second[3]
              },
              first
            ],
            location: location()
       } : first;
    }
      
SuffixedExpression
  = expression:PrimaryExpression __ operator:SuffixedOperator {
      return {
        type:       OPS_TO_SUFFIXED_TYPES[operator],
        expression: expression,
        location:   location()
      };
    }
  / PrimaryExpression

SuffixedOperator
  = "?"
  / "*"
  / "+"

PrimaryExpression
  = LiteralMatcher
  / CharacterClassMatcher
  / RuleReferenceExpression
  / "(" __ expression:Expression __ ")" { return expression; }


RuleReferenceExpression
  = name:IdentifierName !(__ (StringLiteral __)? "::=") {
      return { type: "rule_ref", name: name, location: location() };
    }

LiteralMatcher "literal"
  = value:StringLiteral {
      return {
        type:       "literal",
        value:      value,
        location:   location()
      };
    }

/* ---- Lexical Grammar ----- */

SourceCharacter
  = .

IdentifierName = name:[a-zA-Z0-9_]+ {return name.join('')}

StringLiteral "string"
  = '"' chars:DoubleStringCharacter* '"' { return chars.join(""); }
  / "'" chars:SingleStringCharacter* "'" { return chars.join(""); }
  / UnicodeChar
  
DoubleStringCharacter
  = !('"') SourceCharacter { return text(); }

SingleStringCharacter
  = !("'") SourceCharacter { return text(); }

CharacterClassMatcher "character class"
  = "["
    inverted:"^"?
    parts:(ClassCharacterRange / ClassCharacter)*
    "]"
    {
      return {
        type:       "class",
        //parts:      filterEmptyStrings(parts),
        inverted:   inverted !== null,
        rawText:    text(),
        location:   location()
      };
    }

ClassCharacterRange
  = begin:ClassCharacter "-" end:ClassCharacter {
      return [begin, end];
    }

ClassCharacter
  = UnicodeChar
  / !("]") SourceCharacter { return text(); }

UnicodeChar = '#x' [A-Fa-f0-9]+ { return text(); }

Comment "comment"
  = MultiLineComment

MultiLineComment
  = "/*" (!"*/" SourceCharacter)* "*/"

__
  = (WhiteSpace / LineTerminatorSequence / Comment)*

WhiteSpace "whitespace"
  = "\t"
  / "\v"
  / "\f"
  / " "
  / "\u00A0"
  / "\uFEFF"

LineTerminator
  = [\n\r\u2028\u2029]

LineTerminatorSequence "end of line"
  = "\n"
  / "\r\n"
  / "\r"
  / "\u2028"
  / "\u2029"
