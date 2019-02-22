function merge(...args) {
  return args.reduce(function(a, b) {
    return a.concat(b);
  }, []);
}

export default merge;
