import isArray from '../../helpers/isArray';

function map(apply, data, values) {
  const scopedData = apply(values[0], data);
  const scopedLogic = values[1];

  if (!isArray(scopedData)) {
    return [];
  }

  return scopedData.map(datum => apply(scopedLogic, datum));
}

map.deepFirst = false;

export default map;
