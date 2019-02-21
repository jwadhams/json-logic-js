function varAccessor(a, b) {
  const not_found = (b === undefined) ? null : b;
  let data = this;

  if(typeof a === "undefined" || a==="" || a===null) {
    return data;
  }

  const sub_props = String(a).split(".");

  for(let i = 0; i < sub_props.length; i++) {
    if(data === null) {
      return not_found;
    }
    // Descending into data
    data = data[sub_props[i]];
    if(data === undefined) {
      return not_found;
    }
  }

  return data;
}

export default varAccessor;
