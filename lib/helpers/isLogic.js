function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

import isArray from './isArray';

function isLogic(logic) {
  return _typeof(logic) === "object" && // An object
  logic !== null && // but not null
  !isArray(logic) && // and not an array
  Object.keys(logic).length === 1 // with exactly one key
  ;
}

export default isLogic;