"use strict";

import core from '../core';

var _if = function() {
    /* 'if' should be called with an odd number of parameters, 3 or greater
    This works on the pattern:
    if( 0 ){ 1 }else{ 2 };
    if( 0 ){ 1 }else if( 2 ){ 3 }else{ 4 };
    if( 0 ){ 1 }else if( 2 ){ 3 }else if( 4 ){ 5 }else{ 6 };

    The implementation is:
    For pairs of values (0,1 then 2,3 then 4,5 etc)
    If the first evaluates truthy, evaluate and return the second
    If the first evaluates falsy, jump to the next pair (e.g, 0,1 to 2,3)
    given one parameter, evaluate and return it. (it's an Else and all the If/ElseIf were false)
    given 0 parameters, return NULL (not great practice, but there was no Else)
    */
    for (var i = 0; i < arguments.length - 1; i += 2) {
        if (core.truthy(core.apply(arguments[i], this))) {
            return core.apply(arguments[i + 1], this);
        }
    }
    if (arguments.length === i + 1){
        return core.apply(arguments[i], this);
    }
    return null;
};
_if.manages_own_recursion = true;

var ternary = function(){
    return core.apply({"if" : Array.from(arguments) });
};
ternary.manages_own_recursion = true;

module.exports = {
    "if" : _if,
    "?:" : ternary,
};
