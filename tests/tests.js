var jsonLogic = require('../logic.js');

var real_console = console.log, last_console;
console.log = function(logged){ last_console = logged; real_console.apply(this, arguments); };

QUnit.test( "Bad operator", function( assert ) {
	assert.throws(
		function(){ jsonLogic.apply({"fubar": []}); }, 
		/Unrecognized operation/
	);
});



QUnit.test( "Shared JsonLogic.com tests ", function( assert ){
	//Only waiting on the request() is async
	stop();

	var fs = require('fs');
	fs.readFile('tests.json', 'utf8', function (error, body) {
	/*
	var request = require('request');
	request('http://jsonlogic.com/tests.json', function (error, response, body) {
		if (error || response.statusCode != 200) {
			console.log("Failed to load tests from JsonLogic.com:", error, response.statusCode);
			start();
			return;
		}
	*/
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
				"jsonLogic("+ JSON.stringify(rule) +","+ JSON.stringify( data ) +") = " + expected
			);
		}

		start();
	});
});

QUnit.test( "logging", function( assert ) {
  assert.equal( jsonLogic.apply({"log" : [1]}), 1 );
  assert.equal( last_console, 1 );
});

QUnit.test( "edge cases", function( assert ) {
  assert.equal( jsonLogic.apply(), undefined, "Called with no arguments" );
});
