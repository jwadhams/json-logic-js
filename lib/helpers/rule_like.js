import isArray from './isArray';
import is_logic from './is_logic';
import get_operator from './get_operator';
import get_values from './get_values';

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

export default rule_like;