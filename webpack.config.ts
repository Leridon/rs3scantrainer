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

//where to put all the stuff
config.output(outdir);

let c = config.toConfig()

c.plugins = [
    new CopyWebpackPlugin({
        patterns: [
            {
                from: "assets",
                to: "assets"
            }
        ]
    }),
    new CircularDependencyPlugin({
        exclude: /a\.js|node_modules/,
        // include specific files based on a RegExp
        include: /src/,
        // add errors to webpack instead of warnings
        //failOnError: true,
        // allow import cycles that include an asyncronous import,
        // e.g. via import( './file.js')
        allowAsyncCycles: false,
        // set the current working directory for displaying module paths
        cwd: process.cwd(),
    })
]

c.resolve.fallback = {
    "timers": false
}

export default c