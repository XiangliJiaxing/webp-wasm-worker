// rollup.config.js
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from "rollup-plugin-terser";

const path = require('path');
const resolve = function (filePath) {
  return path.join(__dirname, '..', filePath);
}

function createConfig(format){
  const dir = format === "module" ? "esm" : format;
  return  {
    input: resolve('src/webp-worker.js'), // 入口文件
    output: { // 出口文件
      file: resolve(`dist/${dir}/index.js`),
      format,
      sourcemap: true
    },
    plugins: [nodeResolve(), commonjs(), terser()]
  }
}

export default [createConfig("cjs"), createConfig("module"), createConfig("system")]
