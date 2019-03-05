import isArray from './isArray';
import isLogic from './isLogic';
import getOperator from './getOperator';
import getValues from './getValues';

function ruleLike(rule, pattern) {
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
    return isArray(rule) && !isLogic(rule);
  }

  if (isLogic(pattern)) {
    if (isLogic(rule)) {
      var pattern_op = getOperator(pattern);
      var rule_op = getOperator(rule);

      if (pattern_op === '@' || pattern_op === rule_op) {
        // echo "\nOperators match, go deeper\n";
        return ruleLike(getValues(rule, false), getValues(pattern, false));
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
        if (!ruleLike(rule[i], pattern[i])) {
          return false;
        }
      }

      return true; // If they *all* passed, we pass
    }

    return false; // Pattern is array, rule isn't
  } // Not logic, not array, not a === match for rule.


  return false;
}

export default ruleLike;