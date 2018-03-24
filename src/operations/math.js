import core from "../core";

export default {
    "+": function() {
        return Array.prototype.reduce.call(arguments, function(a, b) {
            return parseFloat(a, 10) + parseFloat(b, 10);
        }, 0);
    },
    "*": function() {
        return Array.prototype.reduce.call(arguments, function(a, b) {
            return parseFloat(a, 10) * parseFloat(b, 10);
        });
    },
    "-": function(a, b) {
        if(b === undefined) {
            return -a;
        }else{
            return a - b;
        }
    },
    "/": function(a, b) {
        return a / b;
    },
    "%": function(a, b) {
        return a % b;
    },
    "min": function() {
        return Math.min.apply(this, arguments);
    },
    "max": function() {
        return Math.max.apply(this, arguments);
    },
    "==": function(a, b) {
        /* jshint eqeqeq:false */
        return a == b;
    },
    "===": function(a, b) {
        return a === b;
    },
    "!=": function(a, b) {
        /* jshint eqeqeq:false */
        return a != b;
    },
    "!==": function(a, b) {
        return a !== b;
    },
    ">": function(a, b) {
        return a > b;
    },
    ">=": function(a, b) {
        return a >= b;
    },
    "<": function(a, b, c) {
        return (c === undefined) ? a < b : (a < b) && (b < c);
    },
    "<=": function(a, b, c) {
        return (c === undefined) ? a <= b : (a <= b) && (b <= c);
    },
    "!!": function(a) {
        return core.truthy(a);
    },
    "!": function(a) {
        return !core.truthy(a);
    },
};
