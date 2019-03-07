function add(...args) {
  return args.reduce((a, b) => parseFloat(a, 10) + parseFloat(b, 10), 0);
}

add.op = '+';

export default add;
