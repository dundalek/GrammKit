var rd = require('railroad-diagrams');
// var whitescape = require('whitescape');

var rdAst = {};
var methods = Object.keys(rd).concat(['Start', 'End']);
methods.forEach(function(type) {
  rdAst[type] = function() {
    return {
      type: type,
      arguments: [].slice.call(arguments)
    };
  }
});

module.exports = rdAst;
