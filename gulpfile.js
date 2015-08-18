var gulp = require('gulp');
var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');
var gulpWebpack = require('gulp-webpack');
var webpackConfig = require('./webpack.config');

gulp.task('build', ['webpack', 'copy']);

gulp.task('dev', function(callback) {
  var config = webpackConfig({hot: true});
  new WebpackDevServer(webpack(config), {
    publicPath: config.output.publicPath,
    hot: true,
    historyApiFallback: true
  }).listen(3000, 'localhost', function (err, result) {
    if (err) {
      console.log(err);
    }

    console.log('Listening at localhost:3000');
  });
});

gulp.task("webpack", function() {
  var config = webpackConfig();
  return gulp.src('app/index.js')
      .pipe(gulpWebpack(config))
      .pipe(gulp.dest('dist/'));
});

gulp.task('copy', ['copy:files', 'copy:libs', 'copy:examples']);

gulp.task('copy:libs', function() {
  return gulp.src('node_modules/bootstrap/dist/css/bootstrap.min.css', {base: 'node_modules/bootstrap/dist/css/'})
    .pipe(gulp.dest('dist/'));
})

gulp.task('copy:files', function() {
  return gulp.src('app/{index.html,style.css}', {base: 'app/'})
    .pipe(gulp.dest('dist/'));
});

gulp.task('copy:examples', function() {
  return gulp.src('examples/*.*')
    .pipe(gulp.dest('dist/examples'));
});
