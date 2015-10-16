'use strict';
/*globals console:false */

if (!Array.isArray) {
	Array.isArray = function(arg) {
		return Object.prototype.toString.call(arg) === '[object Array]';
	};
}

var jsonLogic = function(tests, data){
	//You've recursed to a primitive, stop!
	if( typeof tests !== "object" || Array.isArray(tests) ){ return tests; }

	data = data || {};

	var op = Object.keys(tests)[0],
		values = tests[op],
		operations = {
			"=="  : function(a,b){ return a == b; },
			"===" : function(a,b){ return a === b; },
			"!="  : function(a,b){ return a != b; },
			"!==" : function(a,b){ return a !== b; },
			">"   : function(a,b){ return a > b; },
			">="  : function(a,b){ return a >= b; },
			"<"   : function(a,b){ return a < b; },
			"<="  : function(a,b){ return a <= b; },
			"!"   : function(a){ return !a; },
			"and" : function(a,b){ return a && b; },
			"or"  : function(a,b){ return a || b; },
			"?:"  : function(a,b,c){ return a ? b : c; },
			"log" : function(a){ console.log(a); return a; },
			"in"  : function(a, b){ 
				if(typeof b.indexOf === 'undefined') return false;
				return (b.indexOf(a) !== -1);
			},
			"var" : function(a){ 
				if(typeof a !== "string") return data[a]; //Numeric index for arrays

				var sub_props = a.split(".");
				for(var i = 0 ; i < sub_props.length ; i++){
					//Descending into data
					data = data[ sub_props[i] ];
					if(data === undefined){ break; }
				}
				return data;
			}
		};

	if(undefined === operations[op]){
		throw "Unrecognized operation " + op ;
	}

	//easy syntax for unary operators, like {"var" : "x"} instead of strict {"var" : ["x"]}
	if(!Array.isArray(values)){ values = [values]; } 

	//Recursion!
	values = values.map(function(val){ return jsonLogic(val, data); });

	return operations[op].apply({}, values);
};


