var _ = require('lodash');
var React = require('react');
var createReactClass = require('create-react-class');
var request = require('browser-request');
var cx = require('classnames');

var { transform, formatError } = require('../lib/util');

var examples = require('./examples.json');
var exampleGrammar = examples[0].source;
examples = examples.slice(1);

var App = createReactClass({

  formats: {
    pegjs: 'PEG.js',
    ebnf: 'EBNF',
    ohm: 'Ohm',
  },

  handleChange(e) {
    const {name, value} = e.currentTarget;
    this.setState({[name]: value});
  },

  UNSAFE_componentWillMount() {
    this.updateGrammarDebounced = _.debounce(() => this.updateGrammar, 150);
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
      procesedGrammars: [],
      format: 'auto',
      detectedFormat: null
    };
  },

  render() {
    var { format, detectedFormat, syntaxError } = this.state;

    return (
      <div>
        <div className="col-md-6">
          <div className={cx('load-input', 'row', {'has-error': this.state.loadError})}>
            <form onSubmit={this.onLoadGrammar}>
              <div className="col-md-8 col-sm-8 col-xs-7">
                <input className="form-control" type="text" name="link" value={this.state.link} onChange={this.handleChange} placeholder="e.g. http://server.com/grammar.pegjs" />
              </div>
              <button className="btn btn-primary col-md-3 col-sm-3 col-xs-4" type="submit" disabled={this.state.loading}>
                {this.state.loading ? 'Loading...' : 'Load Grammar'}
              </button>
            </form>
          </div>
          <div className="load-examples row">
            Format:{" "}
            <select value={format} onChange={this.onChangeFormat}>
              <option value="auto">Auto-detect</option>
              {Object.keys(this.formats).map(k =>
                <option key={k} value={k}>{this.formats[k]}</option>
              )}
            </select>
            {format === 'auto' && !!detectedFormat &&
            <span> Detected: {this.formats[detectedFormat]}</span>}
          </div>
          <div className="load-examples row">
            <span>Try some examples:</span><br/>
            {this.state.examples.map((example, key) =>
              <a key={key} href={'#'+example.link} onClick={() => this.onSwitchGrammar(example.link, example.format)}>{example.name}</a>
            )}
          </div>
          {this.state.loadError && <div className="row alert alert-danger">
            {this.state.loadError}
          </div>}

          <div className={cx('row', {'has-error': syntaxError})}>
            <textarea className="form-control grammar-edit" value={this.state.grammar} onChange={this.onChangeGrammar} />
            {syntaxError && <pre className="alert alert-danger">
              {formatError(syntaxError)}
            </pre>}
          </div>
        </div>

        <div className="col-md-6">
          {this.state.procesedGrammars.map(({ rules, references, name }, key) =>
            <div key={key}>
              {!!name && <h2>{name}</h2>}
              {rules.map((rule, key) =>
                <div key={key}>
                  <h3 id={rule.name}>{rule.name}</h3>
                  <div dangerouslySetInnerHTML={{__html: rule.diagram}} onClick={this.onClickDiagram} />
                  {references[rule.name] && references[rule.name].usedBy.length > 0 && <div>
                    Used By: {references[rule.name].usedBy.map((rule, key) =>
                      <a key={key} href={'#' + rule}> {rule} </a>
                    )}
                  </div>}
                  {references[rule.name] && references[rule.name].references.length > 0 && <div>
                    References: {references[rule.name].references.map((rule, key) =>
                      <a key={key} href={'#' + rule}> {rule} </a>
                    )}
                  </div>}
                </div>
              )}
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

  onSwitchGrammar(link, format /* , ev */) {
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

    try {
      state = Object.assign(state, transform(grammar, format));
    } catch (e) {
      state.syntaxError = e;
      state.procesedGrammars = [];
    }

    this.setState(state);
  },

  loadGrammar(link, format) {
    format = format || 'auto';
    link = link.trim().replace(/^https?:\/\/github.com\/|https?:\/\/raw.githubusercontent.com\//, 'https://cdn.rawgit.com/');
    location.hash = link;
    this.setState({
      link: link,
      grammar: '',
      procesedGrammars: [],
      loading: true,
      loadError: null,
      format,
      detectedFormat: null
    });
    request(link, (er, response, body) => {
      this.setState({loading: false})
      if (er || response.status !== 200) {
        this.setState({loadError: '' + (er || body)});
      } else {
        this.updateGrammar(body, format);
      }
    })
  }
});

module.exports = App;
