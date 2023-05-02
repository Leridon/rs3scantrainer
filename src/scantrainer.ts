import {ClueStep, ClueTier, ClueType, SetSolution, SimpleSolution, Solution, VariantSolution} from "./clues";
import * as fuzzysort from "fuzzysort";
import {clues} from "./data/clues";
import {HowTo, Method} from "./methods";
import {storage} from "./storage";
import {ClueReader} from "./skillbertssolver/reader";
import {forClue} from "./data/methods";
import {GameMapControl, MarkerLayer, TileMarker} from "./map";
import * as leaflet from "leaflet";
import {ClueSolution} from "./skillbertssolver/cluesolver/textclue";

let icons = {
    tiers: {
        easy: "img/icons/sealedeasy.png",
        medium: "img/icons/sealedmedium.png",
        hard: "img/icons/sealedhard.png",
        elite: "img/icons/sealedelite.png",
        master: "img/icons/sealedmaster.png",
    },
    types: {
        "anagram": "img/icons/activeclue.png",
        "compass": "img/icons/arrow.png",
        "coordinates": "img/icons/sextant.png",
        "cryptic": "img/icons/activeclue.png",
        "emote": "img/icons/emotes.png",
        "image": "img/icons/map.png",
        "scan": "img/icons/scan.png",
        "simple": "img/icons/activeclue.png",
        "skilling": "img/icons/activeclue.png"
    }
}


type UIState = {
    clue: ClueStep,
    method: Method
}

let uiState: UIState = {
    clue: null,
    method: null
}

class FilterControl {
    private searchFilter = new storage.Variable("preferences/cluefilters",
        {
            tiers: {
                easy: true,
                medium: true,
                hard: true,
                elite: true,
                master: true
            },
            types: {
                compass: true,
                coordinates: true,
                cryptic: true,
                emote: true,
                image: true,
                scan: true,
                simple: true,
                skilling: true,
            }
        }
    )

    private filters_visible: boolean = false

    constructor(private search: SearchControl) {
        $("#filters").hide()

        $(".filterbutton").each((i, e) => {
            let element = $(e)

            if (this.searchFilter.value.types[element.attr("data-type")] ||
                this.searchFilter.value.tiers[element.attr("data-tier")]) {
                element.addClass("active")
            }
        })

        $(".togglebutton").on("click", (e) => {
                let target = $(e.currentTarget)

                if (target.hasClass("active")) target.removeClass("active")
                else target.addClass("active")
            }
        )

        $("#filtertoggle").on("click", (e) => {
            this.filters_visible = !this.filters_visible

            if (this.filters_visible) $("#filters").show()
            else $("#filters").hide()
        })

        $(".filterbutton").on("click", (e) => {
            let target = $(e.currentTarget)

            let type = target.attr("data-type");
            let tier = target.attr("data-tier");

            if (type) this.searchFilter.value.types[type] = !this.searchFilter.value.types[type]
            else this.searchFilter.value.tiers[tier] = !this.searchFilter.value.tiers[tier]

            this.searchFilter.save()

            this.update()
            this.search.update()
        })

        this.update()
    }

    private candidates: ClueStep[] = clues

    private update() {
        this.candidates = clues.filter((c) =>
            (c.tier == null || this.searchFilter.value.tiers[c.tier]) && this.searchFilter.value.types[c.type]
        )

        console.log(this.candidates.length)
    }

    getCandidates() {
        return this.candidates
    }
}

class SearchControl {
    private filter = new FilterControl(this)

    private search_box =

        $("#cluesearchbox")
            .on("input", (e) => {
                this.update()
            })
            .on("focusin", () => {
                this.search_results.show()
                this.search_box.val("")
                this.update()
            })
            .on("focusout", (e) => {
                let reltgt = $(e.relatedTarget)

                if (reltgt.hasClass("cluesearchresult") && reltgt.data("clue")) {
                    this.scantrainer.select(reltgt.data("clue"))
                    this.search_box.val("")
                }

                this.search_results.hide()
            })

    private search_results = $("#searchresults").hide()
        .on("click", (e) => {
            if ($(e.target).data("clue")) {
                this.scantrainer.select($(e.target).data("clue"))
                this.search_box.val("")
            }
        })

    constructor(private scantrainer: ScanTrainer) {
        $(".filterbutton").each((i, e) => {
            let src = ""

            if ($(e).data().type) {
                src = icons.types[$(e).data().type]
            } else if ($(e).data().tier) {
                src = icons.tiers[$(e).data().tier]
            }

            $(e).children("img").first().attr("src", src)
        })
    }

    update() {
        let term = this.search_box.val() as string

        console.log()

        let results = fuzzysort.go(term, this.filter.getCandidates(), {
            key: "clue",
            all: true
        })

        let box = this.search_results.empty()

        for (let e of results) {
            $("<div>")
                .addClass("cluesearchresult")
                .attr("tabindex", -1)
                .data("clue", e.obj).text(e.target).appendTo(box)
        }
    }
}

class HowToTabControls {
    preferred = new storage.Variable<string[]>("preferences/preferredtabs", [])

    constructor() {
        $(".methodtab").on("click", (e) => {
            let key = e.target.dataset.methodtype

            let preferred = this.preferred.get()

            let index = preferred.indexOf(key)
            if (index >= 0) preferred.splice(index, 1)
            preferred.unshift(key)

            this.preferred.set(preferred)

            console.log(preferred)

            this.activateHowToTab(key)
        })
    }

    setHowToTabs(howto: HowTo) {
        $(".methodtab").hide()
        $(".methodtabcontent").hide()

        for (let key of Object.keys(howto)) {
            $(`.methodtab[data-methodtype=${key}]`).show()
        }

        // Always show map
        $(`.methodtab[data-methodtype=map]`).show()

        if (howto.text) {
            $("#textmethodcontent").text(howto.text)
        }

        if (howto.video) {
            let video = $("#videoplayer").empty();
            let vid = video.get()[0] as HTMLVideoElement

            vid.pause()
            video.empty()

            video.append($("<source>")
                .attr("src", howto.video.ref)
                .attr("type", "video/mp4"))

            vid.load()
            vid.play()

            $("#videoclipcontributor").text(howto.video.contributor)
        }

        let available_tabs = Object.keys(howto).concat(["map"])
        if (available_tabs.length > 0) {
            let best = this.preferred.get().concat(["map", "video", "text", "scanmap", "image"]).find((e) => e in available_tabs)

            if (best) this.activateHowToTab(best)
            else this.activateHowToTab(available_tabs[0])
        }
    }

    activateHowToTab(key: string) {
        $(".methodtab").removeClass("activetab")
        $(`.methodtab[data-methodtype=${key}]`).addClass("activetab")

        $(".methodtabcontent").hide()
        $(`.methodtabcontent[data-methodtype=${key}]`).show()
    }
}

export class ScanTrainer {
    public map = new GameMapControl("map")
    public search = new SearchControl(this)
    public tabcontrols = new HowToTabControls()
    private cluereader = new ClueReader()

    constructor() {
        this.gotoRoot()

        $("#solvebbutton").on("click", async () => {
            let clue = await this.cluereader.find()

            if (clue) this.select(clue)
        })

        $("#feature_filter").hide() // The filter feature is deactivated for now

        this.tabcontrols.setHowToTabs({})
    }

    gotoRoot() {
        $("#cluesearchpanel").show()
        $("#solutionpanel").hide()

        uiState.clue = null
        uiState.method = null
    }

    select(clue: ClueStep) {
        console.log(clue)

        $("#searchresults").hide()
        $("#solutionpanel").show()

        $("#cluetext").text(clue.clue)

        console.log(icons.tiers[clue.tier])
        console.log(icons.types[clue.type])

        $("#activecluetier").attr("src", clue.tier ? icons.tiers[clue.tier] : "")
        $("#activecluetype").attr("src", icons.types[clue.type])

        if (clue.solution && false) {
            // TODO: Reenable solutions when they are ready.
            $("#cluesolution").show()

            if (clue.solution.type == "simple") {
                // TODO: Display coordinates with map
                $("#cluesolutioncontent").text((clue.solution as SimpleSolution).answer)
            }
            // TODO: Display other solution types.
        } else {
            $("#cluesolution").hide()
        }

        function getSolutionLayer(solution: Solution) {
            if (clue.solution) {
                switch (clue.solution.type) {
                    case "coordset":
                        return new MarkerLayer((solution as SetSolution).candidates.map((e) => {
                            return new TileMarker(e).withMarker().withX("#B21319")
                        }))
                    case "simple":
                        return new MarkerLayer([
                            new TileMarker((solution as SimpleSolution).coordinates).withMarker().withX("#B21319")
                        ])
                    case "variants":
                        // TODO: Properly handle variant solutions
                        return getSolutionLayer((solution as VariantSolution).variants[0].solution)

                }
            }
        }

        this.map.setSolutionLayer(getSolutionLayer(clue.solution))

        let methods = forClue(clue)

        this.map.resetMethodLayers()
        // TODO: Handle more than 1 method
        if (methods.length > 0) {
            this.setMethod(methods[0])
        } else {
            $("#cluemethod").hide()
            this.tabcontrols.setHowToTabs({})
        }
    }

    setMethod(method: Method) {
        $(".cluemethodcontent").hide()
        method.sendToUi(this)
        $(`.cluemethodcontent[data-methodtype=${method.type}]`).show()

        $("#cluemethod").show()
        this.tabcontrols.setHowToTabs(method.howto())
    }
}

export let scantrainer: ScanTrainer = null

export function initialize() {
    scantrainer = new ScanTrainer()
    scantrainer.select(clues.find((c) => c.id == 361)) // zanaris
    scantrainer.select(clues.find((c) => c.id == 399)) // compass
}