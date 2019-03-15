import isArray from './isArray';

function is_logic(logic) {
  return (
    typeof logic === 'object' && // An object
    logic !== null && // but not null
    !isArray(logic) && // and not an array
    Object.keys(logic).length === 1 // with exactly one key
  );
}

export default is_logic;
