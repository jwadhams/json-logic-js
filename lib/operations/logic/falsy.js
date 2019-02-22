import truthy from '../../helpers/truthy';

function falsy(a) {
  return !truthy(a);
}

falsy.code = '!';
export default falsy;