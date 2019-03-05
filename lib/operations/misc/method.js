function method(obj, methodName, args) {
  // eslint-disable-next-line prefer-spread
  return obj[methodName].apply(obj, args);
}

export default method;