import variable from './varAccessor'

function missing() {
  /*
  Missing can receive many keys as many arguments, like {"missing:[1,2]}
  Missing can also receive *one* argument that is an array of keys,
  which typically happens if it's actually acting on the output of another command
  (like 'if' or 'merge')
  */

  var missing = [];
  var keys = Array.isArray(arguments[0]) ? arguments[0] : arguments;

  for(var i = 0; i < keys.length; i++) {
    var key = keys[i];
    var value = variable.call(this, {"var": key});
    if(value === null || value === "") {
      missing.push(key);
    }
  }

  return missing;
};

export default missing;
