# json-logic-js

The goal of this project is to share complex logical expressions between front-end and back-end code.

The format takes inspiration from [function calls in Amazon CloudFormation JSON templates](http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/gettingstarted.templatebasics.html#gettingstarted.templatebasics.mappings).

## Virtues

  1. Terse.
  1. Consistent. `{"operator" : ["values" ... ]}`  Always.
  1. Secure. We never `eval()`. Rules only have access to data you provide.
  1. Flexible. Most operands are 1 line of code.


## Examples

### Simple
    jsonLogic( { "==" : [1, 1] } );
    // true

This is a nice, simple test. Does 1 equal 1?  A few things about the format:

  1. The operator is always in the "key" position. There is only one key per object.
  1. The values are typically an array.
  1. Values can be any valid JSON type. (Strings usually, but also numbers, booleans, etc)

### Compound
Here we're beginning to nest rules. 

    jsonLogic(
		{"and" : [
		  { ">" : [3,1] },
		  { "<" : [1,3] }
		] }
	);
    // true
  
In an infix language (like JavaScript) this could be written as:

    ( (3 > 1) && (1 < 3) )
    
### Data-Driven

Obviously these rules aren't very interesting if they can only take static literal data. Typically `jsonLogic` will be called with a rule object and a data object. You can use the `var` operator to get attributes of the data object:

    jsonLogic(
		{ "var" : ["a"] }, // Rule
		{ a : 1, b : 2 }   // Data
	);
	// 1

If you like, we support [syntactic sugar](https://en.wikipedia.org/wiki/Syntactic_sugar) on unary operators to skip the array around values:

    jsonLogic(
		{ "var" : "a" },
		{ a : 1, b : 2 }
	);
	// 1

Here's a complex rule that mixes literals and data. The pie isn't ready to eat unless it's cooler than 110 degrees, *and* filled with apples.

    var rules = { "and" : [
      {"<" : [ { "var" : "temp" }, 110 ]},
      {"==" : [ { "var" : "pie.filling" }, "apple" ] }
    ] };

    var data = { "temp" : 100, "pie" : { "filling" : "apple" } };

    jsonLogic(rules, data);
    // true
    
## Supported Operations

  - `==` 
  - `===` 
  - `!=`
  - `!==`
  - `>`
  - `>=`
  - `<`
  - `<=`
  - `!` - Unary negation
  - `and`
  - `or`
  - `var` - Retrieve data from the provided data object
  
