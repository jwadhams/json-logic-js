function lowerEqual(a, b, c) {
  return c === undefined ? a <= b : a <= b && b <= c;
}

lowerEqual.code = '<=';

export default lowerEqual;
