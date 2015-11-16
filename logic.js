(function(global) {
'use strict';
/*globals console:false */

if (!Array.isArray) {
	Array.isArray = function(arg) {
		return Object.prototype.toString.call(arg) === '[object Array]';
	};
}

global.jsonLogic = function(tests, data){
	//You've recursed to a primitive, stop!
	if(tests === null || typeof tests !== "object" || Array.isArray(tests) ){
		return tests; 
	}

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
			"<"   : function(a,b,c){
				return (c === undefined) ?  a < b : (a < b) && (b < c);
			},
			"<="  : function(a,b,c){ 
				return (c === undefined) ?  a <= b : (a <= b) && (b <= c);
			},
			"!"   : function(a){ return !a; },
			"%"  : function(a,b){ return a % b; },
			"and" : function(){ 
				return Array.prototype.reduce.call(arguments, function(a,b){ return a && b; });
			},
			"or"  : function(){
				return Array.prototype.reduce.call(arguments, function(a,b){ return a || b; });
			},
			"?:"  : function(a,b,c){ return a ? b : c; },
			"log" : function(a){ console.log(a); return a; },
			"in"  : function(a, b){ 
				if(typeof b.indexOf === 'undefined') return false;
				return (b.indexOf(a) !== -1);
			},
			"var" : function(a){ 
				var sub_props = String(a).split(".");
				for(var i = 0 ; i < sub_props.length ; i++){
					//Descending into data
					data = data[ sub_props[i] ];
					//Standardizing response across languages with no 'undefined' type
					if(data === undefined){ return null; } 
				}
				return data;
			},
			"cat" : function(){
				return Array.prototype.join.call(arguments, "");
			},
			"+" : function(){ 
				return Array.prototype.reduce.call(arguments, function(a,b){
					return parseFloat(a,10) + parseFloat(b, 10);
				});
			},
			"*" : function(){ 
				return Array.prototype.reduce.call(arguments, function(a,b){
					return parseFloat(a,10) * parseFloat(b, 10);
				});
			},
			"-" : function(a,b){ if(b === undefined){return a;}else{return a - b;} },
			"/" : function(a,b){ if(b === undefined){return a;}else{return a / b;} },
			"min" : function(){ return Math.min.apply(this,arguments); },
			"max" : function(){ return Math.max.apply(this,arguments); }
		};

	if(undefined === operations[op]){
		throw new Error("Unrecognized operation " + op );
	}

	//easy syntax for unary operators, like {"var" : "x"} instead of strict {"var" : ["x"]}
	if(!Array.isArray(values)){ values = [values]; } 

	//Recursion!
	values = values.map(function(val){ return jsonLogic(val, data); });

	return operations[op].apply({}, values);
};

}(this));

