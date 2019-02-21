function someVisitor(data, values) {
  const filtered = apply({'filter' : values}, data);

  return filtered.length > 0;
}

export default someVisitor;
