import getOperator from './getOperator';

function getValues(logic) {
  return logic[getOperator(logic)];
}

export default getValues;
