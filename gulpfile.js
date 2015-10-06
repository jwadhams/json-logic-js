var gulp = require('gulp'),
    qunit = require('node-qunit-phantomjs');
 
gulp.task('test', function() {
    qunit('./tests/index.html');
});

gulp.task('watch', function() {
    gulp.watch('**/*.js', ['test']);
});
