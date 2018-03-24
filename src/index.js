"use strict";
import jsonLogic from './core';

import control_structures from './operations/control_structures';
jsonLogic.add_operations(control_structures);

// https://github.com/webpack/webpack/issues/706#issuecomment-167908576
module.exports = jsonLogic;
