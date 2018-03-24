import core from "../core";

export default {
    "var": function(a, b) {
        var not_found = (b === undefined) ? null : b;
        var data = this;
        if(typeof a === "undefined" || a==="" || a===null) {
            return data;
        }
        var sub_props = String(a).split(".");
        for(var i = 0; i < sub_props.length; i++) {
            if(data === null) {
                return not_found;
            }
            // Descending into data
            data = data[sub_props[i]];
            if(data === undefined) {
                return not_found;
            }
        }
        return data;
    },
    "missing": function() {
        /*
        Missing can receive many keys as many arguments, like {"missing:[1,2]}
        Missing can also receive *one* argument that is an array of keys,
        which typically happens if it's actually acting on the output of another command
        (like 'if' or 'merge')
        */

        var missing = [];
        var keys = Array.isArray(arguments[0]) ? arguments[0] : arguments;

        for(var i = 0; i < keys.length; i++) {
            var key = keys[i];
            var value = core.apply({"var": key}, this);
            if(value === null || value === "") {
                missing.push(key);
            }
        }

        return missing;
    },
    "missing_some": function(need_count, options) {
        // missing_some takes two arguments, how many (minimum) items must be present, and an array of keys (just like 'missing') to check for presence.
        var are_missing = core.apply({"missing": options}, this);

        if(options.length - are_missing.length >= need_count) {
            return [];
        }else{
            return are_missing;
        }
    },

};
