function none(apply, data, values) {
  var filtered = apply({
    filter: values
  }, data);
  return filtered.length === 0;
}

none.deepFirst = false;
export default none;