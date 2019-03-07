import truthy from '../../helpers/truthy';

function not(a) {
  return !truthy(a);
}

not.op = '!';
export default not;