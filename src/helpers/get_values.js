import get_operator from './get_operator';

function get_values(logic) {
  return logic[get_operator(logic)];
}

export default get_values;
