import isArray from '../../helpers/isArray';

function map(apply, data, values) {
  var scopedData = apply(values[0], data);
  var scopedLogic = values[1];

  if (!isArray(scopedData)) {
    return [];
  }

  return scopedData.map(function (datum) {
    return apply(scopedLogic, datum);
  });
}

map.deepFirst = false;
export default map;