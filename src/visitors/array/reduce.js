import isArray from '../../helpers/isArray';

function reduce(apply, data, values) {
  const scopedData = apply(values[0], data);
  const scopedLogic = values[1];
  const initial = typeof values[2] !== 'undefined' ? values[2] : null;

  if (!isArray(scopedData)) {
    return initial;
  }

  return scopedData.reduce(
    (accumulator, current) => apply(scopedLogic, { current, accumulator }),
    initial
  );
}

export default reduce;
