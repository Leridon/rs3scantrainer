import alt1chain from "@alt1/webpack";
import * as path from "path";
import {DefinePlugin, ProvidePlugin} from "webpack";
import * as process from "process";

const CopyWebpackPlugin = require('copy-webpack-plugin');
const CircularDependencyPlugin = require('circular-dependency-plugin');

let srcdir = path.resolve(__dirname, "./src/");
let outdir = path.resolve(__dirname, "./dist/");

//wrapper around webpack-chain, most stuff you'll need are direct properties,
//more finetuning can be done at config.chain
//the wrapper gives decent webpack defaults for everything alt1/typescript/react related
let config = new alt1chain(srcdir, {ugly: false});

//exposes all root level exports as UMD (as named package "testpackege" or "TEST" in global scope)
config.makeUmd("testpackage", "TEST");

//the name and location of our entry file (the name is used for output and can contain a relative path)
config.entry("index", "./index.ts");

//where to put all the stuff
config.output(outdir);

let c = config.toConfig()

const development_mode = process.env.NODE_ENV == "development"

c.plugins = [
  new CopyWebpackPlugin({
    patterns: [{
      from: path.resolve(__dirname, "./static")
    }]
  }),
  new ProvidePlugin({
    process: 'process/browser',
    Buffer: ['buffer', 'Buffer']
  }),
  new DefinePlugin({
    'process.env.DEV_MODE': JSON.stringify(development_mode)
  }),
  /*
  new CircularDependencyPlugin({
      exclude: /a\.js|node_modules/,
      // include specific files based on a RegExp
      include: /src/,
      // add errors to webpack instead of warnings
      //failOnError: true,
      // allow import cycles that include an asyncronous import,
      // e.g. via import( './file.js')
      allowAsyncCycles: true,
      // set the current working directory for displaying module paths
      cwd: process.cwd(),
  })*/
]

if (!c.resolve) c.resolve = {}

c.resolve.fallback = {
  "timers": false,
  "assert": require.resolve("assert"),
  "stream": false,
  "crypto": false,
  "util": false,
  "https": false,
  "http": false,
  "tls": false,
  "net": false,
  "url": false,
  "zlib": false,
  "querystring": false,
  "fs": false,
  "path": false,
  "child_process": false,
  "os": false,
  "buffer": require.resolve("buffer/")
}

c.resolve.modules = [
  path.resolve('./node_modules'),
  path.resolve('./src')
]

c.optimization = {
  minimize: !development_mode
}

c.mode = development_mode ? "development" : "production"

export default c