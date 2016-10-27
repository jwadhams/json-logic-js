var jsonLogic = require('../logic.js'),
	http = require('http'),
	fs = require('fs');

var download = function(url, dest, cb) {
  var file = fs.createWriteStream(dest);
  var request = http.get(url, function(response) {
    response.pipe(file);
    file.on('finish', function() {
      file.close(cb);  // close() is async, call cb after close completes.
    });
  }).on('error', function(err) { // Handle errors
    fs.unlink(dest); // Delete the file async. (But we don't check the result)
    if (cb) cb(err.message);
  });
};

var process_test_file = function (filename){
	fs.readFile(filename, 'utf8', function (error, body) {
		try{
			tests = JSON.parse(body);
		}catch(e){
			throw new Error("Trouble parsing shared test: " + e.message);
		}

		console.log("Including "+tests.length+" shared tests from JsonLogic.com");

		for(var i = 0 ; i < tests.length ; i+=1){
			var test = tests[i];
			if(typeof test === "string") continue; //Comment

			var rule = test[0],
				data = test[1],
				expected = test[2];

			assert.deepEqual(
				jsonLogic.apply(rule, data),
				expected,
				"jsonLogic("+ JSON.stringify(rule) +","+ JSON.stringify( data ) +") = " + JSON.stringify(expected)
			);
		}

		start();
	});
};

QUnit.test( "Bad operator", function( assert ) {
	assert.throws(
		function(){ jsonLogic.apply({"fubar": []}); },
		/Unrecognized operation/
	);
});



QUnit.test( "Shared JsonLogic.com tests ", function( assert ){
	//Only waiting on the request() is async
	stop();

	var local_file = 'tests.json';

	fs.stat(local_file, function(err, stats){
			if(err){
				console.log("Downloading shared tests from JsonLogic.com");
				download('http://jsonlogic.com/tests.json', local_file, function(){
					process_test_file(local_file);
				});
			}else{
				console.log("Using cached tests");
				process_test_file(local_file);
			}
	});


});

var real_console = console.log, last_console;
console.log = function(logged){ last_console = logged; real_console.apply(this, arguments); };
QUnit.test( "logging", function( assert ) {
  assert.equal( jsonLogic.apply({"log" : [1]}), 1 );
  assert.equal( last_console, 1 );
});

QUnit.test( "edge cases", function( assert ) {
  assert.equal( jsonLogic.apply(), undefined, "Called with no arguments" );
});

QUnit.test( "Expanding functionality with add_operator", function( assert) {
	//Operator is not yet defined
	assert.throws(
		function(){ jsonLogic.apply({"add_to_a": []}); },
		/Unrecognized operation/
	);

	//Set up some outside data, and build a basic function operator
	var a = 0,
		add_to_a = function(b){ if(b === undefined){b=1;} return a += b; };
	jsonLogic.add_operation("add_to_a", add_to_a);
	//New operation executes, returns desired result
	//No args
  assert.equal( jsonLogic.apply({"add_to_a" : []}), 1 );
	//Unary syntactic sugar
  assert.equal( jsonLogic.apply({"add_to_a" : 41}), 42 );
	//New operation had side effects.
	assert.equal(a, 42);

	var fives = {
		add : function(i){ return i + 5; },
		subtract : function(i){ return i - 5; }
	};

	jsonLogic.add_operation("fives", fives);
	assert.equal( jsonLogic.apply({"fives.add" : 37}), 42 );
	assert.equal( jsonLogic.apply({"fives.subtract" : [47] }), 42 );
});

QUnit.test( "Expanding functionality with method", function( assert) {

	//Data contains a real object with methods and local state
	var a = {
		count : 0,
		increment : function(){ return this.count += 1; },
		add : function(b){ return this.count += b; },
	};

	//Look up "a" in data, and run the increment method on it with no args.
	assert.equal(
		jsonLogic.apply(
			{"method" : [ {"var" : "a"}, "increment" ]},
			{"a" : a}
		),
		1 //Happy return value
	);
	assert.equal(a.count, 1); //Happy state change

	//Run the add method with an argument
	assert.equal(
		jsonLogic.apply(
			{"method" : [ {"var" : "a"}, "add", [41] ]},
			{"a" : a}
		),
		42 //Happy return value
	);
	assert.equal(a.count, 42); //Happy state change


});
