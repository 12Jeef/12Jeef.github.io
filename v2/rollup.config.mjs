import rollupPluginTypescript from "@rollup/plugin-typescript";
import rollupPluginNodeResolve from "@rollup/plugin-node-resolve";
import rollupPluginCommonJS from "rollup-plugin-commonjs";

import path from "path";

function build(input, output, externals = []) {
  let plugins = [
    rollupPluginTypescript(),
    rollupPluginNodeResolve(),
    rollupPluginCommonJS(),
  ];
  return {
    input: path.join("src", input),
    output: {
      file: path.join("build", output),
      format: "es",
    },
    context: "this",
    external: externals,
    plugins: plugins,
  };
}

export default (args) => {
  return [build(path.join("app.ts"), path.join("app.js"))];
};
