//alt1 base libs, provides all the commonly used methods for image matching and capture
//also gives your editor info about the window.alt1 api
import {initialize} from "./application";
import {HostedMapData, PathFinder} from "./model/movement";

require("bootstrap")

document.addEventListener("DOMContentLoaded", (e) => {

    //check if we are running inside alt1 by checking if the alt1 global exists
    if (window.alt1) {
        //tell alt1 about the app
        //this makes alt1 show the add app button when running inside the embedded browser
        //also updates app settings if they are changed
        alt1.identifyAppUrl("./appconfig.json");
    }

    initialize()

    PathFinder.pathFinder(HostedMapData.get(), {
        x: 2965, y: 3379, level: 0
    }, {
        x: 2954, y: 3390, level: 0
    }).then(console.log)
})


