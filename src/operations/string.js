import core from "../core";

export default {
    "in": function(a, b) {
        if(!b || typeof b.indexOf === "undefined"){
            return false;
        }
        return (b.indexOf(a) !== -1);
    },
    "cat": function() {
        return Array.prototype.join.call(arguments, "");
    },
    "substr":function(source, start, end) {
        if(end < 0){
            // JavaScript doesn't support negative end, this emulates PHP behavior
            var temp = String(source).substr(start);
            return temp.substr(0, temp.length + end);
        }
        return String(source).substr(start, end);
    },
};
