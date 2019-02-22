import truthy from "../../helpers/truthy";

function all(apply, data, values) {
  const scopedData = apply(values[0], data);
  const scopedLogic = values[1];
  // All of an empty set is false. Note, some and none have correct fallback after the for loop
  if( ! scopedData.length) {
    return false;
  }
  for(let i=0; i < scopedData.length; i+=1) {
    if( ! truthy( apply(scopedLogic, scopedData[i]) )) {
      return false; // First falsy, short circuit
    }
  }
  return true; // All were truthy
}

export default all;
