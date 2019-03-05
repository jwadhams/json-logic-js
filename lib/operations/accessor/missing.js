import isArray from '../../helpers/isArray';

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
export default missing;