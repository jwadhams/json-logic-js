import isArray from '../../helpers/isArray';
import truthy from '../../helpers/truthy';

function filter(apply, data, values) {
  const scopedData = apply(values[0], data);
  const scopedLogic = values[1];

  if (!isArray(scopedData)) {
    return [];
  }
  // Return only the elements from the array in the first argument,
  // that return truthy when passed to the logic in the second argument.
  // For parity with JavaScript, reindex the returned array
  return scopedData.filter(datum => truthy(apply(scopedLogic, datum)));
}

export default filter;
