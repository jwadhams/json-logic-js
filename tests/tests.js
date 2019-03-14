/* global QUnit */

const http = require('http');
const path = require('path');
const fs = require('fs');
const glob = require('glob');
const jsonLogic = require('../dist/jsonLogic.js');
const Ajv = require('./ajv4');
const jsonLogicSchema = require('../schemas/json-logic.json');

const ajv = Ajv({
  // avoid no schema with key or ref "http://json-schema.org/draft-04/schema"
  validateSchema: false,
});

const cwd = __dirname;
glob.sync('../schemas/**/*.json', { cwd }).forEach(file => {
  // eslint-disable-next-line
  const schema = require(path.resolve(cwd, file));

  ajv.addSchema(schema);
});

const validate = ajv.compile(jsonLogicSchema)

const download = (url, dest, cb) => {
  const file = fs.createWriteStream(dest);
  http
    .get(url, response => {
      response.pipe(file);
      file.on('finish', () => {
        file.close(cb); // close() is async, call cb after close completes.
      });
    })
    .on('error', err => {
      // Handle errors
      fs.unlink(dest); // Delete the file async. (But we don't check the result)
      if (cb) cb(err.message);
    });
};

const remote_or_cache = (remote_url, local_file, description, runner) => {
  QUnit.test(`Load and run remote tests form: ${remote_url}`, assert => {
    assert.expect(0);
    // Only waiting on the request() is async
    const done = assert.async();

    const parse_and_iterate = () => {
      fs.readFile(local_file, 'utf8', (error, body) => {
        let tests;
        try {
          tests = JSON.parse(body);
        } catch (e) {
          throw new Error(`Trouble parsing ${description}: ${e.message}`);
        }

        // Remove comments
        tests = tests.filter(test => typeof test !== 'string');

        console.log(`Including ${tests.length} ${description}`);

        QUnit.test(description, assertInner => {
          tests.forEach(test => {
            runner(test, assertInner);
          });
        });

        done();
      });
    };

    fs.stat(local_file, err => {
      if (err) {
        console.log(`Downloading ${description} from JsonLogic.com`);
        download(remote_url, local_file, () => {
          parse_and_iterate();
        });
      } else {
        console.log(`Using cached ${description}`);
        parse_and_iterate();
      }
    });
  });
};

remote_or_cache(
  'http://jsonlogic.com/tests.json',
  'tests/tests.json',
  'applies() tests',
  (test, assert) => {
    const rule = test[0];
    const data = test[1];
    const expected = test[2];

    assert.deepEqual(
      jsonLogic.apply(rule, data),
      expected,
      `jsonLogic.apply(${JSON.stringify(rule)},${JSON.stringify(
        data
      )}) === ${JSON.stringify(expected)}`
    );

    assert.equal(validate(rule), true, JSON.stringify(rule) + JSON.stringify(validate.errors, null, 2));
  }
);

remote_or_cache(
  'http://jsonlogic.com/rule_like.json',
  'tests/rule_like.json',
  'rule_like() tests',
  (test, assert) => {
    const rule = test[0];
    const pattern = test[1];
    const expected = test[2];

    assert.deepEqual(
      jsonLogic.rule_like(rule, pattern),
      expected,
      `jsonLogic.rule_like(${JSON.stringify(rule)},${JSON.stringify(
        pattern
      )}) === ${JSON.stringify(expected)}`
    );

    assert.equal(validate(rule), true, JSON.stringify(rule));
  }
);

QUnit.test('Bad operator', assert => {
  assert.throws(() => {
    jsonLogic.apply({ fubar: [] });
  }, /Unrecognized operation/);
});

QUnit.test('logging', assert => {
  let last_console;
  // eslint-disable-next-line func-names
  console.log = function(logged) {
    last_console = logged;
  };
  assert.equal(jsonLogic.apply({ log: [1] }), 1);
  assert.equal(last_console, 1);

  delete console.log;
});

QUnit.test('edge cases', assert => {
  assert.equal(jsonLogic.apply(), undefined, 'Called with no arguments');
});

QUnit.test('Expanding functionality with add_operator', assert => {
  // Operator is not yet defined
  assert.throws(() => {
    jsonLogic.apply({ add_to_a: [] });
  }, /Unrecognized operation/);

  // Set up some outside data, and build a basic function operator
  let aOutside = 0;
  const add_to_a = b => {
    aOutside += b !== undefined ? b : 1;

    return aOutside;
  };
  jsonLogic.add_operation('add_to_a', add_to_a);
  // New operation executes, returns desired result
  // No args
  assert.equal(jsonLogic.apply({ add_to_a: [] }), 1);
  // Unary syntactic sugar
  assert.equal(jsonLogic.apply({ add_to_a: 41 }), 42);
  // New operation had side effects.
  assert.equal(aOutside, 42);

  const fives = {
    add(i) {
      return i + 5;
    },
    subtract(i) {
      return i - 5;
    },
  };

  jsonLogic.add_operation('fives', fives);
  assert.equal(jsonLogic.apply({ 'fives.add': 37 }), 42);
  assert.equal(jsonLogic.apply({ 'fives.subtract': [47] }), 42);

  // Calling a method with multiple var as arguments.
  jsonLogic.add_operation('times', (a, b) => a * b);
  assert.equal(
    jsonLogic.apply({ times: [{ var: 'a' }, { var: 'b' }] }, { a: 6, b: 7 }),
    42
  );

  // Remove operation:
  jsonLogic.rm_operation('times');

  assert.throws(() => {
    jsonLogic.apply({ times: [2, 2] });
  }, /Unrecognized operation/);

  // Calling a method that takes an array, but the inside of the array has rules, too
  jsonLogic.add_operation('array_times', a => {
    return a[0] * a[1];
  });
  assert.equal(
    jsonLogic.apply(
      { array_times: [[{ var: 'a' }, { var: 'b' }]] },
      { a: 6, b: 7 }
    ),
    42
  );
});

QUnit.test('Expanding functionality with method', assert => {
  // Data contains a real object with methods and local state
  const a = {
    count: 0,
    increment() {
      this.count += 1;

      return this.count;
    },
    add(b) {
      this.count += b;

      return this.count;
    },
  };

  // Look up "a" in data, and run the increment method on it with no args.
  assert.equal(
    jsonLogic.apply({ method: [{ var: 'a' }, 'increment'] }, { a }),
    1 // Happy return value
  );
  assert.equal(a.count, 1); // Happy state change

  // Run the add method with an argument
  assert.equal(
    jsonLogic.apply({ method: [{ var: 'a' }, 'add', [41]] }, { a }),
    42 // Happy return value
  );
  assert.equal(a.count, 42); // Happy state change
});

QUnit.test("Control structures don't eval depth-first", assert => {
  // Depth-first recursion was wasteful but not harmful until we added custom operations that could have side-effects.

  // If operations run the condition, if truthy, it runs and returns that consequent.
  // Consequents of falsy conditions should not run.
  // After one truthy condition, no other condition should run
  let conditions = [];
  let consequents = [];
  jsonLogic.add_operation('push.if', v => {
    conditions.push(v);
    return v;
  });
  jsonLogic.add_operation('push.then', v => {
    consequents.push(v);
    return v;
  });
  jsonLogic.add_operation('push.else', v => {
    consequents.push(v);
    return v;
  });

  jsonLogic.apply({
    if: [
      { 'push.if': [true] },
      { 'push.then': ['first'] },
      { 'push.if': [false] },
      { 'push.then': ['second'] },
      { 'push.else': ['third'] },
    ],
  });
  assert.deepEqual(conditions, [true]);
  assert.deepEqual(consequents, ['first']);

  conditions = [];
  consequents = [];
  jsonLogic.apply({
    if: [
      { 'push.if': [false] },
      { 'push.then': ['first'] },
      { 'push.if': [true] },
      { 'push.then': ['second'] },
      { 'push.else': ['third'] },
    ],
  });
  assert.deepEqual(conditions, [false, true]);
  assert.deepEqual(consequents, ['second']);

  conditions = [];
  consequents = [];
  jsonLogic.apply({
    if: [
      { 'push.if': [false] },
      { 'push.then': ['first'] },
      { 'push.if': [false] },
      { 'push.then': ['second'] },
      { 'push.else': ['third'] },
    ],
  });
  assert.deepEqual(conditions, [false, false]);
  assert.deepEqual(consequents, ['third']);

  let i = [];

  jsonLogic.add_operation('push', arg => {
    i.push(arg);
    return arg;
  });

  i = [];
  jsonLogic.apply({ and: [{ push: [false] }, { push: [false] }] });
  assert.deepEqual(i, [false]);
  i = [];
  jsonLogic.apply({ and: [{ push: [false] }, { push: [true] }] });
  assert.deepEqual(i, [false]);
  i = [];
  jsonLogic.apply({ and: [{ push: [true] }, { push: [false] }] });
  assert.deepEqual(i, [true, false]);
  i = [];
  jsonLogic.apply({ and: [{ push: [true] }, { push: [true] }] });
  assert.deepEqual(i, [true, true]);

  i = [];
  jsonLogic.apply({ or: [{ push: [false] }, { push: [false] }] });
  assert.deepEqual(i, [false, false]);
  i = [];
  jsonLogic.apply({ or: [{ push: [false] }, { push: [true] }] });
  assert.deepEqual(i, [false, true]);
  i = [];
  jsonLogic.apply({ or: [{ push: [true] }, { push: [false] }] });
  assert.deepEqual(i, [true]);
  i = [];
  jsonLogic.apply({ or: [{ push: [true] }, { push: [true] }] });
  assert.deepEqual(i, [true]);
});
