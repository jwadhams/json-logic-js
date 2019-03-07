function lessEqual(a, b, c) {
  return c === undefined ? a <= b : a <= b && b <= c;
}

lessEqual.op = '<=';

export default lessEqual;
