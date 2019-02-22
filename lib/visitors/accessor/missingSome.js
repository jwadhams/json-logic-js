import missing from './missing';

function missingSome(need_count, options) {
  // missing_some takes two arguments, how many (minimum) items must be present, and an array of keys (just like 'missing') to check for presence.
  var are_missing = missing.call(this, {
    "missing": options
  });

  if (options.length - are_missing.length >= need_count) {
    return [];
  } else {
    return are_missing;
  }
}

missingSome.code = 'missing_some';
export default missingSome;