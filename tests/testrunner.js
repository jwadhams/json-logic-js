var testrunner = require("qunit");

testrunner.setup({
    log: {
      summary: true,
      errors: true
    }
});

// specify dependency
testrunner.run({
    code: "../logic.js",
    tests: "tests.js"
}, function(err, report) {
    if(err) console.dir(err);
    // console.dir(report);
});
