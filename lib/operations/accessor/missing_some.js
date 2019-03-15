function missing_some(apply, need_count, options) {
  // missing_some takes two arguments, how many (minimum) items must be present, and an array of keys (just like 'missing') to check for presence.
  var are_missing = apply({
    missing: options
  }, this);

  if (options.length - are_missing.length >= need_count) {
    return [];
  }

  return are_missing;
}

missing_some.withApply = true;
export default missing_some;