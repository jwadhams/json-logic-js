export createJsonLogic from './createJsonLogic';
import * as operations from './operations';
import * as visitors from './visitors';
import isLogic from "./helpers/isLogic";
import truthy from "./helpers/truthy";
import getOperator from "./helpers/getOperator";
import getValues from "./helpers/getValues";
import usesData from "./helpers/usesData";
import ruleLike from "./helpers/ruleLike";

const jsonLogic = createJsonLogic(operations, visitors);

// restore original public API
jsonLogic.is_logic = isLogic;
jsonLogic.truthy = truthy;
jsonLogic.get_operator = getOperator;
jsonLogic.get_values = getValues;
jsonLogic.uses_data = usesData;
jsonLogic.rule_like = ruleLike;

export default jsonLogic;
