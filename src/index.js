import createJsonLogic from './createJsonLogic';
import * as operations from './operations';
import * as visitors from './visitors';

const jsonLogic = createJsonLogic();

Object.keys(operations).forEach(function(name) {
  const operation = operations[name];

  jsonLogic.add_operation(operation.code || name , operation);
});

Object.keys(visitors).forEach(function(name) {
  const visitor = visitors[name];

  jsonLogic.add_visitor(visitor.code || name , visitor);
});

export default jsonLogic;
