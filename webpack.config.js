var webpack = require('webpack');

module.exports = function(options) {
  options = options || {};
  return {
    devtool: 'eval',
    entry: options.hot ? [
      'webpack-dev-server/client?http://localhost:3000',
      'webpack/hot/only-dev-server',
      './app/index'
    ] : ['./app/index'],
    output: {
      path: __dirname + '/app/',
      filename: 'bundle.js',
      publicPath: '/dist/'
    },
    plugins: options.hot ? [
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NoErrorsPlugin()
    ] : [
      new webpack.optimize.DedupePlugin(),
      new webpack.optimize.UglifyJsPlugin(),
      new webpack.optimize.OccurenceOrderPlugin()
    ],
    resolve: {
      extensions: ['', '.js', '.jsx']
    },
    module: {
      loaders: [
        { test: /\.jsx?$/, loaders: options.hot ? ['react-hot', 'jsx?harmony'] : ['jsx?harmony'], exclude: /node_modules/ },
        { test: /\.json$/, loaders: ['json']},
        { test: /\.pegjs$/, loaders: ['pegjs']}
      ]
    }
  };
};
