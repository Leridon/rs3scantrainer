//alt1 base libs, provides all the commonly used methods for image matching and capture
//also gives your editor info about the window.alt1 api
import * as a1lib from "@alt1/base";
import "jquery";
import {ImgRef} from "@alt1/base";
import Dict = NodeJS.Dict;

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

var output = document.getElementById("output");

//loads all images as raw pixel data async, images have to be saved as *.data.png
//this also takes care of metadata headers in the image that make browser load the image
//with slightly wrong colors
//this function is async, so you cant acccess the images instantly but generally takes <20ms
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

class DecisionTree {

    constructor(public instruction: string,
                public candidates: number[] | Dict<DecisionTree>
    ) {
    }

    allCandidates(): number[] {

        if (this.candidates instanceof Array<number>) return this.candidates

        let res: number[] = []

        for (let candidatesKey in this.candidates) res = res.concat(this.candidates[candidatesKey].allCandidates())

        return res
    }

    html(isActive: boolean, prefix: JQuery | null, depth: number) {
        let outer = $("<div>")

        if (prefix) outer.append(prefix)

        if (depth <= 0) {
            $("<span>")
                .text("...")
                .appendTo(outer)
        } else if (this.candidates instanceof Array<number>) {
            $("<span>")
                .text(this.instruction)
                .appendTo(outer)
        } else {
            $("<span>")
                .text(this.instruction)
                .appendTo(outer)

            for (let candidate in this.candidates) {
                let box = $("<div>").addClass("indented")

                if (depth <= 0) {
                    box.text("...")
                } else {
                    this.candidates[candidate]
                        .html(false,
                            isActive
                                ? $("<input type='button'>").attr("value", candidate).on("click", (e) => {
                                    activateTree(this.candidates[candidate], activePath.concat([[candidate, this.candidates[candidate]]]))
                                })
                                : $("<span>").text(`${candidate} -> `),
                            depth - 1
                        )
                        .appendTo(box)
                }

                box.appendTo(outer)
            }
        }

        return outer
    }
}


let solutions = (function () {
    function solved(spots: number[], instruction: string = "Solved!"): DecisionTree {
        return new DecisionTree(`${instruction} (${spots.join(", ")})`, spots)
    }

    function tr(instruction: string,
                candidates: number[] | Dict<DecisionTree>) {
        return new DecisionTree(instruction, candidates)
    }


    return {
        "falador": tr("Teleport to Falador (A)",
            {
                "A3": solved([1, 2, 3, 4]),
                "A2": tr("Go to B", {
                    "B3": solved([5, 6]),
                    "B2": tr("Go to C", {
                        "C2": tr("Go to D", {
                            "D2": tr("Go to E", {
                                "E2": solved([10]),
                                "E1": solved([9]),
                            }),
                            "D1": solved([8])
                        }),
                        "C1": solved([7])
                    })
                }),
                "A1": tr("Go to B", {
                    "B2": solved([10, 11, 12]),
                    "B1": solved([13, 14, 15, 16, 17, 18])
                })
            }),
        "zanaris": tr("Teleport to fairy ring (A)", {
            "A3": solved([1, 2, 3, 4]),
            "A2": tr("2 tiles northwest (B)", {
                "B3": solved([10]),
                "B2": tr("Dive to C (western entrance to the wheat field)", {
                    "C3": solved([5, 6, 7]),
                    "C2": tr("Go to D", {
                        "D3": solved([8, 9, 10]),
                        "D2": tr("Go to E (11 squares southwest)", {
                            "E3": solved([11]),
                            "E2": solved([12])
                        }),
                        "D1": solved([14, 15])
                    }),
                    "C1":
                        tr("Go to D", {
                            "D2": solved([13]),
                            "D1": solved([16])
                        })
                }),
                "B1":
                    solved([17])
            }),
            "A1":
                tr("Slayer Cape to Chaeldar (F)", {
                    "F3": solved([18]),
                    "F2": solved([19]),
                    "F1": solved([20, 21, 22], "Spot is at the cosmic altar (G)."),
                })
        }),
        "dorgeshkaan": tr("Upper or lower floor?", {
                "Lower Floor": tr("Sphere 2 (South, Spot A)", {
                    "A3": solved([1, 2, 3, 4, 5]),
                    "A2": tr("Go to B (gate to the , 3 tiles)", {
                        "B3": solved([6]),
                        "B2": solved([7])
                    }),
                    "A1": tr("Go to C (on top of the western stairs)", {
                        "C2": tr("Go to E (around the pond)", {
                            "E3": solved([8, 9]),
                            "E2": solved([10])
                        }),
                        "C1": tr("Go down the northern stairs (D)", {
                            "D2": solved([11], "Solved, run north."),
                            "D1": solved([12], "Solved, run north.")
                        })
                    })
                }),
                "Upper Floor": tr("Sphere 4 (West, Spot F)", {
                    "F3": solved([13]),
                    "F2": tr("Go to G (top of the stairs)", {
                        "G3": solved([14]),
                        "G2": tr("Surge to H", {
                            "H3": solved([15]),
                            "H2": solved([19], "It's east, use sphere 3"),
                        })
                    }),
                    "F1": tr("Surge to H", {
                        "H2": solved([16, 17], "Either of the two, check in order."),
                        "H1": tr("Dive to I", {
                            "I2": solved([18], "It's east, use sphere 3"),
                            "I1": solved([20], "It's south east, use sphere 2"),
                        })
                    })
                })
            },
        ),
        "varrock": tr("Teleport to Varrock (A)", {
            "A3": solved([1, 2, 3]),
            "A2": tr("Go to B (10 tiles south east)", {
                "B3": solved([4, 5, 6]),
                "B2": tr("Go to C (east of the cages)", {
                    "C3": solved([9], "South east!"),
                    "C2": solved([8], "Museum (Dave 6)"),
                    "C1": solved([7], "Courtyard, Varrock Tele"),
                }),
                "B1": solved([10, 11, 12], "Collector (9-8) or Grand Exchange"),
            }),
            "A1": tr("Go to B (10 tiles south east)", {
                "B2": solved([13, 14, 15, 16], "Along the southern wall."),
                "B1": tr("Go to D (slightly east)", {
                    "D2": solved([17, 18], "South eastern area."),
                    "D1": tr("Daves' Spellbook 6 (E)", {
                        "E2": solved([23, 24], "Estate Agent or castle center"),
                        "E1": solved([19, 20, 21, 22], "Teleport to GE"),
                    }),
                }),
            })
        })
    }
})()


//check if we are running inside alt1 by checking if the alt1 global exists
if (window.alt1) {
    //tell alt1 about the app
    //this makes alt1 show the add app button when running inside the embedded browser
    //also updates app settings if they are changed
    alt1.identifyAppUrl("./appconfig.json");
}


let activePath: [string, DecisionTree][] = []

function activateTree(tree: DecisionTree, path: [string, DecisionTree][]) {
    activePath = path
    let bc = $("#solutionpath").empty()

    for (const p of path) {
        $("<li>").addClass("breadcrumb-item").text(p[0])
            .appendTo(bc)
    }

    bc.children().last().addClass("active")

    $("#solutiontext").empty()
        .append(tree.html(true, null, 4))

}

document.addEventListener("DOMContentLoaded", (e) => {


    let mapview = document.querySelector("#mapview")
    let buttons = document.querySelectorAll(".scanselection")

    for (let i = 0; i < buttons.length; i++) {
        let el = (<HTMLInputElement>buttons.item(i))

        el.addEventListener("click", (e) => {
            mapview.setAttribute("src", `./img/${el.dataset.scanid}.data.png`)

            const tree = solutions[el.dataset.scanid]
            activateTree(tree, [[el.value, tree]])
        })
    }
})

