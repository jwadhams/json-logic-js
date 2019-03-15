import isArray from './helpers/isArray';
import isLogic from './helpers/isLogic';
import getOperator from './helpers/getOperator';

function createJsonLogic(_operations) {
  var operations = {};

  if (_operations) {
    Object.keys(_operations).forEach(function (name) {
      var operation = _operations[name];
      addOperation(operation.op || name, operation);
    });
  }

  function addOperation(name, op) {
    if (isArray(name)) {
      name.forEach(function (key) {
        return addOperation(key, op);
      });
      return;
    }

    operations[name] = op;
  }

  function removeOperation(name) {
    if (isArray(name)) {
      name.forEach(function (key) {
        return removeOperation(key);
      });
      return;
    }

    delete operations[name];
  }

  function apply(logic) {
    var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    // Does this array contain logic? Only one way to find out.
    if (isArray(logic)) {
      return logic.map(function (l) {
        return apply(l, data);
      });
    } // You've recursed to a primitive, stop!


    if (!isLogic(logic)) {
      return logic;
    }

    var op = getOperator(logic);
    var values = logic[op];
    var i; // easy syntax for unary operators, like {"var" : "x"} instead of strict {"var" : ["x"]}

    if (!isArray(values)) {
      values = [values];
    }

    var operator = operations[op];

    if (typeof operator === 'function') {
      var _operator$deepFirst = operator.deepFirst,
          deepFirst = _operator$deepFirst === void 0 ? true : _operator$deepFirst; // apply matching visitors first

      if (!deepFirst) {
        return operator(apply, data, values);
      }
    } // Everyone else gets immediate depth-first recursion


    values = values.map(function (val) {
      return apply(val, data);
    }); // The operation is called with "data" bound to its "this" and "values" passed as arguments.
    // Structured commands like % or > can name formal arguments while flexible commands (like missing or merge) can operate on the pseudo-array arguments
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/arguments

    if (typeof operator === 'function') {
      var withApply = operator.withApply;

      if (withApply) {
        values.unshift(apply);
      }

      return operator.apply(data, values);
    }

    if (op.indexOf('.') > 0) {
      // Contains a dot, and not in the 0th position
      var sub_ops = String(op).split('.');
      var operation = operations;

      for (i = 0; i < sub_ops.length; i++) {
        // Descending into operations
        operation = operation[sub_ops[i]];

        if (operation === undefined) {
          throw new Error("Unrecognized operation ".concat(op, " (failed at ").concat(sub_ops.slice(0, i + 1).join('.'), ")"));
        }
      }

      return operation.apply(data, values);
    }

    throw new Error("Unrecognized operation ".concat(op));
  }

  return {
    apply: apply,
    add_operation: addOperation,
    rm_operation: removeOperation
  };
}

export default createJsonLogic;