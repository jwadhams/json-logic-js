var jsonLogic = require("../logic.js");
var http = require("http");
var fs = require("fs");

var download = function(url, dest, cb) {
  var file = fs.createWriteStream(dest);
  http.get(url, function(response) {
    response.pipe(file);
    file.on("finish", function() {
      file.close(cb);  // close() is async, call cb after close completes.
    });
  }).on("error", function(err) { // Handle errors
    fs.unlink(dest); // Delete the file async. (But we don't check the result)
    if (cb) cb(err.message);
  });
};

var remote_or_cache = function (remote_url, local_file, description, runner){
  var parse_and_iterate = function(local_file, description, runner){
    fs.readFile(local_file, "utf8", function(error, body) {
      var tests;
      try{
        tests = JSON.parse(body);
      }catch(e) {
        throw new Error("Trouble parsing " + description + ": " + e.message);
      }

      // Remove comments
      tests = tests.filter(function(test){ return typeof test !== 'string'; });

      console.log("Including "+tests.length+" "+description);

      QUnit.test(description, function(assert) {
        tests.map(runner);
      });

      start();
    });

  };

	// Only waiting on the request() is async
  stop();

  fs.stat(local_file, function(err, stats) {
    if(err) {
      console.log("Downloading " + description + " from JsonLogic.com");
      download(remote_url, local_file, function() {
        parse_and_iterate(local_file, description, runner);
      });
    }else{
      console.log("Using cached " + description);
      parse_and_iterate(local_file, description, runner);
    }
  });

};

remote_or_cache(
  "http://jsonlogic.com/tests.json",
  "tests.json",
  "applies() tests",
  function(test){
    var rule = test[0];
    var data = test[1];
    var expected = test[2];

    assert.deepEqual(
      jsonLogic.apply(rule, data),
      expected,
      "jsonLogic.apply("+ JSON.stringify(rule) +"," +
        JSON.stringify(data) +") === " +
        JSON.stringify(expected)
    );
  }
);

remote_or_cache(
  "http://jsonlogic.com/rule_like.json",
  "rule_like.json",
  "rule_like() tests",
  function(test){
    var rule = test[0];
    var pattern = test[1];
    var expected = test[2];

    assert.deepEqual(
      jsonLogic.rule_like(rule, pattern),
      expected,
      "jsonLogic.rule_like("+ JSON.stringify(rule) +"," +
        JSON.stringify(pattern) +") === " +
        JSON.stringify(expected)
    );
  }
);






QUnit.test( "Bad operator", function( assert ) {
  assert.throws(
    function() {
      jsonLogic.apply({"fubar": []});
    },
    /Unrecognized operation/
  );
});


QUnit.test( "logging", function( assert ) {
  var last_console;
  console.log = function(logged) {
    last_console = logged;
  };
  assert.equal( jsonLogic.apply({"log": [1]}), 1 );
  assert.equal( last_console, 1 );
});

QUnit.test( "edge cases", function( assert ) {
  assert.equal( jsonLogic.apply(), undefined, "Called with no arguments" );
});

QUnit.test( "Expanding functionality with add_operator", function( assert) {
  // Operator is not yet defined
  assert.throws(
    function() {
      jsonLogic.apply({"add_to_a": []});
    },
    /Unrecognized operation/
  );

  // Set up some outside data, and build a basic function operator
  var a = 0;
  var add_to_a = function(b) {
    if(b === undefined) {
      b=1;
    } return a += b;
  };
  jsonLogic.add_operation("add_to_a", add_to_a);
  // New operation executes, returns desired result
  // No args
  assert.equal( jsonLogic.apply({"add_to_a": []}), 1 );
  // Unary syntactic sugar
  assert.equal( jsonLogic.apply({"add_to_a": 41}), 42 );
  // New operation had side effects.
  assert.equal(a, 42);

  var fives = {
    add: function(i) {
      return i + 5;
    },
    subtract: function(i) {
      return i - 5;
    },
  };

  jsonLogic.add_operation("fives", fives);
  assert.equal( jsonLogic.apply({"fives.add": 37}), 42 );
  assert.equal( jsonLogic.apply({"fives.subtract": [47]}), 42 );

  // Calling a method with multiple var as arguments.
  jsonLogic.add_operation("times", function(a, b) {
    return a*b;
  });
  assert.equal(
    jsonLogic.apply(
      {"times": [{"var": "a"}, {"var": "b"}]},
      {a: 6, b: 7}
    ),
    42
  );

  //Remove operation:
  jsonLogic.rm_operation("times");

  assert.throws(
    function() {
      jsonLogic.apply({"times": [2,2]});
    },
    /Unrecognized operation/
  );

  // Calling a method that takes an array, but the inside of the array has rules, too
  jsonLogic.add_operation("array_times", function(a) {
    return a[0]*a[1];
  });
  assert.equal(
    jsonLogic.apply(
      {"array_times": [[{"var": "a"}, {"var": "b"}]]},
      {a: 6, b: 7}
    ),
    42
  );



});

QUnit.test( "Expanding functionality with method", function( assert) {
  // Data contains a real object with methods and local state
  var a = {
    count: 0,
    increment: function() {
      return this.count += 1;
    },
    add: function(b) {
      return this.count += b;
    },
  };

  // Look up "a" in data, and run the increment method on it with no args.
  assert.equal(
    jsonLogic.apply(
      {"method": [{"var": "a"}, "increment"]},
      {"a": a}
    ),
    1 // Happy return value
  );
  assert.equal(a.count, 1); // Happy state change

  // Run the add method with an argument
  assert.equal(
    jsonLogic.apply(
      {"method": [{"var": "a"}, "add", [41]]},
      {"a": a}
    ),
    42 // Happy return value
  );
  assert.equal(a.count, 42); // Happy state change
});


QUnit.test("Control structures don't eval depth-first", function(assert) {
  // Depth-first recursion was wasteful but not harmful until we added custom operations that could have side-effects.

  // If operations run the condition, if truthy, it runs and returns that consequent.
  // Consequents of falsy conditions should not run.
  // After one truthy condition, no other condition should run
  var conditions = [];
  var consequents = [];
  jsonLogic.add_operation("push.if", function(v) {
    conditions.push(v); return v;
  });
  jsonLogic.add_operation("push.then", function(v) {
    consequents.push(v); return v;
  });
  jsonLogic.add_operation("push.else", function(v) {
    consequents.push(v); return v;
  });

  jsonLogic.apply({"if": [
    {"push.if": [true]},
    {"push.then": ["first"]},
    {"push.if": [false]},
    {"push.then": ["second"]},
    {"push.else": ["third"]},
  ]});
  assert.deepEqual(conditions, [true]);
  assert.deepEqual(consequents, ["first"]);

  conditions = [];
  consequents = [];
  jsonLogic.apply({"if": [
    {"push.if": [false]},
    {"push.then": ["first"]},
    {"push.if": [true]},
    {"push.then": ["second"]},
    {"push.else": ["third"]},
  ]});
  assert.deepEqual(conditions, [false, true]);
  assert.deepEqual(consequents, ["second"]);

  conditions = [];
  consequents = [];
  jsonLogic.apply({"if": [
    {"push.if": [false]},
    {"push.then": ["first"]},
    {"push.if": [false]},
    {"push.then": ["second"]},
    {"push.else": ["third"]},
  ]});
  assert.deepEqual(conditions, [false, false]);
  assert.deepEqual(consequents, ["third"]);


  jsonLogic.add_operation("push", function(arg) {
    i.push(arg); return arg;
  });
  var i = [];

  i = [];
  jsonLogic.apply({"and": [{"push": [false]}, {"push": [false]}]});
  assert.deepEqual(i, [false]);
  i = [];
  jsonLogic.apply({"and": [{"push": [false]}, {"push": [true]}]});
  assert.deepEqual(i, [false]);
  i = [];
  jsonLogic.apply({"and": [{"push": [true]}, {"push": [false]}]});
  assert.deepEqual(i, [true, false]);
  i = [];
  jsonLogic.apply({"and": [{"push": [true]}, {"push": [true]}]});
  assert.deepEqual(i, [true, true]);


  i = [];
  jsonLogic.apply({"or": [{"push": [false]}, {"push": [false]}]});
  assert.deepEqual(i, [false, false]);
  i = [];
  jsonLogic.apply({"or": [{"push": [false]}, {"push": [true]}]});
  assert.deepEqual(i, [false, true]);
  i = [];
  jsonLogic.apply({"or": [{"push": [true]}, {"push": [false]}]});
  assert.deepEqual(i, [true]);
  i = [];
  jsonLogic.apply({"or": [{"push": [true]}, {"push": [true]}]});
  assert.deepEqual(i, [true]);
});
