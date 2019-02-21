function multiply(...args) {
  return args.reduce(function(a, b) {
    return parseFloat(a, 10) * parseFloat(b, 10);
  }, 1);
}

export default multiply;
