import truthy from "../helpers/truthy";

function orVisitor(data, values, current) {
  for(let i=0; i < values.length; i++) {
    current = apply(values[i], data);
    if( truthy(current) ) {
      return current;
    }
  }
  return current; // Last
}

export default orVisitor;
