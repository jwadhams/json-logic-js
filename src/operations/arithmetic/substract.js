function substract(a, b) {
  if (b === undefined) {
    return -a;
  }
  return a - b;
}

substract.op = '-';

export default substract;
