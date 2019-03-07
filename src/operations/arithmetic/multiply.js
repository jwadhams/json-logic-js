function multiply(...args) {
  return args.reduce((a, b) => parseFloat(a, 10) * parseFloat(b, 10), 1);
}

multiply.op = '*';

export default multiply;
