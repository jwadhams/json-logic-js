import isLogic from './isLogic';
import getOperator from './getOperator';

function createJsonLogic() {
  const operations = {}
  const visitors = {}

  function addOperation(name, code) {
    operations[name] = code;
  }

  function removeOperation(name) {
    delete operations[name];
  }

  function addVisitor(name, code) {
    if (Array.isArray(name)) {
      name.forEach(addVisitor);
    }

    visitors[name] = code;
  }

  function removeVisitor(name) {
    if (Array.isArray(name)) {
      name.forEach(removeVisitor);
    }

    delete visitors[name];
  }

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

    const op = getOperator(logic);
    let values = logic[op];
    let i;

    // easy syntax for unary operators, like {"var" : "x"} instead of strict {"var" : ["x"]}
    if( ! Array.isArray(values)) {
      values = [values];
    }

    // apply matching visitors first
    if (typeof visitors[op] === 'function') {
      return visitors[op](apply, data, values);
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

  return {
    add_operation: addOperation,
    rm_operation: removeOperation,
    add_visitor: addVisitor,
    rm_visitor: removeVisitor,
  }
}

export default createJsonLogic;
