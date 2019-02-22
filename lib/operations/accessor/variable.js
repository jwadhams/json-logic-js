function variable(a, b) {
  var not_found = b === undefined ? null : b;
  var data = this;

  if (typeof a === "undefined" || a === "" || a === null) {
    return data;
  }

  var sub_props = String(a).split(".");

  for (var i = 0; i < sub_props.length; i++) {
    if (data === null) {
      return not_found;
    } // Descending into data


    data = data[sub_props[i]];

    if (data === undefined) {
      return not_found;
    }
  }

  return data;
}

variable.code = 'var';
export default variable;