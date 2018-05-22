import babel from "rollup-plugin-babel";
import resolve from "rollup-plugin-node-resolve";

export default {
  input: "src/logic.js",
  output: [
    {
      name: "jsonLogic",
      file: "dist/logic.js",
      format: "umd",
    },
    {
      file: "dist/logic.mjs",
      format: "es",
    },
  ],
  plugins: [
    babel({
      exclude: "node_modules/**",
    }),
    resolve(),
  ],
};
