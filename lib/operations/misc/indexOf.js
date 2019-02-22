function indexOf(a, b) {
  if (!b || typeof b.indexOf === "undefined") return false;
  return b.indexOf(a) !== -1;
}

indexOf.code = 'in';
export default indexOf;