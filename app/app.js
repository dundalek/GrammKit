var React = require('react/addons');
var request = require('browser-request');
var parse = require('pegjs/lib/parser').parse;
var diagram = require('../lib/diagram');


var grammar = `start
  = additive

additive
  = left:multiplicative "+" right:additive { return left + right; }
  / multiplicative

multiplicative
  = left:primary "*" right:multiplicative { return left * right; }
  / primary

primary
  = integer
  / "(" additive:additive ")" { return additive; }

integer "integer"
  = digits:[0-9]+ { return parseInt(digits.join(""), 10); }`;

var App = React.createClass({
  mixins: [
    React.addons.LinkedStateMixin
  ],
  
  getInitialState() {
      var state = {
        examples: [{name: 'ArchieML',
          link: 'https://cdn.rawgit.com/dundalek/archieml-peg/6d882f42de57d850f72772cde9aadc7a4ee579bf/aml.parser.pegjs'}, {
          name: 'JSON',
          link: 'https://cdn.rawgit.com/pegjs/pegjs/fb5f6c6ee94b962c45f591f64b293bc11ba57ae6/examples/json.pegjs'
        }]
      };
      if (location.hash) {
        state.grammar = '';
        state.rules = [];
        this.fetch(location.hash.replace(/^#/, ''));
      } else {
        state.grammar = grammar;
        state.rules = this.generate(grammar);
      }
      return state;
  },
  
  render() {
    var e = this.state.error;
    return (
      <div className="container">
        <h1>GrammKit</h1>
        <div className="col-md-6">
          <p>
          Generate diagrams for parser grammars.
          </p>
          <div className="load-input row">
            <div className="col-md-8 col-sm-8 col-xs-7">
              <input className="form-control" type="text" valueLink={this.linkState('link')} onKeyPress={this.onKeyPress} placeholder="e.g. http://server.com/grammar.pegjs" />
            </div>
            <button className="btn btn-primary col-md-3 col-sm-3 col-xs-4" onClick={this.onLoadGrammar}>Load Grammar</button>
          </div>
          <p className="load-examples">
            Try some examples:
            {this.state.examples.map(example => 
              <a href={'#'+example.link} onClick={this.onSwitchGrammar.bind(this, example.link)}>{example.name}</a>
            )}
          </p>
          <div>
            <textarea className="form-control grammar-edit" value={this.state.grammar} onChange={this.onChangeGrammar} />
            {e && typeof e === 'string' && <div className="alert alert-danger">
              {e}
            </div>}
            {e && typeof e !== 'string' && <pre className="alert alert-danger">
              {e.name} on line {e.line}, column {e.column}:{'\n'}
              {new Array(e.column).join(' ')}|{'\n'}
              {e.lineCode}{'\n\n'}
              {e.message}
            </pre>}
          </div>
        </div>
        <div className="col-md-6">
          {this.state.rules.map(rule => 
            <div>
              <h3 id={rule.name}>{rule.name}</h3>
              <div dangerouslySetInnerHTML={{__html: rule.diagram}}/>
            </div>
          )}
        </div>
      </div>
    );
  },
  
  onChangeGrammar(ev) {
    this.updateGrammar(ev.target.value);
  },
  
  onSwitchGrammar(link, ev) {
    this.fetch(link);
  },
  
  onLoadGrammar() {
    this.fetch(this.state.link);
  },
  
  onKeyPress(ev) {
    if (ev.which === 13) {
      // load grammar on enter
      this.onLoadGrammar();
    }
  },
  
  updateGrammar(grammar) {
    var state = {
      grammar: grammar
    };
    var rules = this.generate(grammar);
    if (rules instanceof Error) {
      state.error = rules;
    } else {
      state.rules = rules;
      state.error = null;
    }
    this.setState(state);
  },
  
  generate(grammar) {
    try {
      var grammar = parse(grammar);
    } catch (e) {
      e.lineCode = grammar.split('\n')[e.line-1];
      return e;
    }
    var rules = grammar.rules.map(function(rule) {
      return {
        name: rule.name,
        diagram: diagram(rule)
      };
    });
    return rules;
  },
  
  fetch(link) {
    location.hash = link;
    this.setState({link: link});
    request(link, function(er, response, body) {
      if (er) {
        this.setState({error: ''+er});
      } else {
        this.updateGrammar(body);
      }
    }.bind(this))
  }
});

module.exports = App;