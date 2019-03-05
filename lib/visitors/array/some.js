function some(apply, data, values) {
  var filtered = apply({
    filter: values
  }, data);
  return filtered.length > 0;
}

export default some;