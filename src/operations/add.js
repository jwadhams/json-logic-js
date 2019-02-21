function add(...args) {
  return args.reduce(function(a, b) {
    return parseFloat(a, 10) + parseFloat(b, 10);
  }, 0);
}

export default add;
