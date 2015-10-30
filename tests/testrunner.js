var testrunner = require("qunit");

testrunner.setup({
    log: {
        summary: true,
        errors: true
    }
});

// specify dependency
testrunner.run({
    deps: ["../node_modules/qunit-parameterize/qunit-parameterize.js"],
    code: "../logic.js",
    tests: "tests.js"
}, function(err, report) {
    //console.dir(report);
});
