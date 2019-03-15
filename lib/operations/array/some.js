function some(apply, data, values) {
  var filtered = apply({
    filter: values
  }, data);
  return filtered.length > 0;
}

some.deepFirst = false;
export default some;