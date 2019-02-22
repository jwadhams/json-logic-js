import isArray from '../../helpers/isArray';

function reduce(apply, data, values) {
  var scopedData = apply(values[0], data);
  var scopedLogic = values[1];
  var initial = typeof values[2] !== 'undefined' ? values[2] : null;

  if (!isArray(scopedData)) {
    return initial;
  }

  return scopedData.reduce(function (accumulator, current) {
    return apply(scopedLogic, {
      'current': current,
      'accumulator': accumulator
    });
  }, initial);
}

export default reduce;