var gulp = require('gulp'),
    exec = require('child_process').exec;
 
gulp.task('test', function(cb) {
    exec(
		'node testrunner.js',
		{ cwd : 'tests' },
		function (err, stdout, stderr) {
			console.log(stdout);
			console.log(stderr);
			cb(err);
		}
	);
});

gulp.task('watch', function() {
    gulp.watch(['**/*.js', 'tests/tests.json'], ['test']);
});
