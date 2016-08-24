#!/usr/bin/env node

var path = require('path');
var fs = require('fs');

var program = require('commander');
var handlebars = require('handlebars');

var parse = require('pegjs/lib/parser').parse;
var grammkit = require('./grammkit');

var version = require('./package.json').version;

var getHtml = function (svg,title) {
	var raw_template = fs.readFileSync(path.join(__dirname, 'template', 'viewer.html'));
	var data = {
		title: title,
		style: fs.readFileSync(path.join(__dirname, 'template','style.css'),  'utf-8'),
    svg: svg
	};
	var template = handlebars.compile(raw_template.toString());
	return template(data);
}

program
	.version(version)
  .usage('[options] <grammer_file>')
	.option('-o, --output <output>', 'output file', null)
	.option('-g, --grammer <format>', '"pegjs" or "ebnf". Defaults to pegjs', 'pegjs')
  .option('--html', 'generate html file for viewing in a browser')
  .parse(process.argv);

var input = program.args[0] || null;

if (!input) {
	console.error('ERROR: Missing a required input grammer file.');
	console.log(program.help());
	process.exit(1)
}

var p = path.parse(input);
var title = p.base;

if (program.output === null) {
	p.dir = '.';
	p.ext = program.html ? '.html':'.svg';
	delete p.base;
	program.output = path.format(p);
}

var grammar = parse(fs.readFileSync(input, 'utf-8'));
var svg = grammkit.diagram(grammar.rules[0]);

if (program.html) {
	fs.writeFileSync(program.output, getHtml(svg, title), 'utf-8');	
} else {
	fs.writeFileSync(program.output, svg, 'utf-8');
}
