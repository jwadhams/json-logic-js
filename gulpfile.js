var gulp = require("gulp");
var exec = require("child_process").exec;

gulp.task("build", function(cb) {
  exec("npm run build", function(err, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
    cb(err);
  });
});

gulp.task("test", function(cb) {
  exec("node testrunner.js", {cwd: "tests"}, function(err, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
    cb(err);
  });
});

gulp.task("default", function() {
  gulp.watch(["src/*.js"], ["build"]);
  gulp.watch(["**/*.js", "tests/tests.json"], ["test"]);
});
