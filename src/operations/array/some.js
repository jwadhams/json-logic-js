function some(apply, data, values) {
  const filtered = apply({ filter: values }, data);

  return filtered.length > 0;
}

some.deepFirst = false;

export default some;
