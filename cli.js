#!/usr/bin/env node

var path = require('path');
var fs = require('fs');

var program = require('commander');
var handlebars = require('handlebars');

var parse = require('pegjs/lib/parser').parse;
var grammkit = require('./grammkit');
var getReferences = require('./lib/peg-references');

var version = require('./package.json').version;

var genHtml = function(title, rules) {
    var raw_template = fs.readFileSync(path.join(__dirname, 'template', 'viewer.html'));
    var data = {
        title: title,
        style: fs.readFileSync(path.join(__dirname, 'template', 'style.css'), 'utf-8'),
        rules: rules
    };
    var template = handlebars.compile(raw_template.toString());
    return template(data);
}


program
    .version(version)
    .usage('[options] <grammar_file>')
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
    p.ext = '.html';
    delete p.base;
    program.output = path.format(p);
}

var grammar = parse(fs.readFileSync(input, 'utf-8'));
var References = getReferences(grammar);
var rules = grammar.rules.map(function(rule) {
    const _ref = References[rule.name] || null;
    const usedBy = (_ref && _ref.usedBy) || null;
    const references = (_ref && _ref.references) || null;
    return {
        name: rule.name,
        diagram: grammkit.diagram(rule),
        usedBy: usedBy,
        references: references
    };
});

var html = genHtml(title, rules)

fs.writeFileSync(program.output, html, 'utf-8');
console.log('generated ' + program.output);