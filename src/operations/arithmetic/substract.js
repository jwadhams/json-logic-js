function substract(a, b) {
  if (b === undefined) {
    return -a;
  }
  return a - b;
}

substract.code = '-';

export default substract;
