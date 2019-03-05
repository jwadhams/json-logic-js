function add(...args) {
  return args.reduce((a, b) => parseFloat(a, 10) + parseFloat(b, 10), 0);
}

add.code = '+';

export default add;
