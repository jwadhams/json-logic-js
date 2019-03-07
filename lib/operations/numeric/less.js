function less(a, b, c) {
  return c === undefined ? a < b : a < b && b < c;
}

less.op = '<';
export default less;