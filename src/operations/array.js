import core from "../core";

var filter = function(){
    var scopedData = core.apply(arguments[0], this);
    var scopedLogic = arguments[1];

    if ( ! Array.isArray(scopedData)) {
        return [];
    }
    // Return only the elements from the array in the first argument,
    // that return truthy when passed to the logic in the second argument.
    // For parity with JavaScript, reindex the returned array
    return scopedData.filter(function(datum){
        return core.truthy( core.apply(scopedLogic, datum));
    });
};
filter.manages_own_recursion = true;


var map = function(){
    var scopedData = core.apply(arguments[0], this);
    var scopedLogic = arguments[1];

    if ( ! Array.isArray(scopedData)) {
        return [];
    }

    return scopedData.map(function(datum){
        return core.apply(scopedLogic, datum);
    });
};
map.manages_own_recursion = true;


var reduce = function(){
    var scopedData = core.apply(arguments[0], this);
    var scopedLogic = arguments[1];
    var initial = typeof arguments[2] !== 'undefined' ? arguments[2] : null;

    if ( ! Array.isArray(scopedData)) {
        return initial;
    }

    return scopedData.reduce(
        function(accumulator, current){
            return core.apply(
                scopedLogic,
                {'current':current, 'accumulator':accumulator}
            );
        },
        initial
    );
};
reduce.manages_own_recursion = true;


var all = function(){
    var scopedData = core.apply(arguments[0], this);
    var scopedLogic = arguments[1];
    // All of an empty set is false. Note, some and none have correct fallback after the for loop
    if( ! scopedData.length) {
        return false;
    }
    for(var i=0; i < scopedData.length; i+=1) {
        if( ! core.truthy( core.apply(scopedLogic, scopedData[i]) )) {
            return false; // First falsy, short circuit
        }
    }
    return true; // All were truthy

};
all.manages_own_recursion = true;


var none = function(){
    var filtered = core.apply({'filter' : Array.from(arguments)}, this);
    return filtered.length === 0;
};
none.manages_own_recursion = true;


var some = function(){
    var filtered = core.apply({'filter' : Array.from(arguments)}, this);
    return filtered.length > 0;
};
some.manages_own_recursion = true;

export default {
    "merge": function() {
        return Array.prototype.reduce.call(arguments, function(a, b) {
            return a.concat(b);
        }, []);
    },

    filter,
    map,
    reduce,
    all,
    none,
    some,
};
