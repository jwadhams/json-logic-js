function missingSome(apply, need_count, options) {
  // missing_some takes two arguments, how many (minimum) items must be present, and an array of keys (just like 'missing') to check for presence.
  const are_missing = apply({ missing: options }, this);

  if (options.length - are_missing.length >= need_count) {
    return [];
  }
  return are_missing;
}

missingSome.op = 'missing_some';
missingSome.withApply = true;

export default missingSome;
