import core from "../core";

export default {
    "method": function(obj, method, args) {
        return obj[method].apply(obj, args);
    },
    "log": function(a) {
        console.log(a); return a;
    },
};
