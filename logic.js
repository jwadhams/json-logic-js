'use strict';

if (!Array.isArray) {
	Array.isArray = function(arg) {
		return Object.prototype.toString.call(arg) === '[object Array]';
	};
}

var jsonLogic = function(tests, data){
	//You've recursed to a primitive, stop!
	if( typeof tests !== "object" ){ return tests; }

	data = data || {};

	var values, fun, op;
	for (op in tests) {
		values = tests[op];	

		//easy syntax for unary operators, like {"var" : "x"} instead of strict {"var" : ["x"]}
		if(!Array.isArray(values)){ values = [values]; } 

		//Recursion!
		values = values.map(function(val){ return jsonLogic(val, data); });

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
		}else if(op === "?:" ){ fun = function(a,b,c){ return a ? b : c; };
		}else if(op === "log" ){ fun = function(a){ console.log(a); return a; };
		}else if(op === "var"){ 
			fun = function(a){ 
				if(typeof a !== "string") return data[a]; //Numeric index for arrays

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


