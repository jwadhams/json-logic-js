const babel = require('rollup-plugin-babel');
const resolve = require('rollup-plugin-node-resolve');
const uglify = require('rollup-plugin-uglify');
const optimize = require('rollup-plugin-optimize-js');
const filesize = require('rollup-plugin-filesize');

module.exports = [{
  input: 'src/index.js',
  plugins: [
    resolve(),
    babel(),
    filesize({ showMinifiedSize: false }),
  ],
  output: {
    file: 'dist/jsonLogic.js',
    format: 'umd',
    name: 'jsonLogic',
    exports: 'default',
  }
}, {
  input: 'src/index.js',
  plugins: [
    resolve(),
    babel(),
    uglify.uglify(),
    optimize(),
    filesize({ showMinifiedSize: false }),
  ],
  output: {
    file: 'dist/jsonLogic.min.js',
    format: 'umd',
    name: 'jsonLogic',
    exports: 'default',
  }
}];
