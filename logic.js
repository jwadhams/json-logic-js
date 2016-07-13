/*
Using a Universal Module Loader that should be browser, require, and AMD friendly
http://ricostacruz.com/cheatsheets/umdjs.html
*/
;(function (root, factory) {

  if (typeof define === 'function' && define.amd) {
    define(factory);
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    root.jsonLogic = factory();
  }

}(this, function () {
'use strict';
/*globals console:false */

if ( ! Array.isArray) {
	Array.isArray = function(arg) {
		return Object.prototype.toString.call(arg) === '[object Array]';
	};
}

if( ! Array.unique){
	Array.prototype.unique = function() {
		var a = [];
		for (var i=0, l=this.length; i<l; i++){
			if (a.indexOf(this[i]) === -1){
				a.push(this[i]);
			}
		}
		return a;
	};
}

var jsonLogic = {},
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
		"!!"   : function(a){ return jsonLogic.truthy(a); },
		"!"   : function(a){ return !jsonLogic.truthy(a); },
		"%"  : function(a,b){ return a % b; },
		"and" : function(){ //Return first falsy, or last
			for(var i=0 ; i < arguments.length ; i+=1){
        if( ! jsonLogic.truthy(arguments[i])){
          return arguments[i];
        }
      }
			return arguments[i-1];
		},
		"or"  : function(){ //Return first truthy, or last
			for(var i=0 ; i < arguments.length ; i+=1){
        if( jsonLogic.truthy(arguments[i])){
          return arguments[i];
        }
      }
			return arguments[i-1];
		},
		"log" : function(a){ console.log(a); return a; },
		"in"  : function(a, b){
			if(typeof b.indexOf === 'undefined') return false;
			return (b.indexOf(a) !== -1);
		},
		"cat" : function(){
			return Array.prototype.join.call(arguments, "");
		},
		"+" : function(){
			return Array.prototype.reduce.call(arguments, function(a,b){
				return parseFloat(a,10) + parseFloat(b, 10);
			}, 0);
		},
		"*" : function(){
			return Array.prototype.reduce.call(arguments, function(a,b){
				return parseFloat(a,10) * parseFloat(b, 10);
			});
		},
		"-" : function(a,b){ if(b === undefined){return -a;}else{return a - b;} },
		"/" : function(a,b){ if(b === undefined){return a;}else{return a / b;} },
		"min" : function(){ return Math.min.apply(this,arguments); },
		"max" : function(){ return Math.max.apply(this,arguments); },
		"merge" : function(){
			return Array.prototype.reduce.call(arguments, function(a,b){
				return a.concat(b);
			}, []);
		}
	};

jsonLogic.is_logic = function(logic){
	return (logic !== null && typeof logic === "object" && ! Array.isArray(logic) );
};

/*
This helper will defer to the JsonLogic spec as a tie-breaker when different language interpreters define different behavior for the truthiness of primitives.  E.g., PHP considers empty arrays to be falsy, but Javascript considers them to be truthy. JsonLogic, as an ecosystem, needs one consistent answer.

Literal | JS    |  PHP  |  JsonLogic
--------+-------+-------+---------------
[]      | true  | false | false
"0"     | true  | false | true
*/
jsonLogic.truthy = function(value){
	if(Array.isArray(value) && value.length === 0){ return false; }
	return !! value;
};

jsonLogic.apply = function(logic, data){
	//You've recursed to a primitive, stop!
	if( ! jsonLogic.is_logic(logic) ){
		return logic;
	}

	data = data || {};

	var op = Object.keys(logic)[0],
		values = logic[op],
		i;

	//easy syntax for unary operators, like {"var" : "x"} instead of strict {"var" : ["x"]}
	if( ! Array.isArray(values)){ values = [values]; }

	// 'if' violates the normal rule of depth-first calculating consequents, let it manage recursion
	if(op === 'if' || op == '?:'){
		/* 'if' should be called with a odd number of parameters, 3 or greater
			This works on the pattern:
			if( 0 ){ 1 }else{ 2 };
			if( 0 ){ 1 }else if( 2 ){ 3 }else{ 4 };
			if( 0 ){ 1 }else if( 2 ){ 3 }else if( 4 ){ 5 }else{ 6 };

			The implementation is:
			For pairs of values (0,1 then 2,3 then 4,5 etc)
				If the first evaluates truthy, evaluate and return the second
				If the first evaluates falsy, jump to the next pair (e.g, 0,1 to 2,3)
			given one parameter, evaluate and return it. (it's an Else and all the If/ElseIf were false)
			given 0 parameters, return NULL (not great practice, but there was no Else)
		*/
		for(i = 0 ; i < values.length - 1 ; i += 2){
			if( jsonLogic.truthy( jsonLogic.apply(values[i], data) ) ){
				return jsonLogic.apply(values[i+1], data);
			}
		}
		if(values.length === i+1) return jsonLogic.apply(values[i], data);
		return null;
	}


	// Everyone else gets immediate depth-first recursion
	values = values.map(function(val){ return jsonLogic.apply(val, data); });

	// 'var' and 'missing' need access to data, only available in this scope
	if(op === "var"){
		var not_found = values[1] || null,
			sub_props = String(values[0]).split(".");
		for(i = 0 ; i < sub_props.length ; i++){
			//Descending into data
			data = data[ sub_props[i] ];
			if(data === undefined){ return not_found; }
		}
		return data;

	}else if(op === "missing"){
		/*
			Missing can receive many keys as many arguments, like {"missing:[1,2]}
			Missing can also receive *one* argument that is an array of keys,
			which typically happens if it's actually acting on the output of another command
			(like 'if' or 'merge')
		*/
		if( Array.isArray(values[0]) ){ values = values[0]; }

		var missing = [];
		values.map(function(data_key){
      var value = jsonLogic.apply({'var':data_key}, data);
			if(value === null || value === ""){
				missing.push(data_key);
			}
		});

		return missing;
	}else if(op === "missing_some"){
		/*
			missing_some takes two arguments, how many (minimum) items must be present, and an array of keys (just like 'missing') to check for presence.
		*/
    var need_count = values[0],
      options = values[1],
      are_missing = jsonLogic.apply({'missing':options}, data);

    if(options.length - are_missing.length >= need_count){
      return [];
    }else{
      return are_missing;
    }
	}

	if(undefined === operations[op]){
		throw new Error("Unrecognized operation " + op );
	}

	return operations[op].apply({}, values);

};

jsonLogic.uses_data = function(logic){
	var collection = [];

	if( jsonLogic.is_logic(logic) ){
		var op = Object.keys(logic)[0],
			values = logic[op];

		if( ! Array.isArray(values)){ values = [values]; }

		if(op === "var"){
			//This doesn't cover the case where the arg to var is itself a rule.
			collection.push(values[0]);
		}else{
			//Recursion!
			values.map(function(val){
				collection.push.apply(collection, jsonLogic.uses_data(val) );
			});
		}
	}

	return collection.unique();
};

return jsonLogic;

}));
