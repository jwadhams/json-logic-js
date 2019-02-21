import isLogic from './isLogic';
import getOperator from './getOperator';
import arrayUnique from './arrayUnique';

function usesData(logic) {
  var collection = [];

  if(isLogic(logic) ) {
    var op = getOperator(logic);
    var values = logic[op];

    if( ! Array.isArray(values)) {
      values = [values];
    }

    if(op === "var") {
      // This doesn't cover the case where the arg to var is itself a rule.
      collection.push(values[0]);
    }else{
      // Recursion!
      values.map(function(val) {
        collection.push.apply(collection, usesData(val) );
      });
    }
  }

  return arrayUnique(collection);
};

export default usesData;
