function substr(source, start, end) {
  if (end < 0) {
    // JavaScript doesn't support negative end, this emulates PHP behavior
    var temp = String(source).substr(start);
    return temp.substr(0, temp.length + end);
  }

  return String(source).substr(start, end);
}

export default substr;