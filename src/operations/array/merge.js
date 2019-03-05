function merge(...args) {
  return args.reduce((a, b) => a.concat(b), []);
}

export default merge;
