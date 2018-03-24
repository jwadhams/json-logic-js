"use strict";

/**
 * This module establishes the core methods on JsonLogic.
 * These methods can be used by operations, so we're breaking this into a dependency that they can load separately to prevent a circular dependency.
 */

if ( ! Array.isArray) {
    Array.isArray = function(arg) {
        return Object.prototype.toString.call(arg) === "[object Array]";
    };
}
if ( ! Array.from) {
    Array.from = function(wanna_be){
        return [].slice.call(wanna_be);
    };
}

/**
* Return an array that contains no duplicates (original not modified)
* @param  {array} array   Original reference array
* @return {array}         New array with no duplicates
*/
function arrayUnique(array) {
    var a = [];
    for (var i=0, l=array.length; i<l; i++) {
        if (a.indexOf(array[i]) === -1) {
            a.push(array[i]);
        }
    }
    return a;
}

var jsonLogic = {};
var operations = {
    "==": function(a, b) {
        /* jshint eqeqeq:false */
        return a == b;
    },
    "===": function(a, b) {
        return a === b;
    },
    "!=": function(a, b) {
        /* jshint eqeqeq:false */
        return a != b;
    },
    "!==": function(a, b) {
        return a !== b;
    },
    ">": function(a, b) {
        return a > b;
    },
    ">=": function(a, b) {
        return a >= b;
    },
    "<": function(a, b, c) {
        return (c === undefined) ? a < b : (a < b) && (b < c);
    },
    "<=": function(a, b, c) {
        return (c === undefined) ? a <= b : (a <= b) && (b <= c);
    },
    "!!": function(a) {
        return jsonLogic.truthy(a);
    },
    "!": function(a) {
        return !jsonLogic.truthy(a);
    },
    "%": function(a, b) {
        return a % b;
    },
    "log": function(a) {
        console.log(a); return a;
    },
    "in": function(a, b) {
        if(!b || typeof b.indexOf === "undefined"){
            return false;
        }
        return (b.indexOf(a) !== -1);
    },
    "cat": function() {
        return Array.prototype.join.call(arguments, "");
    },
    "substr":function(source, start, end) {
        if(end < 0){
            // JavaScript doesn't support negative end, this emulates PHP behavior
            var temp = String(source).substr(start);
            return temp.substr(0, temp.length + end);
        }
        return String(source).substr(start, end);
    },
    "+": function() {
        return Array.prototype.reduce.call(arguments, function(a, b) {
            return parseFloat(a, 10) + parseFloat(b, 10);
        }, 0);
    },
    "*": function() {
        return Array.prototype.reduce.call(arguments, function(a, b) {
            return parseFloat(a, 10) * parseFloat(b, 10);
        });
    },
    "-": function(a, b) {
        if(b === undefined) {
            return -a;
        }else{
            return a - b;
        }
    },
    "/": function(a, b) {
        return a / b;
    },
    "min": function() {
        return Math.min.apply(this, arguments);
    },
    "max": function() {
        return Math.max.apply(this, arguments);
    },
    "merge": function() {
        return Array.prototype.reduce.call(arguments, function(a, b) {
            return a.concat(b);
        }, []);
    },
    "var": function(a, b) {
        var not_found = (b === undefined) ? null : b;
        var data = this;
        if(typeof a === "undefined" || a==="" || a===null) {
            return data;
        }
        var sub_props = String(a).split(".");
        for(var i = 0; i < sub_props.length; i++) {
            if(data === null) {
                return not_found;
            }
            // Descending into data
            data = data[sub_props[i]];
            if(data === undefined) {
                return not_found;
            }
        }
        return data;
    },
    "missing": function() {
        /*
        Missing can receive many keys as many arguments, like {"missing:[1,2]}
        Missing can also receive *one* argument that is an array of keys,
        which typically happens if it's actually acting on the output of another command
        (like 'if' or 'merge')
        */

        var missing = [];
        var keys = Array.isArray(arguments[0]) ? arguments[0] : arguments;

        for(var i = 0; i < keys.length; i++) {
            var key = keys[i];
            var value = jsonLogic.apply({"var": key}, this);
            if(value === null || value === "") {
                missing.push(key);
            }
        }

        return missing;
    },
    "missing_some": function(need_count, options) {
        // missing_some takes two arguments, how many (minimum) items must be present, and an array of keys (just like 'missing') to check for presence.
        var are_missing = jsonLogic.apply({"missing": options}, this);

        if(options.length - are_missing.length >= need_count) {
            return [];
        }else{
            return are_missing;
        }
    },
    "method": function(obj, method, args) {
        return obj[method].apply(obj, args);
    },

};

jsonLogic.is_logic = function(logic) {
    return (
        typeof logic === "object" && // An object
        logic !== null && // but not null
        ! Array.isArray(logic) && // and not an array
        Object.keys(logic).length === 1 // with exactly one key
    );
};

/*
This helper will defer to the JsonLogic spec as a tie-breaker when different language interpreters define different behavior for the truthiness of primitives.  E.g., PHP considers empty arrays to be falsy, but Javascript considers them to be truthy. JsonLogic, as an ecosystem, needs one consistent answer.

Spec and rationale here: http://jsonlogic.com/truthy
*/
jsonLogic.truthy = function(value) {
    if(Array.isArray(value) && value.length === 0) {
        return false;
    }
    return !! value;
};


jsonLogic.get_operator = function(logic) {
    return Object.keys(logic)[0];
};

jsonLogic.get_values = function(logic) {
    return logic[jsonLogic.get_operator(logic)];
};

jsonLogic.apply = function(logic, data) {
    // Does this array contain logic? Only one way to find out.
    if(Array.isArray(logic)) {
        return logic.map(function(l) {
            return jsonLogic.apply(l, data);
        });
    }
    // You've recursed to a primitive, stop!
    if( ! jsonLogic.is_logic(logic) ) {
        return logic;
    }

    data = data || {};

    var op = jsonLogic.get_operator(logic);
    var values = logic[op];
    var i;
    var current;
    var operation;
    var scopedLogic, scopedData, filtered, initial;

    // easy syntax for unary operators, like {"var" : "x"} instead of strict {"var" : ["x"]}
    if( ! Array.isArray(values)) {
        values = [values];
    }



    // 'if', 'and', and 'or' violate the normal rule of depth-first calculating consequents, let each manage recursion as needed.
    if(op === "and") { // Return first falsy, or last
        for(i=0; i < values.length; i+=1) {
            current = jsonLogic.apply(values[i], data);
            if( ! jsonLogic.truthy(current)) {
                return current;
            }
        }
        return current; // Last
    }else if(op === "or") {// Return first truthy, or last
        for(i=0; i < values.length; i+=1) {
            current = jsonLogic.apply(values[i], data);
            if( jsonLogic.truthy(current) ) {
                return current;
            }
        }
        return current; // Last




    }else if(op === 'filter'){
        scopedData = jsonLogic.apply(values[0], data);
        scopedLogic = values[1];

        if ( ! Array.isArray(scopedData)) {
            return [];
        }
        // Return only the elements from the array in the first argument,
        // that return truthy when passed to the logic in the second argument.
        // For parity with JavaScript, reindex the returned array
        return scopedData.filter(function(datum){
            return jsonLogic.truthy( jsonLogic.apply(scopedLogic, datum));
        });
    }else if(op === 'map'){
        scopedData = jsonLogic.apply(values[0], data);
        scopedLogic = values[1];

        if ( ! Array.isArray(scopedData)) {
            return [];
        }

        return scopedData.map(function(datum){
            return jsonLogic.apply(scopedLogic, datum);
        });

    }else if(op === 'reduce'){
        scopedData = jsonLogic.apply(values[0], data);
        scopedLogic = values[1];
        initial = typeof values[2] !== 'undefined' ? values[2] : null;

        if ( ! Array.isArray(scopedData)) {
            return initial;
        }

        return scopedData.reduce(
            function(accumulator, current){
                return jsonLogic.apply(
                    scopedLogic,
                    {'current':current, 'accumulator':accumulator}
                );
            },
            initial
        );

    }else if(op === "all") {
        scopedData = jsonLogic.apply(values[0], data);
        scopedLogic = values[1];
        // All of an empty set is false. Note, some and none have correct fallback after the for loop
        if( ! scopedData.length) {
            return false;
        }
        for(i=0; i < scopedData.length; i+=1) {
            if( ! jsonLogic.truthy( jsonLogic.apply(scopedLogic, scopedData[i]) )) {
                return false; // First falsy, short circuit
            }
        }
        return true; // All were truthy
    }else if(op === "none") {
        filtered = jsonLogic.apply({'filter' : values}, data);
        return filtered.length === 0;

    }else if(op === "some") {
        filtered = jsonLogic.apply({'filter' : values}, data);
        return filtered.length > 0;
    }


    // The operation is called with "data" bound to its "this" and "values" passed as arguments.
    // Structured commands like % or > can name formal arguments while flexible commands (like missing or merge) can operate on the pseudo-array arguments
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/arguments
    if(typeof operations[op] === 'function'){
        operation = operations[op];
    }else{
        var sub_ops = String(op).split(".");
        operation = operations;
        for(i = 0; i < sub_ops.length; i++) {
            // Descending into operations
            operation = operation[sub_ops[i]];
            if(operation === undefined) {
                throw new Error("Unrecognized operation " + op +
                " (failed at " + sub_ops.slice(0, i+1).join(".") + ")");
            }
        }
    }

    // If the operation explicitly wants to manage its own recursion, let it, otherwise handle that now.
    if( ! operation.manages_own_recursion){
        values = values.map(function(val) {
            return jsonLogic.apply(val, data);
        });
    }

    return operation.apply(data, values);
};

jsonLogic.uses_data = function(logic) {
    var collection = [];

    if( jsonLogic.is_logic(logic) ) {
        var op = jsonLogic.get_operator(logic);
        var values = logic[op];

        if( ! Array.isArray(values)) {
            values = [values];
        }

        if(op === "var") {
            // This doesn't cover the case where the arg to var is itself a rule.
            collection.push(values[0]);
        }else{
            // Recursion!
            values.map(function(val) {
                collection.push.apply(collection, jsonLogic.uses_data(val) );
            });
        }
    }

    return arrayUnique(collection);
};

/**
* Add an operation
* @param  {string} name
* @param  {function} code
* @param  {boolean} manages_own_recursion
*     If false or undefined, JsonLogic will recur into arguments *before* code() is called. This is typical, like "+"
*     If true, this code needs to manage its own recursion. This is unusual, like "if", but lets you control execution.
*/
jsonLogic.add_operation = function(name, code, manages_own_recursion) {
    operations[name] = code;
    if(manages_own_recursion){
        // The third parameter can set it true, but it could also be set as a parameter on code, e.g. when importing a bundle
        operations[name].manages_own_recursion = true;
    }
};

jsonLogic.add_operations = function(bundle){
    for(var operation in bundle){
        jsonLogic.add_operation(operation, bundle[operation]);
    }
};

jsonLogic.rm_operation = function(name) {
    delete operations[name];
};

jsonLogic.rule_like = function(rule, pattern) {
    // console.log("Is ". JSON.stringify(rule) . " like " . JSON.stringify(pattern) . "?");
    if(pattern === rule) {
        return true;
    } // TODO : Deep object equivalency?
    if(pattern === "@") {
        return true;
    } // Wildcard!
    if(pattern === "number") {
        return (typeof rule === "number");
    }
    if(pattern === "string") {
        return (typeof rule === "string");
    }
    if(pattern === "array") {
        // !logic test might be superfluous in JavaScript
        return Array.isArray(rule) && ! jsonLogic.is_logic(rule);
    }

    if(jsonLogic.is_logic(pattern)) {
        if(jsonLogic.is_logic(rule)) {
            var pattern_op = jsonLogic.get_operator(pattern);
            var rule_op = jsonLogic.get_operator(rule);

            if(pattern_op === "@" || pattern_op === rule_op) {
                // echo "\nOperators match, go deeper\n";
                return jsonLogic.rule_like(
                    jsonLogic.get_values(rule, false),
                    jsonLogic.get_values(pattern, false)
                );
            }
        }
        return false; // pattern is logic, rule isn't, can't be eq
    }

    if(Array.isArray(pattern)) {
        if(Array.isArray(rule)) {
            if(pattern.length !== rule.length) {
                return false;
            }
            /*
            Note, array order MATTERS, because we're using this array test logic to consider arguments, where order can matter. (e.g., + is commutative, but '-' or 'if' or 'var' are NOT)
            */
            for(var i = 0; i < pattern.length; i += 1) {
                // If any fail, we fail
                if( ! jsonLogic.rule_like(rule[i], pattern[i])) {
                    return false;
                }
            }
            return true; // If they *all* passed, we pass
        }else{
            return false; // Pattern is array, rule isn't
        }
    }

    // Not logic, not array, not a === match for rule.
    return false;
};


jsonLogic.add_operation(
    "?:",
    function() {
        return jsonLogic.apply({"if":Array.from(arguments)}, this);
    }, true
);


// https://github.com/webpack/webpack/issues/706#issuecomment-167908576
module.exports = jsonLogic;
