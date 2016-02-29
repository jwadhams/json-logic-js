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

QUnit.test( "logging", function( assert ) {
  assert.equal( jsonLogic.apply({"log" : [1]}), 1 );
  assert.equal( last_console, 1 );
});

QUnit.test( "edge cases", function( assert ) {
  assert.equal( jsonLogic.apply(), undefined, "Called with no arguments" );
});
