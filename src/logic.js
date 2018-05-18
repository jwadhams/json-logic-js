import {arrayUnique} from "./util";
import default_operations from "./default-operations";
import "./is-array-polyfill";

export function is_logic(logic) {
  return (
    typeof logic === "object" && // An object
    logic !== null && // but not null
    !Array.isArray(logic) && // and not an array
    Object.keys(logic).length === 1 // with exactly one key
  );
}

/*
  This helper will defer to the JsonLogic spec as a tie-breaker when different language interpreters define different behavior for the truthiness of primitives.  E.g., PHP considers empty arrays to be falsy, but Javascript considers them to be truthy. JsonLogic, as an ecosystem, needs one consistent answer.

  Spec and rationale here: http://jsonlogic.com/truthy
  */
export function truthy(value) {
  if (Array.isArray(value) && value.length === 0) {
    return false;
  }
  return !!value;
}

export function get_operator(logic) {
  return Object.keys(logic)[0];
}

export function get_values(logic) {
  return logic[get_operator(logic)];
}

export function uses_data(logic) {
  var collection = [];

  if (is_logic(logic)) {
    var op = get_operator(logic);
    var values = logic[op];

    if (!Array.isArray(values)) {
      values = [values];
    }

    if (op === "var") {
      // This doesn't cover the case where the arg to var is itself a rule.
      collection.push(values[0]);
    } else {
      // Recursion!
      values.map(function(val) {
        collection.push.apply(collection, uses_data(val));
      });
    }
  }

  return arrayUnique(collection);
}

export function rule_like(rule, pattern) {
  // console.log("Is ". JSON.stringify(rule) . " like " . JSON.stringify(pattern) . "?");
  if (pattern === rule) {
    return true;
  } // TODO : Deep object equivalency?
  if (pattern === "@") {
    return true;
  } // Wildcard!
  if (pattern === "number") {
    return typeof rule === "number";
  }
  if (pattern === "string") {
    return typeof rule === "string";
  }
  if (pattern === "array") {
    // !logic test might be superfluous in JavaScript
    return Array.isArray(rule) && !is_logic(rule);
  }

  if (is_logic(pattern)) {
    if (is_logic(rule)) {
      var pattern_op = get_operator(pattern);
      var rule_op = get_operator(rule);

      if (pattern_op === "@" || pattern_op === rule_op) {
        // echo "\nOperators match, go deeper\n";
        return rule_like(get_values(rule, false), get_values(pattern, false));
      }
    }
    return false; // pattern is logic, rule isn't, can't be eq
  }

  if (Array.isArray(pattern)) {
    if (Array.isArray(rule)) {
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
    } else {
      return false; // Pattern is array, rule isn't
    }
  }

  // Not logic, not array, not a === match for rule.
  return false;
}

export class JSONLogic {
  constructor() {
    this.operations = {...default_operations};
  }
  apply(logic, data) {
    const {operations} = this;
    const apply = this.apply.bind(this);

    // Does this array contain logic? Only one way to find out.
    if (Array.isArray(logic)) {
      return logic.map(function(l) {
        return apply(l, data);
      });
    }
    // You've recursed to a primitive, stop!
    if (!is_logic(logic)) {
      return logic;
    }

    data = data || {};

    var op = get_operator(logic);
    var values = logic[op];
    var i;
    var current;
    var scopedLogic, scopedData, filtered, initial;

    // easy syntax for unary operators, like {"var" : "x"} instead of strict {"var" : ["x"]}
    if (!Array.isArray(values)) {
      values = [values];
    }

    // 'if', 'and', and 'or' violate the normal rule of depth-first calculating consequents, let each manage recursion as needed.
    if (op === "if" || op == "?:") {
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
      if (values.length === i + 1) return apply(values[i], data);
      return null;
    } else if (op === "and") {
      // Return first falsy, or last
      for (i = 0; i < values.length; i += 1) {
        current = apply(values[i], data);
        if (!truthy(current)) {
          return current;
        }
      }
      return current; // Last
    } else if (op === "or") {
      // Return first truthy, or last
      for (i = 0; i < values.length; i += 1) {
        current = apply(values[i], data);
        if (truthy(current)) {
          return current;
        }
      }
      return current; // Last
    } else if (op === "filter") {
      scopedData = apply(values[0], data);
      scopedLogic = values[1];

      if (!Array.isArray(scopedData)) {
        return [];
      }
      // Return only the elements from the array in the first argument,
      // that return truthy when passed to the logic in the second argument.
      // For parity with JavaScript, reindex the returned array
      return scopedData.filter(function(datum) {
        return truthy(apply(scopedLogic, datum));
      });
    } else if (op === "map") {
      scopedData = apply(values[0], data);
      scopedLogic = values[1];

      if (!Array.isArray(scopedData)) {
        return [];
      }

      return scopedData.map(function(datum) {
        return apply(scopedLogic, datum);
      });
    } else if (op === "reduce") {
      scopedData = apply(values[0], data);
      scopedLogic = values[1];
      initial = typeof values[2] !== "undefined" ? values[2] : null;

      if (!Array.isArray(scopedData)) {
        return initial;
      }

      return scopedData.reduce(function(accumulator, current) {
        return apply(scopedLogic, {
          current: current,
          accumulator: accumulator,
        });
      }, initial);
    } else if (op === "all") {
      scopedData = apply(values[0], data);
      scopedLogic = values[1];
      // All of an empty set is false. Note, some and none have correct fallback after the for loop
      if (!scopedData.length) {
        return false;
      }
      for (i = 0; i < scopedData.length; i += 1) {
        if (!truthy(apply(scopedLogic, scopedData[i]))) {
          return false; // First falsy, short circuit
        }
      }
      return true; // All were truthy
    } else if (op === "none") {
      filtered = apply({filter: values}, data);
      return filtered.length === 0;
    } else if (op === "some") {
      filtered = apply({filter: values}, data);
      return filtered.length > 0;
    }

    // Everyone else gets immediate depth-first recursion
    values = values.map(function(val) {
      return apply(val, data);
    });

    // The operation is called with "data" bound to its "this" and "values" passed as arguments.
    // Structured commands like % or > can name formal arguments while flexible commands (like missing or merge) can operate on the pseudo-array arguments
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/arguments
    if (typeof operations[op] === "function") {
      return operations[op].apply(data, values);
    } else if (op.indexOf(".") > 0) {
      // Contains a dot, and not in the 0th position
      var sub_ops = String(op).split(".");
      var operation = operations;
      for (i = 0; i < sub_ops.length; i++) {
        // Descending into operations
        operation = operation[sub_ops[i]];
        if (operation === undefined) {
          throw new Error(
            "Unrecognized operation " +
              op +
              " (failed at " +
              sub_ops.slice(0, i + 1).join(".") +
              ")"
          );
        }
      }

      return operation.apply(data, values);
    }

    throw new Error("Unrecognized operation " + op);
  }

  add_operation(name, code) {
    this.operations[name] = code;
  }

  rm_operation(name) {
    delete this.operations[name];
  }
}

const defaultInstance = new JSONLogic();

export function apply(logic, data) {
  return defaultInstance.apply.call(defaultInstance, logic, data);
}

export function add_operation(name, code) {
  return defaultInstance.add_operation.call(defaultInstance, name, code);
}

export function rm_operation(name) {
  return defaultInstance.rm_operation.call(defaultInstance, name);
}
