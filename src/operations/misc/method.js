function method(obj, method, args) {
  return obj[method].apply(obj, args);
}

export default method;
