// Include gulp
const gulp = require('gulp');

// Include Our Plugins
const less = require('gulp-less');


// Support Tasks

// Compile any less files into CSS
function compileCSS(done) {
  gulp
    .src('./css/styles.less')
    .pipe(less())
    .pipe(gulp.dest('.'));
  done();
}

// Watch less files for changes
function watcher(done) {
  gulp.watch(['css/**/*.less'], compileCSS);
  done();
}


// Command Line Tasks

// Compile and concat into a single user.css
const build = compileCSS;
// Run build tasks and then watch for changes
const watch = gulp.series(build, watcher);

module.exports = {
  build,
  watch,
};
