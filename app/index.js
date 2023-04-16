'use strict';

var React = require('react'),
    ReactDOMClient = require('react-dom/client'),
    App = require('./app');

ReactDOMClient.createRoot(document.getElementById('app')).render(<App />);
