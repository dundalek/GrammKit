var React = require('react/addons');
var request = require('browser-request');
var debounce = require('debounce');
var cx = require('classnames');

var parse = require('pegjs/lib/parser').parse;
var parseEbnf = require('../lib/parse-ebnf.pegjs').parse;
var diagram = require('../lib/diagram');
var getReferences = require('../lib/peg-references');

var diagramOhm = require('../lib/ohm-rd.js');

var examples = require('./examples.json');
var exampleGrammar = examples[0].source;
examples = examples.slice(1);

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

var App = React.createClass({
  mixins: [
    React.addons.LinkedStateMixin
  ],

  formats: {
    pegjs: 'PEG.js',
    ebnf: 'EBNF',
    ohm: 'Ohm',
  },

  componentWillMount() {
    this.updateGrammarDebounced = debounce(this.updateGrammar, 150).bind(this);
    if (location.hash) {
      var hash = location.hash.replace(/^#/, '');
      if (hash.match(/^https?:\/\/|\.\//)) {
        this.loadGrammar(hash);
      } else {
        this.updateGrammar(decodeURIComponent(hash));
      }
    } else {
      this.updateGrammar(exampleGrammar);
    }
  },

  getInitialState() {
    return {
      examples: examples,
      grammarAst: {rules: [], references: []},
      format: 'auto',
      detectedFormat: null
    };
  },

  render() {
    var e = this.state.syntaxError;
    var { format, detectedFormat } = this.state;
    var { references, rules } = this.state.grammarAst;

    return (
      <div>
        <div className="col-md-6">
          <div className={cx('load-input', 'row', {'has-error': this.state.loadError})}>
            <form onSubmit={this.onLoadGrammar}>
              <div className="col-md-8 col-sm-8 col-xs-7">
                <input className="form-control" type="text" valueLink={this.linkState('link')}  placeholder="e.g. http://server.com/grammar.pegjs" />
              </div>
              <button className="btn btn-primary col-md-3 col-sm-3 col-xs-4" type="submit" disabled={this.state.loading}>
                {this.state.loading ? 'Loading...' : 'Load Grammar'}
              </button>
            </form>
          </div>
          <p className="load-examples">
            Format:{" "}
            <select value={format} onChange={this.onChangeFormat}>
              <option value="auto">Auto-detect</option>
              {Object.keys(this.formats).map(k =>
                <option key={k} value={k}>{this.formats[k]}</option>
              )}
            </select>
            {format === 'auto' && !!detectedFormat &&
            <span> Detected: {this.formats[detectedFormat]}</span>}
          </p>
          <div className="load-examples">
            Try some examples:
            {this.state.examples.map(example =>
              <a href={'#'+example.link} onClick={this.onSwitchGrammar.bind(this, example.link, example.format)}>{example.name}</a>
            )}
          </div>
          {this.state.loadError && <div className="alert alert-danger">
            {this.state.loadError}
          </div>}

          <div className={cx({'has-error': this.state.syntaxError})}>
            <textarea className="form-control grammar-edit" value={this.state.grammar} onChange={this.onChangeGrammar} />
            {this.state.syntaxError && <pre className="alert alert-danger">
              {e.name} on line {e.line}, column {e.column}:{'\n'}
              {new Array(e.column).join(' ')}|{'\n'}
              {e.lineCode}{'\n\n'}
              {e.message}
            </pre>}
          </div>
        </div>

        <div className="col-md-6">
          {rules.map(rule =>
            <div>
              <h3 id={rule.name}>{rule.name}</h3>
              <div dangerouslySetInnerHTML={{__html: rule.diagram}} onClick={this.onClickDiagram} />
              {references[rule.name] && references[rule.name].usedBy.length > 0 && <div>
                Used By: {references[rule.name].usedBy.map(rule =>
                  <a href={'#' + rule}> {rule} </a>
                )}
              </div>}
              {references[rule.name] && references[rule.name].references.length > 0 && <div>
                References: {references[rule.name].references.map(rule =>
                  <a href={'#' + rule}> {rule} </a>
                )}
              </div>}
            </div>
          )}
        </div>
      </div>
    );
  },

  onChangeGrammar(ev) {
    this.setState({grammar: ev.target.value});
    this.updateGrammarDebounced(ev.target.value);
  },

  onSwitchGrammar(link, format, ev) {
    this.loadGrammar(link, format);
  },

  onLoadGrammar(ev) {
    ev.preventDefault();
    this.loadGrammar(this.state.link);
  },

  onClickDiagram(ev) {
    // if the node was clicked then go to rule definition
    if (ev.target.tagName === 'text') {
      location.hash = ev.target.textContent;
    }
  },

  onChangeFormat(ev) {
    this.updateGrammar(this.state.grammar, ev.target.value);
  },

  updateGrammar(grammar, format) {
    format = format || this.state.format;
    var state = {
      grammar: grammar,
      syntaxError: null,
      format,
      detectedFormat: null
    };

    switch (format) {
      case 'auto':
      case 'pegjs':
        try {
          state.grammarAst = processPeg(parse(grammar));
          state.detectedFormat = 'pegjs';
          return this.setState(state);
        } catch (e) {
          if (format !== 'auto') {
            e.lineCode = grammar.split('\n')[e.line-1];
            state.syntaxError = e;
            return this.setState(state);
          }
        }
      case 'ebnf':
        try {
          state.grammarAst = processPeg(parseEbnf(grammar));
          state.detectedFormat = 'ebnf';
          return this.setState(state);
        } catch (e) {
          if (format !== 'auto') {
            state.syntaxError = e;
            return this.setState(state);
          }
        }
      case 'ohm':
      try {
        var rules = diagramOhm(grammar)[0].arguments.map(function(rule) {
          return {
            name: rule.name,
            diagram: diagram.diagramRd(rule.diagram)
          };
        });
        state.grammarAst = {rules, references: []};
        state.detectedFormat = 'ohm';
        return this.setState(state);
      } catch (e) {
        if (format !== 'auto') {
          state.syntaxError = e;
          return this.setState(state);
        }
      }
    }
  },

  loadGrammar(link, format) {
    format = format || 'auto';
    link = link.trim().replace(/^https?:\/\/github.com\/|https?:\/\/raw.githubusercontent.com\//, 'https://cdn.rawgit.com/');
    location.hash = link;
    this.setState({
      link: link,
      grammar: '',
      rules: [],
      loading: true,
      loadError: null,
      format,
      detectedFormat: null
    });
    request(link, function(er, response, body) {
      this.setState({loading: false})
      if (er || response.status !== 200) {
        this.setState({loadError: '' + (er || body)});
      } else {
        this.updateGrammar(body, format);
      }
    }.bind(this))
  }
});

module.exports = App;
