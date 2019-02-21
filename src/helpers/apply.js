import isLogic from './isLogic';
import getOperator from './getOperator';
import truthy from './truthy';

function apply(logic, data) {
  // Does this array contain logic? Only one way to find out.
  if(Array.isArray(logic)) {
    return logic.map(function(l) {
      return apply(l, data);
    });
  }
  // You've recursed to a primitive, stop!
  if( ! isLogic(logic) ) {
    return logic;
  }

  data = data || {};

  var op = getOperator(logic);
  var values = logic[op];
  var i;
  var current;
  var scopedLogic, scopedData, filtered, initial;

  // easy syntax for unary operators, like {"var" : "x"} instead of strict {"var" : ["x"]}
  if( ! Array.isArray(values)) {
    values = [values];
  }

  // 'if', 'and', and 'or' violate the normal rule of depth-first calculating consequents, let each manage recursion as needed.
  if(op === "if" || op == "?:") {
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
    for(i = 0; i < values.length - 1; i += 2) {
      if( truthy( apply(values[i], data) ) ) {
        return apply(values[i+1], data);
      }
    }
    if(values.length === i+1) return apply(values[i], data);
    return null;
  }else if(op === "and") { // Return first falsy, or last
    for(i=0; i < values.length; i+=1) {
      current = apply(values[i], data);
      if( ! truthy(current)) {
        return current;
      }
    }
    return current; // Last
  }else if(op === "or") {// Return first truthy, or last
    for(i=0; i < values.length; i+=1) {
      current = apply(values[i], data);
      if( truthy(current) ) {
        return current;
      }
    }
    return current; // Last




  }else if(op === 'filter'){
    scopedData = apply(values[0], data);
    scopedLogic = values[1];

    if ( ! Array.isArray(scopedData)) {
      return [];
    }
    // Return only the elements from the array in the first argument,
    // that return truthy when passed to the logic in the second argument.
    // For parity with JavaScript, reindex the returned array
    return scopedData.filter(function(datum){
      return truthy( apply(scopedLogic, datum));
    });
  }else if(op === 'map'){
    scopedData = apply(values[0], data);
    scopedLogic = values[1];

    if ( ! Array.isArray(scopedData)) {
      return [];
    }

    return scopedData.map(function(datum){
      return apply(scopedLogic, datum);
    });

  }else if(op === 'reduce'){
    scopedData = apply(values[0], data);
    scopedLogic = values[1];
    initial = typeof values[2] !== 'undefined' ? values[2] : null;

    if ( ! Array.isArray(scopedData)) {
      return initial;
    }

    return scopedData.reduce(
      function(accumulator, current){
        return apply(
          scopedLogic,
          {'current':current, 'accumulator':accumulator}
        );
      },
      initial
    );

  }else if(op === "all") {
    scopedData = apply(values[0], data);
    scopedLogic = values[1];
    // All of an empty set is false. Note, some and none have correct fallback after the for loop
    if( ! scopedData.length) {
      return false;
    }
    for(i=0; i < scopedData.length; i+=1) {
      if( ! truthy( apply(scopedLogic, scopedData[i]) )) {
        return false; // First falsy, short circuit
      }
    }
    return true; // All were truthy
  }else if(op === "none") {
    filtered = apply({'filter' : values}, data);
    return filtered.length === 0;

  }else if(op === "some") {
    filtered = apply({'filter' : values}, data);
    return filtered.length > 0;
  }

  // Everyone else gets immediate depth-first recursion
  values = values.map(function(val) {
    return apply(val, data);
  });


  // The operation is called with "data" bound to its "this" and "values" passed as arguments.
  // Structured commands like % or > can name formal arguments while flexible commands (like missing or merge) can operate on the pseudo-array arguments
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/arguments
  if(typeof operations[op] === "function") {
    return operations[op].apply(data, values);
  }else if(op.indexOf(".") > 0) { // Contains a dot, and not in the 0th position
    var sub_ops = String(op).split(".");
    var operation = operations;
    for(i = 0; i < sub_ops.length; i++) {
      // Descending into operations
      operation = operation[sub_ops[i]];
      if(operation === undefined) {
        throw new Error("Unrecognized operation " + op +
          " (failed at " + sub_ops.slice(0, i+1).join(".") + ")");
      }
    }

    return operation.apply(data, values);
  }

  throw new Error("Unrecognized operation " + op );
}

export default apply;
