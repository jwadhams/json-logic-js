var real_console = console.log, last_console;
console.log = function(logged){ last_console = logged; real_console.apply(this, arguments); };


QUnit.test( "Bad operator", function( assert ) {
	assert.throws(
		function(){ jsonLogic({"fubar": []}); }, 
		/Unrecognized operation/
	);
});


var request = require('request');
var Baby = require('babyparse');
request('http://jsonlogic.com/tests.csv', function (error, response, body) {
  if (!error && response.statusCode == 200) {

	var tests = Baby.parse(body, {
		skipEmptyLines:true,
		comments:"#"
	});

	for(var i = 0 ; i < tests.data.length ; i+=1){
		var test = tests.data[i];
		test.title = "jsonLogic("+test[0]+","+test[1]+") = " + test[2];
	}
    console.log("Including "+tests.data.length+" shared tests from JsonLogic.com");

	QUnit
		.cases( tests.data )
		.test( "Shared JsonLogic.com tests ", function(test){
			var rule = {},
				data = null,
				expected = null;

			try{
				rule = JSON.parse(test[0]),
				data = (test[1] === "") ? null : JSON.parse(test[1]),
				expected = JSON.parse(test[2]);
	
			}catch(e){
				console.log("Trouble parsing shared test: ", rule, data, expected);
			}

			if(typeof expected === "object"){
				assert.deepEqual( jsonLogic(rule, data), expected );
			}else{
				assert.equal( jsonLogic(rule, data), expected );
			}
		});



  }else{
	console.log("Failed to load tests from JsonLogic.com:", error, response.statusCode);
  }

});

QUnit.test( "logging", function( assert ) {
  assert.equal( jsonLogic({"log" : [1]}), 1 );
  assert.equal( last_console, 1 );
});

QUnit.test( "edge cases", function( assert ) {
  assert.equal( jsonLogic(), undefined, "Called with no arguments" );
});
