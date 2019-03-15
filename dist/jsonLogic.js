(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.jsonLogic = factory());
}(this, function () { 'use strict';

  var isArray = Array.isArray;

  function _typeof(obj) {
    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof = function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

  function _toConsumableArray(arr) {
    return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread();
  }

  function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) {
      for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

      return arr2;
    }
  }

  function _iterableToArray(iter) {
    if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter);
  }

  function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance");
  }

  function is_logic(logic) {
    return _typeof(logic) === 'object' && // An object
    logic !== null && // but not null
    !isArray(logic) && // and not an array
    Object.keys(logic).length === 1 // with exactly one key
    ;
  }

  function get_operator(logic) {
    return Object.keys(logic)[0];
  }

  function createJsonLogic(_operations) {
    var operations = {};

    if (_operations) {
      Object.keys(_operations).forEach(function (name) {
        var operation = _operations[name];
        add_operation(operation.op || name, operation);
      });
    }

    function add_operation(name, op) {
      if (isArray(name)) {
        name.forEach(function (key) {
          return add_operation(key, op);
        });
        return;
      }

      operations[name] = op;
    }

    function rm_operation(name) {
      if (isArray(name)) {
        name.forEach(function (key) {
          return rm_operation(key);
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


      if (!is_logic(logic)) {
        return logic;
      }

      var op = get_operator(logic);
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
      add_operation: add_operation,
      rm_operation: rm_operation
    };
  }

  function variable(a, b) {
    var not_found = b === undefined ? null : b;
    var data = this;

    if (typeof a === 'undefined' || a === '' || a === null) {
      return data;
    }

    var sub_props = String(a).split('.');

    for (var i = 0; i < sub_props.length; i++) {
      if (data === null) {
        return not_found;
      } // Descending into data


      data = data[sub_props[i]];

      if (data === undefined) {
        return not_found;
      }
    }

    return data;
  }

  variable.op = 'var';

  function missing(apply) {
    /*
    Missing can receive many keys as many arguments, like {"missing:[1,2]}
    Missing can also receive *one* argument that is an array of keys,
    which typically happens if it's actually acting on the output of another command
    (like 'if' or 'merge')
    */
    var are_missing = [];

    for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }

    var keys = isArray(args[0]) ? args[0] : args;

    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      var value = apply({
        var: key
      }, this);

      if (value === null || value === '') {
        are_missing.push(key);
      }
    }

    return are_missing;
  }

  missing.withApply = true;

  function missing_some(apply, need_count, options) {
    // missing_some takes two arguments, how many (minimum) items must be present, and an array of keys (just like 'missing') to check for presence.
    var are_missing = apply({
      missing: options
    }, this);

    if (options.length - are_missing.length >= need_count) {
      return [];
    }

    return are_missing;
  }

  missing_some.withApply = true;

  function add() {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return args.reduce(function (a, b) {
      return parseFloat(a, 10) + parseFloat(b, 10);
    }, 0);
  }

  add.op = '+';

  function divide(a, b) {
    return a / b;
  }

  divide.op = '/';

  function modulo(a, b) {
    return a % b;
  }

  modulo.op = '%';

  function multiply() {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return args.reduce(function (a, b) {
      return parseFloat(a, 10) * parseFloat(b, 10);
    }, 1);
  }

  multiply.op = '*';

  function substract(a, b) {
    if (b === undefined) {
      return -a;
    }

    return a - b;
  }

  substract.op = '-';

  /*
    This helper will defer to the JsonLogic spec as a tie-breaker when different language interpreters define different behavior for the truthiness of primitives.  E.g., PHP considers empty arrays to be falsy, but Javascript considers them to be truthy. JsonLogic, as an ecosystem, needs one consistent answer.

    Spec and rationale here: http://jsonlogic.com/truthy
    */

  function truthy(value) {
    if (isArray(value) && value.length === 0) {
      return false;
    }

    return !!value;
  }

  function all(apply, data, values) {
    var scopedData = apply(values[0], data);
    var scopedLogic = values[1]; // All of an empty set is false. Note, some and none have correct fallback after the for loop

    if (!scopedData.length) {
      return false;
    }

    for (var i = 0; i < scopedData.length; i += 1) {
      if (!truthy(apply(scopedLogic, scopedData[i]))) {
        return false; // First falsy, short circuit
      }
    }

    return true; // All were truthy
  }

  all.deepFirst = false;

  function filter(apply, data, values) {
    var scopedData = apply(values[0], data);
    var scopedLogic = values[1];

    if (!isArray(scopedData)) {
      return [];
    } // Return only the elements from the array in the first argument,
    // that return truthy when passed to the logic in the second argument.
    // For parity with JavaScript, reindex the returned array


    return scopedData.filter(function (datum) {
      return truthy(apply(scopedLogic, datum));
    });
  }

  filter.deepFirst = false;

  function map(apply, data, values) {
    var scopedData = apply(values[0], data);
    var scopedLogic = values[1];

    if (!isArray(scopedData)) {
      return [];
    }

    return scopedData.map(function (datum) {
      return apply(scopedLogic, datum);
    });
  }

  map.deepFirst = false;

  function merge() {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return args.reduce(function (a, b) {
      return a.concat(b);
    }, []);
  }

  function none(apply, data, values) {
    var filtered = apply({
      filter: values
    }, data);
    return filtered.length === 0;
  }

  none.deepFirst = false;

  function reduce(apply, data, values) {
    var scopedData = apply(values[0], data);
    var scopedLogic = values[1];
    var initial = typeof values[2] !== 'undefined' ? values[2] : null;

    if (!isArray(scopedData)) {
      return initial;
    }

    return scopedData.reduce(function (accumulator, current) {
      return apply(scopedLogic, {
        current: current,
        accumulator: accumulator
      });
    }, initial);
  }

  reduce.deepFirst = false;

  function some(apply, data, values) {
    var filtered = apply({
      filter: values
    }, data);
    return filtered.length > 0;
  }

  some.deepFirst = false;

  function and(apply, data, values) {
    var current;

    for (var i = 0; i < values.length; i++) {
      current = apply(values[i], data);

      if (!truthy(current)) {
        return current;
      }
    }

    return current; // Last
  }

  and.deepFirst = false;

  function condition(apply, data, values) {
    var i;
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

    for (i = 0; i < values.length - 1; i += 2) {
      if (truthy(apply(values[i], data))) {
        return apply(values[i + 1], data);
      }
    }

    if (values.length === i + 1) {
      return apply(values[i], data);
    }

    return null;
  }

  condition.op = ['if', '?:'];
  condition.deepFirst = false;

  function equal(a, b) {
    // eslint-disable-next-line eqeqeq
    return a == b;
  }

  equal.op = '==';

  function not(a) {
    return !truthy(a);
  }

  not.op = '!';

  function notEqual(a, b) {
    // eslint-disable-next-line eqeqeq
    return a != b;
  }

  notEqual.op = '!=';

  truthy.op = '!!';

  function or(apply, data, values) {
    var current;

    for (var i = 0; i < values.length; i++) {
      current = apply(values[i], data);

      if (truthy(current)) {
        return current;
      }
    }

    return current; // Last
  }

  or.deepFirst = false;

  function strictEqual(a, b) {
    return a === b;
  }

  strictEqual.op = '===';

  function strictNotEqual(a, b) {
    return a !== b;
  }

  strictNotEqual.op = '!==';

  function indexOf(a, b) {
    if (!b || typeof b.indexOf === 'undefined') return false;
    return b.indexOf(a) !== -1;
  }

  indexOf.op = 'in';

  function log(a) {
    // eslint-disable-next-line no-console
    console.log(a);
    return a;
  }

  function method(obj, methodName, args) {
    // eslint-disable-next-line prefer-spread
    return obj[methodName].apply(obj, args);
  }

  function greater(a, b) {
    return a > b;
  }

  greater.op = '>';

  function greaterEqual(a, b) {
    return a >= b;
  }

  greaterEqual.op = '>=';

  function less(a, b, c) {
    return c === undefined ? a < b : a < b && b < c;
  }

  less.op = '<';

  function lessEqual(a, b, c) {
    return c === undefined ? a <= b : a <= b && b <= c;
  }

  lessEqual.op = '<=';

  function max() {
    return Math.max.apply(Math, arguments);
  }

  function min() {
    return Math.min.apply(Math, arguments);
  }

  function cat() {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return args.join('');
  }

  function substr(source, start, end) {
    if (end < 0) {
      // JavaScript doesn't support negative end, this emulates PHP behavior
      var temp = String(source).substr(start);
      return temp.substr(0, temp.length + end);
    }

    return String(source).substr(start, end);
  }



  var operations = /*#__PURE__*/Object.freeze({
    variable: variable,
    missing: missing,
    missing_some: missing_some,
    add: add,
    divide: divide,
    modulo: modulo,
    multiply: multiply,
    substract: substract,
    all: all,
    filter: filter,
    map: map,
    merge: merge,
    none: none,
    reduce: reduce,
    some: some,
    and: and,
    condition: condition,
    equal: equal,
    not: not,
    notEqual: notEqual,
    notnot: truthy,
    or: or,
    strictEqual: strictEqual,
    strictNotEqual: strictNotEqual,
    indexOf: indexOf,
    log: log,
    method: method,
    greater: greater,
    greaterEqual: greaterEqual,
    less: less,
    lessEqual: lessEqual,
    max: max,
    min: min,
    cat: cat,
    substr: substr
  });

  function get_values(logic) {
    return logic[get_operator(logic)];
  }

  /**
   * Return an array that contains no duplicates (original not modified)
   * @param  {array} array   Original reference array
   * @return {array}         New array with no duplicates
   */
  function arrayUnique(array) {
    var a = [];

    for (var i = 0, l = array.length; i < l; i++) {
      if (a.indexOf(array[i]) === -1) {
        a.push(array[i]);
      }
    }

    return a;
  }

  function uses_data(logic) {
    var collection = [];

    if (is_logic(logic)) {
      var op = get_operator(logic);
      var values = logic[op];

      if (!isArray(values)) {
        values = [values];
      }

      if (op === 'var') {
        // This doesn't cover the case where the arg to var is itself a rule.
        collection.push(values[0]);
      } else {
        // Recursion!
        values.forEach(function (val) {
          collection.push.apply(collection, _toConsumableArray(uses_data(val)));
        });
      }
    }

    return arrayUnique(collection);
  }

  function rule_like(rule, pattern) {
    // console.log("Is ". JSON.stringify(rule) . " like " . JSON.stringify(pattern) . "?");
    if (pattern === rule) {
      return true;
    } // TODO : Deep object equivalency?


    if (pattern === '@') {
      return true;
    } // Wildcard!


    if (pattern === 'number') {
      return typeof rule === 'number';
    }

    if (pattern === 'string') {
      return typeof rule === 'string';
    }

    if (pattern === 'array') {
      // !logic test might be superfluous in JavaScript
      return isArray(rule) && !is_logic(rule);
    }

    if (is_logic(pattern)) {
      if (is_logic(rule)) {
        var pattern_op = get_operator(pattern);
        var rule_op = get_operator(rule);

        if (pattern_op === '@' || pattern_op === rule_op) {
          // echo "\nOperators match, go deeper\n";
          return rule_like(get_values(rule, false), get_values(pattern, false));
        }
      }

      return false; // pattern is logic, rule isn't, can't be eq
    }

    if (isArray(pattern)) {
      if (isArray(rule)) {
        if (pattern.length !== rule.length) {
          return false;
        }
        /*
          Note, array order MATTERS, because we're using this array test logic to consider arguments, where order can matter. (e.g., + is commutative, but '-' or 'if' or 'var' are NOT)
        */


        for (var i = 0; i < pattern.length; i += 1) {
          // If any fail, we fail
          if (!rule_like(rule[i], pattern[i])) {
            return false;
          }
        }

        return true; // If they *all* passed, we pass
      }

      return false; // Pattern is array, rule isn't
    } // Not logic, not array, not a === match for rule.


    return false;
  }

  var jsonLogic = createJsonLogic(operations); // restore original public API

  jsonLogic.is_logic = is_logic;
  jsonLogic.truthy = truthy;
  jsonLogic.get_operator = get_operator;
  jsonLogic.get_values = get_values;
  jsonLogic.uses_data = uses_data;
  jsonLogic.rule_like = rule_like;

  return jsonLogic;

}));
//# sourceMappingURL=jsonLogic.js.map
