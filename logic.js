'use strict';

if (!Array.isArray) {
	Array.isArray = function(arg) {
		return Object.prototype.toString.call(arg) === '[object Array]';
	};
}

var jsonLogic = function(tests, data){
	data = data || {};

	var values, fun ;
	for (var op in tests) {
		values = tests[op];	

		//easy syntax for unary operators, like {"var" : "x"} instead of strict {"var" : ["x"]}
		if(!Array.isArray(values)){ values = [values]; } 

		//TODO: Lazy evaluation when op is AND or OR
		values = values.map(function(val){
			if( typeof val === "object" ){
				return jsonLogic(val, data); //Recursion!
			}else{
				return val;
			}
		});

		fun = function(){ throw "Unrecognized operation " + op ;};

		if(op === "=="){        fun = function(a,b){ return a == b; };
		}else if(op === "==="){ fun = function(a,b){ return a === b; };
		}else if(op === "!=" ){ fun = function(a,b){ return a != b; };
		}else if(op === "!=="){ fun = function(a,b){ return a !== b; };
		}else if(op === ">"  ){ fun = function(a,b){ return a > b; };
		}else if(op === ">=" ){ fun = function(a,b){ return a >= b; };
		}else if(op === "<"  ){ fun = function(a,b){ return a < b; };
		}else if(op === "<=" ){ fun = function(a,b){ return a <= b; };
		}else if(op === "!"  ){ fun = function(a){ return !a; };
		}else if(op === "and"){ fun = function(a,b){ return a && b; };
		}else if(op === "or" ){ fun = function(a,b){ return a || b; };
		}else if(op === "var"){ 
			fun = function(a){ 
				var sub_props = a.split(".");
				for(var i = 0 ; i < sub_props.length ; i++){
					//Descending into data
					data = data[ sub_props[i] ];
					if(data === undefined){ break; }
				}
				return data;
			};
		}

		return fun.apply({}, values);
	}
};


