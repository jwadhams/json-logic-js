function indexOf(a, b) {
  if (!b || typeof b.indexOf === 'undefined') return false;
  return b.indexOf(a) !== -1;
}

indexOf.op = 'in';

export default indexOf;
