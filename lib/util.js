var parse = require('pegjs/lib/parser').parse;
var parseEbnf = (typeof process !== 'undefined') && (typeof process.versions.node !== 'undefined')
                ? require('pegjs').generate(require('fs').readFileSync(require('path').join(__dirname, './parse-ebnf.pegjs'), 'utf-8')).parse
                : require('./parse-ebnf.pegjs').parse;
var diagram = require('../lib/diagram');
var getReferences = require('../lib/peg-references');

var parseAbnf = require('./parse-abnf').parse;

var diagramOhm = require('../lib/ohm-rd');
var getReferencesOhm = require('../lib/ohm-references');

function processPeg(grammarAst) {
  var rules = grammarAst.rules.map(function(rule) {
    return {
      name: rule.name,
      diagram: diagram(rule)
    };
  });
  var references = getReferences(grammarAst);
  return {
    references,
    rules
  };
}

exports.transform = function transform(grammar, format) {
  format = format || 'auto';

  switch (format) {
    case 'auto':
    case 'pegjs':
      try {
        return {
          procesedGrammars: [processPeg(parse(grammar))],
          detectedFormat: 'pegjs',
        };
      } catch (e) {
        if (format !== 'auto') {
          e.lineCode = grammar.split('\n')[e.line-1];
          throw e;
        }
      }
    case 'ebnf':
      try {
        return {
          procesedGrammars: [processPeg(parseEbnf(grammar))],
          detectedFormat: 'ebnf',
        };
      } catch (e) {
        if (format !== 'auto') {
          throw e;
        }
      }
    case 'abnf':
      try {
        var rules = parseAbnf(grammar);
        return {
          procesedGrammars: [{
            rules: rules.map(rule => ({
              name: rule.name,
              diagram: diagram.diagramRd(rule.diagram)
            })),
            name: '',
            references: []
          }],
          detectedFormat: 'abnf',
        };
      } catch (e) {
        if (format !== 'auto') {
          throw e;
        }
      }
    case 'ohm':
    try {
      var references = getReferencesOhm(grammar);
      var procesedGrammars = diagramOhm(grammar).map((grammar, i) => {
        var rules = grammar.arguments.map(function(rule) {
          return {
            name: rule.name,
            diagram: diagram.diagramRd(rule.diagram)
          };
        });

        return {
          rules,
          name: grammar.name,
          references: references[i]
        };
      });
      return {
        procesedGrammars,
        detectedFormat: 'ohm',
      };
    } catch (e) {
      if (format !== 'auto') {
        throw e;
      }
    }
  }

  throw 'Could not auto-detect a format.';
}

exports.formatError = function formatError(e) {
  var errorMessage = '';
  if (e) {
    if (e.stack) {
      return e.stack;
    }
    if (e.name) {
      errorMessage += e.name;
      if (e.line && e.column) {
        errorMessage += ` on line ${e.line}, column ${e.column}`;
      }
      errorMessage += ':\n';
    }
    if (e.column && e.lineCode) {
      errorMessage += new Array(e.column).join(' ') + '\u2193\n'
      errorMessage += e.lineCode + '\n';
    }
    if (errorMessage) {
      errorMessage += '\n';
    }
    errorMessage += e.message ? e.message : e;
  }

  return errorMessage;
};
