import createJsonLogic from './createJsonLogic';
import * as operations from './operations';
import is_logic from './helpers/is_logic';
import truthy from './helpers/truthy';
import get_operator from './helpers/get_operator';
import get_values from './helpers/get_values';
import uses_data from './helpers/uses_data';
import rule_like from './helpers/rule_like';

const jsonLogic = createJsonLogic(operations);

// restore original public API
jsonLogic.is_logic = is_logic;
jsonLogic.truthy = truthy;
jsonLogic.get_operator = get_operator;
jsonLogic.get_values = get_values;
jsonLogic.uses_data = uses_data;
jsonLogic.rule_like = rule_like;

export default jsonLogic;
