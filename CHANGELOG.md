# Change Log

## 2.0.0

Major version bump because we're removing the `method` operation. The [NPM advisory 1542](https://www.npmjs.com/advisories/1542) shows that an attacker can supply a JsonLogic rule that will execute arbitrary code in the client of anyone who executes that rule with any data.

## 1.2.3

Cleaned up JsonLogic's behavior when the `data` parameter is not an object, especially when it's falsy. Resolves PRs [88](https://github.com/jwadhams/json-logic-js/pull/88) and [89](https://github.com/jwadhams/json-logic-js/pull/89), but more importantly makes the `var` operator more resilient.
