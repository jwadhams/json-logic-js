import isArray from './isArray';
import isLogic from './isLogic';
import getOperator from './getOperator';
import arrayUnique from './arrayUnique';

function usesData(logic) {
  const collection = [];

  if (isLogic(logic)) {
    const op = getOperator(logic);
    let values = logic[op];

    if (!isArray(values)) {
      values = [values];
    }

    if (op === 'var') {
      // This doesn't cover the case where the arg to var is itself a rule.
      collection.push(values[0]);
    } else {
      // Recursion!
      values.forEach(val => {
        collection.push(...usesData(val));
      });
    }
  }

  return arrayUnique(collection);
}

export default usesData;
