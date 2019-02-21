import truthy from "../helpers/truthy";

function filter(apply, data, values) {
  const scopedData = apply(values[0], data);
  const scopedLogic = values[1];

  if ( ! Array.isArray(scopedData)) {
    return [];
  }
  // Return only the elements from the array in the first argument,
  // that return truthy when passed to the logic in the second argument.
  // For parity with JavaScript, reindex the returned array
  return scopedData.filter(function(datum){
    return truthy( apply(scopedLogic, datum));
  });
}

export default filter
