function mapVisitor(data, values) {
  const scopedData = apply(values[0], data);
  const scopedLogic = values[1];

  if ( ! Array.isArray(scopedData)) {
    return [];
  }

  return scopedData.map(function(datum){
    return apply(scopedLogic, datum);
  });
}

export default mapVisitor;
