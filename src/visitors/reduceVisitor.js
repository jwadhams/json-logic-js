function reduceVisitor(data, values) {
  const scopedData = apply(values[0], data);
  const scopedLogic = values[1];
  const initial = typeof values[2] !== 'undefined' ? values[2] : null;

  if ( ! Array.isArray(scopedData)) {
    return initial;
  }

  return scopedData.reduce(
    function(accumulator, current){
      return apply(
        scopedLogic,
        {'current':current, 'accumulator':accumulator}
      );
    },
    initial
  );
}

export default reduceVisitor;
