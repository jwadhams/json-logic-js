function lessEqual(a, b, c) {
  return c === undefined ? a <= b : a <= b && b <= c;
}

lessEqual.code = '<=';

export default lessEqual;
