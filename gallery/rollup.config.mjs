import rollupPluginTypescript from "@rollup/plugin-typescript";
import rollupPluginNodeResolve from "@rollup/plugin-node-resolve";
import rollupPluginCommonJS from "rollup-plugin-commonjs";
import rollupPluginReplace from "@rollup/plugin-replace";

import fs from "fs";
import path from "path";

function build(input, output, externals = []) {
  let plugins = [
    rollupPluginTypescript(),
    rollupPluginNodeResolve(),
    rollupPluginCommonJS(),
    rollupPluginReplace({
      __artworks__: JSON.stringify(fs.readdirSync(path.join("assets", "art"))),
    }),
  ];
  return {
    input: path.join("src", input),
    output: {
      file: path.join(output),
      format: "es",
    },
    context: "this",
    external: externals,
    plugins: plugins,
  };
}

export default (args) => {
  return [
    build(path.join("app.ts"), path.join("app.js")),
    build(path.join("worker.ts"), path.join("worker.js")),
  ];
};
