import truthy from '../../helpers/truthy';

function not(a) {
  return !truthy(a);
}

not.code = '!';

export default not;
