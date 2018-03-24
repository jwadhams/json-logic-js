"use strict";
import jsonLogic from './core';

import array from './operations/array';
jsonLogic.add_operations(array);

import control_structures from './operations/control_structures';
jsonLogic.add_operations(control_structures);

import data from './operations/data';
jsonLogic.add_operations(data);

import math from './operations/math';
jsonLogic.add_operations(math);

import method from './operations/method';
jsonLogic.add_operations(method);

import string from './operations/string';
jsonLogic.add_operations(string);

// https://github.com/webpack/webpack/issues/706#issuecomment-167908576
module.exports = jsonLogic;
