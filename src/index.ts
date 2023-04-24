//alt1 base libs, provides all the commonly used methods for image matching and capture
//also gives your editor info about the window.alt1 api
import * as a1lib from "@alt1/base";
import "jquery";
import {ImgRef} from "@alt1/base";
import Dict = NodeJS.Dict;
import {ScanTree} from "./scanclues";
import {gotoRoot, initializeScantrainer} from "./scantrainer";

let $ = jQuery

//tell webpack to add index.html and appconfig.json to output
require("!file-loader?name=[name].[ext]!./index.html");
require("!file-loader?name=[name].[ext]!./style.css");
require("!file-loader?name=[name].[ext]!./appconfig.json");
require("!file-loader?name=img/[name].[ext]!./img/ardounge.data.png");
require("!file-loader?name=img/[name].[ext]!./img/brimhaven.data.png");
require("!file-loader?name=img/[name].[ext]!./img/desert.data.png");
require("!file-loader?name=img/[name].[ext]!./img/dorgeshkaan.data.png");
require("!file-loader?name=img/[name].[ext]!./img/elvenlands.data.png");
require("!file-loader?name=img/[name].[ext]!./img/falador.data.png");
require("!file-loader?name=img/[name].[ext]!./img/fremmenik.data.png");
require("!file-loader?name=img/[name].[ext]!./img/hauntedwoods.data.png");
require("!file-loader?name=img/[name].[ext]!./img/jungle.data.png");
require("!file-loader?name=img/[name].[ext]!./img/keldagrim.data.png");
require("!file-loader?name=img/[name].[ext]!./img/lumbridge.data.png");
require("!file-loader?name=img/[name].[ext]!./img/menaphos.data.png");
require("!file-loader?name=img/[name].[ext]!./img/moslesharmless.data.png");
require("!file-loader?name=img/[name].[ext]!./img/piscatoris.data.png");
require("!file-loader?name=img/[name].[ext]!./img/slayercaves.data.png");
require("!file-loader?name=img/[name].[ext]!./img/taverley.data.png");
require("!file-loader?name=img/[name].[ext]!./img/varrock.data.png");
require("!file-loader?name=img/[name].[ext]!./img/zanaris.data.png");
require("!file-loader?name=img/scanassets/zanaris/[name].[ext]!./img/scanassets/zanaris/zanarisA.webm");

//loads all images as raw pixel data async, images have to be saved as *.data.png
//this also takes care of metadata headers in the image that make browser load the image
//with slightly wrong colors
//this function is async, so you cant access the images instantly but generally takes <20ms
//use `await imgs.promise` if you want to use the images as soon as they are loaded
var imgs = a1lib.ImageDetect.webpackImages({
    ardounge: require("./img/ardounge.data.png"),
    brimhaven: require("./img/brimhaven.data.png"),
    desert: require("./img/desert.data.png"),
    dorgeshkhan: require("./img/dorgeshkaan.data.png"),
    elvenlands: require("./img/elvenlands.data.png"),
    falador: require("./img/falador.data.png"),
    fremmenik: require("./img/fremmenik.data.png"),
    hauntedwoods: require("./img/hauntedwoods.data.png"),
    jungle: require("./img/jungle.data.png"),
    keldagrim: require("./img/keldagrim.data.png"),
    lumbridge: require("./img/lumbridge.data.png"),
    menaphos: require("./img/menaphos.data.png"),
    moslesharmless: require("./img/moslesharmless.data.png"),
    piscatoris: require("./img/piscatoris.data.png"),
    slayercaves: require("./img/slayercaves.data.png"),
    taverley: require("./img/taverley.data.png"),
    varrock: require("./img/varrock.data.png"),
    zanaris: require("./img/zanaris.data.png"),
});


//check if we are running inside alt1 by checking if the alt1 global exists
if (window.alt1) {
    //tell alt1 about the app
    //this makes alt1 show the add app button when running inside the embedded browser
    //also updates app settings if they are changed
    alt1.identifyAppUrl("./appconfig.json");
}

document.addEventListener("DOMContentLoaded", (e) => {
    initializeScantrainer()
})

