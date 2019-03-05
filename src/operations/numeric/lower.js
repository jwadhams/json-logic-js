function lower(a, b, c) {
  return c === undefined ? a < b : a < b && b < c;
}

lower.code = '<';

export default lower;
