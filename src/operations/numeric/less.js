function less(a, b, c) {
  return c === undefined ? a < b : a < b && b < c;
}

less.code = '<';

export default less;
