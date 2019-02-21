import truthy from "../helpers/truthy";

function and(apply, data, values) {
  let current;

  for(let i=0; i < values.length; i++) {
    current = apply(values[i], data);
    if( ! truthy(current)) {
      return current;
    }
  }
  return current; // Last
}

export default and;
