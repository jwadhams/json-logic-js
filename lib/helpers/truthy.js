import isArray from './isArray';
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

export default truthy;