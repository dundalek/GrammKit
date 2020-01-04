#!/usr/bin/env node

var path = require('path');
var fs = require('fs');

var program = require('commander');
var handlebars = require('handlebars');

// var grammkit = require('./grammkit');
var { transform, formatError } = require('./lib/util');
var version = require('./package.json').version;

var renderTemplate = function(data, templatePath) {
    var raw_template = fs.readFileSync(templatePath);
    var template = handlebars.compile(raw_template.toString());
    return template(data);
}

program
    .version(version)
    .usage('[options] <grammar_file>')
    .option('-f, --input-format <from>', 'input-format (auto|ebnf|ohm|pegjs) [default: auto]', /^(auto|ebnf|ohm|pegjs)$/, 'auto')
    .option('-t, --output-format <to>', 'output format (html|md) [default: html]', /^(html|md)$/, 'html')
    .option('-o, --output <output>', 'output file', null)
    .parse(process.argv);

var input = program.args[0] || null;

if (!input) {
    console.error('ERROR: Missing a required input grammar file.');
    console.log(program.help());
    process.exit(1)
}

var p = path.parse(input);
var title = p.base;

if (program.output === null) {
    p.dir = '.';
    p.ext = '.' + program.outputFormat;
    delete p.base;
    program.output = path.format(p);
}

var content = fs.readFileSync(input, 'utf-8');
try {
  var result = transform(content, program.inputFormat);
} catch (e) {
  console.log('Parsing error:\n' + formatError(e));
  process.exit(1);
}

var grammars = result.procesedGrammars.map(({ rules, references, name }) => {
  rules = rules.map(function(rule) {
    const ref = references[rule.name] || {};
    return {
      name: rule.name,
      diagram: rule.diagram,
      usedBy: ref.usedBy,
      references: ref.references
    };
  });

  return {
    name,
    rules
  };
});

var output, style, data;
if (program.outputFormat === 'html') {
  style = fs.readFileSync(path.join(__dirname, 'app', 'diagram.css'), 'utf-8') + '\n' + fs.readFileSync(path.join(__dirname, 'app', 'app.css'), 'utf-8')
  data = {
      title: title,
      style: style,
      grammars: grammars
  };
  output = renderTemplate(data, path.join(__dirname, 'template', 'viewer.html'));
} else if (program.outputFormat === 'md') {
  style = fs.readFileSync(path.join(__dirname, 'app', 'diagram.css'), 'utf-8')
  var svgPreamble = `<?xml version="1.0" standalone="no"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN"
  "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">`;
  var svgHeader = `<defs><style type="text/css"><![CDATA[ ${style} ]]></style></defs>`
  delete p.ext;
  var imageDir = path.format(p);
  data = {
      title: title,
      grammars: grammars,
      imageDir: imageDir
  };
  output = renderTemplate(data, path.join(__dirname, 'template', 'md.hbs'));
  try {
    fs.accessSync(imageDir)
  } catch (e) {
    fs.mkdirSync(imageDir);
  }
  [].concat.apply([], grammars.map(g => g.rules)).forEach(rule => {
    var fileOut = path.join(imageDir, rule.name + '.svg');
    var content = rule.diagram.replace(/<svg ([^>]*)>/, (match, a) => `${svgPreamble}\n<svg xmlns="http://www.w3.org/2000/svg" version="1.1" ${a}>\n${svgHeader}`)
    fs.writeFileSync(fileOut, content);
  })
}

fs.writeFileSync(program.output, output, 'utf-8');
console.log('Parsed ' + result.detectedFormat + ' grammar and generated ' + program.output);
