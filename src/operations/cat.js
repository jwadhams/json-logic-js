function cat() {
  return Array.prototype.join.call(arguments, "");
}

export default cat;
