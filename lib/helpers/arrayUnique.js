/**
 * Return an array that contains no duplicates (original not modified)
 * @param  {array} array   Original reference array
 * @return {array}         New array with no duplicates
 */
function arrayUnique(array) {
  var a = [];

  for (var i = 0, l = array.length; i < l; i++) {
    if (a.indexOf(array[i]) === -1) {
      a.push(array[i]);
    }
  }

  return a;
}

export default arrayUnique;