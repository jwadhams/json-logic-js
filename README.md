# json-logic-js

The goal of this project is to represent complex logical expressions in a straightforward way, especially to be executed in a web front end.

The format explicitly takes inspiration from [function calls in Amazon CloudFormation JSON templates](http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/gettingstarted.templatebasics.html#gettingstarted.templatebasics.mappings).

## Examples

### Simple
    jsonLogic({"==" : [1, 1]});
    //true

This is a nice, simple test. Does 1 equal 1?  A few things about the format:

  1. The operator is always in the "key" position. There is only one key per object.
  1. The values are typically an array (although unary operators like `!` and `var` can take a single arg or array containing a single arg)
  1. Values can be any valid JSON type. (Strings usually, but also numbers, booleans, etc)

### Compound
    jsonLogic({"and" : [
      {">" : [3,1]},
      {"<" : [1,3]}
    ]});
    //true
  
Here we're beginning to nest rules. In an infix language (like JavaScript) this could be written as:
    ( (3 > 1) && (1 < 3) )
    
### Data-Driven

Obviously these rules aren't very interesting if they can only take static literal data. Typically `jsonLogic` will be called with a rule object and a data object. You can use the `var` command to operate on attributes of the data object:

    var data = { "temp" : 100, "pie" : { "filling" : "apple" } };
    var rules = { "and" : [
      {"<" : [ {"var" : "temp"}, 110 ]},
      {"==" : [ {"var" : "pie.filling" }, "apple" }
    ]};
    var readyToEat = jsonLogic(rules, data);
    //true
    
