import alt1chain from "@alt1/webpack";
import * as path from "path";

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
config.entry("main", "./main.ts")

//where to put all the stuff
config.output(outdir);

let c = config.toConfig()

function mode() : "prod" | "dev" {return "dev"}

c.plugins = [
    new CopyWebpackPlugin({
        patterns: [{
            from: path.resolve(__dirname, "./static")
        }]
    }),
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
    })
]

c.resolve.fallback = {
    "timers": false,
    "assert": false,
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
}

c.resolve.modules = [
    path.resolve('./node_modules'),
    path.resolve('./src')
]

c.optimization = {
    minimize: mode() == "prod"
}

c.mode = (mode() == "prod") ? "production" : "development"

export default c