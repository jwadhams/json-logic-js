function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

import isArray from './isArray';
import is_logic from './is_logic';
import get_operator from './get_operator';
import arrayUnique from './arrayUnique';

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

export default uses_data;